import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, ListChecks, Calendar, MapPin, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
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

    // Load today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .gte('deadline', today.toISOString())
      .lt('deadline', tomorrow.toISOString())
      .order('deadline')
      .limit(3);

    if (tasks) setTodayTasks(tasks);

    // Load today's and upcoming events from calendar
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', format(new Date(), 'yyyy-MM-dd'))
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5);

    if (events) setUpcomingEvents(events);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card className="glass-strong border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending completion</p>
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

      {/* Today's Tasks & Events */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks for today. Great job!</p>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 glass rounded-xl">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.subject}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                    task.priority === 'medium' ? 'bg-primary/20 text-primary' :
                    'bg-secondary/20 text-secondary'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 glass rounded-xl">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.subject} • {format(new Date(event.event_date), 'MMM d')}
                      {event.start_time && ` • ${event.start_time}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.event_type === 'exam' ? 'bg-destructive/20 text-destructive' :
                    event.event_type === 'class' ? 'bg-secondary/20 text-secondary' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {event.event_type}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

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