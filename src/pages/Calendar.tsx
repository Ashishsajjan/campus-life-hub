import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced Calendar - Google Calendar style
 * - Month/Week/Day view tabs
 * - Click on date to create event
 * - Shows tasks from Task Manager
 * - Creates events that sync with tasks
 * - Link to Subject Notes
 */
export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDayDialogOpen, setIsViewDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Study',
    subject: '',
    deadline: '',
    priority: 'medium'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    loadTasks();
  }, []);

  const loadEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setEvents(data);
  };

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('deadline');

    if (data) setTasks(data);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsViewDayDialogOpen(true);
  };

  const openCreateTaskDialog = (date: Date) => {
    setSelectedDate(date);
    const defaultDeadline = new Date(date);
    defaultDeadline.setHours(9, 0, 0, 0);
    setFormData({
      ...formData,
      deadline: format(defaultDeadline, "yyyy-MM-dd'T'HH:mm")
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const deadlineDate = new Date(formData.deadline);

    const { error } = await supabase.from('tasks').insert({
      ...formData,
      user_id: user.id,
      deadline: deadlineDate.toISOString()
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Task created successfully' });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Study',
        subject: '',
        deadline: '',
        priority: 'medium'
      });
      loadTasks();
    }
  };

  const toggleTaskComplete = async (task: any) => {
    const newCompleted = !task.is_completed;
    
    const { error } = await supabase
      .from('tasks')
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq('id', task.id);

    if (!error) {
      loadTasks();
    }
  };

  // Get events and tasks for a specific date
  const getItemsForDate = (date: Date) => {
    const dateEvents = events.filter(e => isSameDay(new Date(e.event_date), date));
    const dateTasks = tasks.filter(t => isSameDay(new Date(t.deadline), date));
    return { events: dateEvents, tasks: dateTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) };
  };

  // Month view calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventTypeColors: Record<string, string> = {
    exam: 'bg-destructive/20 text-destructive',
    assignment: 'bg-primary/20 text-primary',
    class: 'bg-secondary/20 text-secondary',
    meeting: 'bg-accent/20 text-accent',
    submission: 'bg-primary/20 text-primary',
    personal: 'bg-muted/50 text-foreground'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/files')}
          >
            Subject Notes
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Study">Study</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-background/50"
                    placeholder="e.g., DSA, DBMS, Physics"
                  />
                </div>
                <div>
                  <Label>Deadline (Date & Time)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full">Create Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Tabs + Navigation */}
      <Card className="glass-strong">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              {(['month', 'week', 'day'] as const).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView(v)}
                  className="capitalize"
                >
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold min-w-[150px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month View */}
      {view === 'month' && (
        <Card className="glass-strong">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm p-2 text-muted-foreground">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const { events: dayEvents, tasks: dayTasks } = getItemsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                      isToday ? 'border-primary bg-primary/10' : 'border-glass-border'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded ${eventTypeColors[event.event_type]} truncate`}
                        >
                          {event.start_time && `${event.start_time} `}
                          {event.title}
                        </div>
                      ))}
                      {dayTasks.slice(0, 1).map((task) => (
                        <div
                          key={task.id}
                          className="text-xs p-1 rounded bg-accent/20 text-accent truncate"
                        >
                          📋 {task.title}
                        </div>
                      ))}
                      {(dayEvents.length + dayTasks.length) > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length + dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week/Day views - simplified for now */}
      {(view === 'week' || view === 'day') && (
        <Card className="glass-strong">
          <CardContent className="pt-6 text-center text-muted-foreground">
            {view === 'week' ? 'Week' : 'Day'} view coming soon - Use month view for now
          </CardContent>
        </Card>
      )}

      {/* View Day Dialog */}
      <Dialog open={isViewDayDialogOpen} onOpenChange={setIsViewDayDialogOpen}>
        <DialogContent className="glass-strong max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4">
              {/* Add Task Button */}
              <Button 
                onClick={() => {
                  setIsViewDayDialogOpen(false);
                  openCreateTaskDialog(selectedDate);
                }}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task for This Day
              </Button>

              {/* Tasks Section */}
              {getItemsForDate(selectedDate).tasks.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">Tasks</h3>
                  {getItemsForDate(selectedDate).tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg glass border"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => toggleTaskComplete(task)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${
                            task.is_completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(task.deadline), 'HH:mm')}
                            {task.subject && ` • ${task.subject}`}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                          task.priority === 'medium' ? 'bg-primary/20 text-primary' :
                          'bg-secondary/20 text-secondary'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks for this day
                </div>
              )}

              {/* Events Section */}
              {getItemsForDate(selectedDate).events.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-sm text-muted-foreground">Events</h3>
                  {getItemsForDate(selectedDate).events.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-accent/20 border border-accent/30"
                    >
                      <p className="font-medium">{event.title}</p>
                      {event.start_time && (
                        <p className="text-sm text-muted-foreground">{event.start_time}</p>
                      )}
                      {event.subject && (
                        <p className="text-sm text-muted-foreground">{event.subject}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
