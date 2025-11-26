import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessionsToday();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleSessionComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, minutes, seconds]);

  const loadSessionsToday = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: settings } = await supabase
      .from('user_settings')
      .select('pomodoro_sessions_today')
      .eq('user_id', user.id)
      .single();

    if (settings) {
      setSessionsToday(settings.pomodoro_sessions_today);
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (sessionType === 'focus') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!settings) {
          await supabase.from('user_settings').insert({
            user_id: user.id,
            pomodoro_sessions_today: 1
          });
        } else {
          await supabase
            .from('user_settings')
            .update({ pomodoro_sessions_today: settings.pomodoro_sessions_today + 1 })
            .eq('user_id', user.id);
        }
        
        setSessionsToday(sessionsToday + 1);
      }

      toast({
        title: 'Focus Session Complete! 🎉',
        description: 'Time for a break!',
      });
      
      // Request notification permission and show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: 'Great focus session! Time for a break.',
          icon: '/favicon.ico'
        });
      }
    } else {
      toast({
        title: 'Break Complete! 💪',
        description: 'Ready for another focus session?',
      });
    }
  };

  const setPreset = (mins: number, type: 'focus' | 'break') => {
    setMinutes(mins);
    setSeconds(0);
    setSessionType(type);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(sessionType === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  const progress = sessionType === 'focus' 
    ? ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100
    : ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pomodoro Timer</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="glass-strong">
            <CardContent className="p-8">
              <div className="text-center space-y-8">
                <div>
                  <p className="text-lg text-muted-foreground mb-2">
                    {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
                  </p>
                  
                  <div className="relative w-64 h-64 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                        className={sessionType === 'focus' ? 'text-primary' : 'text-secondary'}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold gradient-text">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className="w-20 h-20 rounded-full"
                  >
                    {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={resetTimer}
                    className="w-20 h-20 rounded-full"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="glass-strong">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Focus Presets</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPreset(25, 'focus')}
                >
                  25 minutes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPreset(45, 'focus')}
                >
                  45 minutes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPreset(50, 'focus')}
                >
                  50 minutes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Break Presets</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPreset(5, 'break')}
                >
                  5 minutes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPreset(10, 'break')}
                >
                  10 minutes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPreset(15, 'break')}
                >
                  15 minutes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Today's Sessions</h3>
              <p className="text-4xl font-bold gradient-text">{sessionsToday}</p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}