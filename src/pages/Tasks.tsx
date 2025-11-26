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
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Enhanced Smart Tasks with Weekly Schedule Strip
 * - Shows weekly calendar strip with checkboxes for each day's tasks
 * - When task is created/updated, automatically creates linked calendar event
 * - Maintains daily streak tracking
 */
export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
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
      // Load both completed tasks and completed events
      query = query.eq('is_completed', true);
      const { data: taskData } = await query;
      
      // Also fetch completed events from calendar
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('event_date', { ascending: false });
      
      // Combine tasks and events, treating events as tasks
      const combinedData = [
        ...(taskData || []),
        ...(eventData || []).map(event => ({
          ...event,
          title: event.title,
          description: event.notes || '',
          category: event.event_type,
          subject: event.subject || '',
          deadline: new Date(event.event_date + (event.start_time ? 'T' + event.start_time : 'T00:00:00')).toISOString(),
          priority: 'medium',
          is_completed: event.is_completed,
          completed_at: event.completed_at
        }))
      ].sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());
      
      setTasks(combinedData);
      return;
    } else {
      query = query.eq('is_completed', false);
    }

    const { data } = await query;
    if (data) setTasks(data);
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

  const openDayDialog = (date: Date) => {
    setSelectedDayDate(date);
    setIsDayDialogOpen(true);
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

    toast({ title: 'Success', description: 'Task created successfully' });
    setIsDialogOpen(false);
    setSelectedDate(null);
    setFormData({ title: '', description: '', category: 'Study', subject: '', deadline: '', priority: 'medium' });
    loadTasks();
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
          const isToday = isSameDay(day, new Date());
          const dayName = format(day, 'EEEE');
          const shortDay = format(day, 'EEE');
          const dateNum = format(day, 'd');
          
          return (
            <Card
              key={idx}
              className={`glass-strong cursor-pointer hover:border-primary/50 transition-all ${
                isToday ? 'border-primary border-2' : ''
              }`}
              onClick={() => openDayDialog(day)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddTaskDialog(day);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[200px]">
                {/* Task Count */}
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {dayTasks.length === 0 ? (
                      <>No tasks</>
                    ) : (
                      <>
                        {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-primary mt-2">Click to view</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Day Details Dialog */}
      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent className="glass-strong max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDayDate && format(selectedDayDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDayDate && (
            <div className="space-y-4">
              {/* Add Task Button */}
              <Button 
                onClick={() => {
                  setIsDayDialogOpen(false);
                  openAddTaskDialog(selectedDayDate);
                }}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task for This Day
              </Button>

              {/* Tasks Section */}
              {getTasksForDay(selectedDayDate).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">Tasks</h3>
                  {getTasksForDay(selectedDayDate).map((task) => (
                    <div
                      key={`task-${task.id}`}
                      className="p-3 rounded-lg glass border"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => toggleComplete(task)}
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
              )}

              {/* Empty State */}
              {getTasksForDay(selectedDayDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks or events for this day</p>
                  <p className="text-sm mt-2">Click "Add Task" to create one</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
