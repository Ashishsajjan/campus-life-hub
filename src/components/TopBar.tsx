import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export const TopBar = () => {
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const getUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      }
    };
    getUserName();
  }, []);

  return (
    <header className="glass border-b border-glass-border p-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Hi, {userName} 👋</h2>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>
      
      <Avatar className="h-10 w-10 border-2 border-primary">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
};