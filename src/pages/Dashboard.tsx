import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Flame, ListChecks, Calendar, MapPin, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pomodoroToday, setPomodoroToday] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load streak data
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settings) {
      setStreak({ current: settings.current_streak || 0, best: settings.best_streak || 0 });
      setPomodoroToday(settings.pomodoro_sessions_today || 0);
    }

    // Load upcoming events from calendar (only non-completed)
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .gte('event_date', format(new Date(), 'yyyy-MM-dd'))
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Load upcoming tasks (only non-completed)
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .gte('deadline', new Date().toISOString())
      .order('deadline', { ascending: true });

    // Combine events and tasks, convert tasks to event format
    const combinedItems = [
      ...(events || []).map(event => ({
        ...event,
        type: 'event',
        display_date: event.event_date,
        display_time: event.start_time
      })),
      ...(tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        subject: task.subject || task.category,
        event_type: task.category.toLowerCase(),
        is_completed: task.is_completed,
        type: 'task',
        display_date: format(new Date(task.deadline), 'yyyy-MM-dd'),
        display_time: format(new Date(task.deadline), 'HH:mm')
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.display_date + 'T' + (a.display_time || '00:00:00'));
      const dateB = new Date(b.display_date + 'T' + (b.display_time || '00:00:00'));
      return dateA.getTime() - dateB.getTime();
    }).slice(0, 5);

    setUpcomingEvents(combinedItems);
  };

  const toggleEventComplete = async (item: any) => {
    const newCompleted = !item.is_completed;
    const tableName = item.type === 'event' ? 'events' : 'tasks';
    
    const { error } = await supabase
      .from(tableName)
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq('id', item.id);

    if (!error) {
      loadDashboardData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-strong border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text">{streak.current} days</div>
            <p className="text-xs text-muted-foreground mt-1">Best: {streak.best} days</p>
          </CardContent>
        </Card>

        <Card className="glass-strong border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pomodoro Today</CardTitle>
            <Timer className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pomodoroToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Sessions completed</p>
          </CardContent>
        </Card>

        <Card className="glass-strong">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Upcoming Events
            <span className="text-sm font-normal text-muted-foreground">({upcomingEvents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground">No upcoming events</p>
          ) : (
            upcomingEvents.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 glass rounded-xl">
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={() => toggleEventComplete(item)}
                />
                <div className="flex-1">
                  <p className={`font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.subject} • {format(new Date(item.display_date), 'MMM d')}
                    {item.display_time && ` • ${item.display_time}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.event_type === 'exam' || item.event_type === 'study' ? 'bg-destructive/20 text-destructive' :
                  item.event_type === 'class' ? 'bg-secondary/20 text-secondary' :
                  'bg-primary/20 text-primary'
                }`}>
                  {item.event_type}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/tasks">
            <Button className="w-full" variant="outline">
              <ListChecks className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </Link>
          <Link to="/pomodoro">
            <Button className="w-full" variant="outline">
              <Timer className="mr-2 h-4 w-4" />
              Start Pomodoro
            </Button>
          </Link>
          <Link to="/calendar">
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Open Calendar
            </Button>
          </Link>
          <Link to="/locations">
            <Button className="w-full" variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Find Locations
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}