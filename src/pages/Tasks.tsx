import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

/**
 * Enhanced Smart Tasks with Weekly Schedule Strip
 * - Shows weekly calendar strip with checkboxes for each day's tasks
 * - When task is created/updated, automatically creates linked calendar event
 * - Maintains daily streak tracking
 */
export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Get current week dates (Mon-Sun)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadTasks();
    loadEvents();
  }, [filter]);

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline');

    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query = query.gte('deadline', today.toISOString()).lt('deadline', tomorrow.toISOString());
    } else if (filter === 'week') {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      query = query.gte('deadline', today.toISOString()).lt('deadline', nextWeek.toISOString());
    } else if (filter === 'overdue') {
      query = query.lt('deadline', new Date().toISOString()).eq('is_completed', false);
    } else if (filter === 'completed') {
      query = query.eq('is_completed', true);
    } else {
      query = query.eq('is_completed', false);
    }

    const { data } = await query;
    if (data) setTasks(data);
  };

  const loadEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load events for current week
    const weekEnd = addDays(weekStart, 7);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', format(weekStart, 'yyyy-MM-dd'))
      .lt('event_date', format(weekEnd, 'yyyy-MM-dd'))
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setEvents(data);
  };

  const openAddTaskDialog = (date: Date) => {
    setSelectedDate(date);
    // Set default deadline to selected date at 9 AM
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

    // Insert task
    const { data: taskData, error: taskError } = await supabase.from('tasks').insert({
      ...formData,
      user_id: user.id,
      deadline: deadlineDate.toISOString()
    }).select().single();

    if (taskError) {
      toast({ title: 'Error', description: taskError.message, variant: 'destructive' });
      return;
    }

    // Create linked calendar event for this task
    const { error: eventError } = await supabase.from('events').insert({
      user_id: user.id,
      title: formData.title,
      event_type: 'assignment',
      event_date: format(deadlineDate, 'yyyy-MM-dd'),
      start_time: format(deadlineDate, 'HH:mm'),
      end_time: format(deadlineDate, 'HH:mm'),
      subject: formData.subject,
      notes: `Task deadline: ${formData.description}`
    });

    if (eventError) {
      console.log('Could not create calendar event:', eventError);
    }

    toast({ title: 'Success', description: 'Task created and added to calendar' });
    setIsDialogOpen(false);
    setSelectedDate(null);
    setFormData({ title: '', description: '', category: 'Study', subject: '', deadline: '', priority: 'medium' });
    loadTasks();
    loadEvents();
  };

  const toggleComplete = async (task: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newCompleted = !task.is_completed;
    
    const { error } = await supabase
      .from('tasks')
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq('id', task.id);

    if (!error) {
      // Update streak if task completed today
      if (newCompleted) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        const today = format(new Date(), 'yyyy-MM-dd');
        
        if (!settings) {
          await supabase.from('user_settings').insert({
            user_id: user.id,
            current_streak: 1,
            best_streak: 1,
            last_completion_date: today
          });
        } else if (settings.last_completion_date !== today) {
          const newStreak = settings.current_streak + 1;
          await supabase
            .from('user_settings')
            .update({
              current_streak: newStreak,
              best_streak: Math.max(newStreak, settings.best_streak),
              last_completion_date: today
            })
            .eq('user_id', user.id);
        }
      }
      
      loadTasks();
    }
  };

  // Get tasks and events for a specific day in sequential order
  const getTasksForDay = (day: Date) => {
    return tasks
      .filter(task => isSameDay(new Date(task.deadline), day))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const getEventsForDay = (day: Date) => {
    return events
      .filter(event => isSameDay(new Date(event.event_date), day))
      .sort((a, b) => {
        // Sort by start_time if available
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return 0;
      });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Smart Tasks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

      {/* Weekly Day Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const dayTasks = getTasksForDay(day);
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const dayName = format(day, 'EEEE');
          const shortDay = format(day, 'EEE');
          const dateNum = format(day, 'd');
          
          return (
            <Card
              key={idx}
              className={`glass-strong ${
                isToday ? 'border-primary border-2' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{shortDay}</CardTitle>
                    <p className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                      {dateNum}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openAddTaskDialog(day)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[200px]">
                {/* Calendar Events */}
                {dayEvents.map((event) => (
                  <div
                    key={`event-${event.id}`}
                    className="p-2 rounded-lg bg-accent/20 text-accent border border-accent/30"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs">📅</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{event.title}</p>
                        {event.start_time && (
                          <p className="text-xs text-muted-foreground">{event.start_time}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Tasks */}
                {dayTasks.map((task) => (
                  <div
                    key={`task-${task.id}`}
                    className="p-2 rounded-lg glass border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => toggleComplete(task)}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                          task.is_completed
                            ? 'bg-primary border-primary'
                            : 'border-foreground/40 bg-background hover:border-primary/60'
                        }`}
                      >
                        {task.is_completed && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${
                          task.is_completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(task.deadline), 'HH:mm')}
                          {task.subject && ` • ${task.subject}`}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                        task.priority === 'medium' ? 'bg-primary/20 text-primary' :
                        'bg-secondary/20 text-secondary'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
                
                {dayTasks.length === 0 && dayEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>No tasks yet</p>
                    <p className="text-xs mt-1">Click + to add</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'today', 'week', 'overdue', 'completed'].map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'outline'}
            className="capitalize"
          >
            {f === 'week' ? 'This Week' : f}
          </Button>
        ))}
      </div>

      {/* Detailed Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="glass-strong">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No tasks found
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="glass-strong hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleComplete(task)}
                  className={task.is_completed ? 'text-primary' : ''}
                >
                  <Check className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className={`font-semibold ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap text-xs">
                        {task.subject && (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded-md">
                            {task.subject}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-muted/50 rounded-md">
                          {task.category}
                        </span>
                        <span className={`px-2 py-1 rounded-md ${
                          task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                          task.priority === 'medium' ? 'bg-primary/20 text-primary' :
                          'bg-secondary/20 text-secondary'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">
                        {format(new Date(task.deadline), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(task.deadline), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
