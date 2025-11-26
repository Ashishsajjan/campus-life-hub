import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  ListChecks, 
  Timer, 
  Calendar, 
  MapPin, 
  Mail, 
  Bookmark, 
  Files,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ListChecks, label: 'Smart Tasks', path: '/tasks' },
  { icon: Timer, label: 'Pomodoro', path: '/pomodoro' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: MapPin, label: 'Locations', path: '/locations' },
  { icon: Mail, label: 'AI Gmail/Classroom', path: '/ai-mail' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  { icon: Files, label: 'Files & Notes', path: '/files' },
];

export const Sidebar = () => {
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 glass-strong border-r border-glass-border p-4 space-y-2">
      <div className="mb-6 p-4">
        <h1 className="text-2xl font-bold gradient-text">CampusLife Hub</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-muted/50"
            activeClassName="bg-primary/20 text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Button
        onClick={handleLogout}
        variant="ghost"
        className="w-full justify-start gap-3"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </Button>
    </aside>
  );
};