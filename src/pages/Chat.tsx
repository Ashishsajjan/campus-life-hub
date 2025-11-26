import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you with government schemes, college fees, study schedules, or finding places near you. How can I help today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const quickChips = [
    "Explain a government scheme",
    "Help with college fees options",
    "Plan my study schedule",
    "Find PG near college"
  ];

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    setMessages([...messages, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    // Mock AI response - in real implementation, call edge function
    setTimeout(() => {
      let response = "I'm here to help! ";
      
      if (text.toLowerCase().includes('scheme') || text.toLowerCase().includes('government')) {
        response += "India has several student-focused schemes like National Scholarship Portal (NSP), PM-YASASVI, and state-specific scholarships. Would you like details about any specific scheme?";
      } else if (text.toLowerCase().includes('fees') || text.toLowerCase().includes('loan')) {
        response += "For college fees, you can explore education loans from banks, scholarships, and fee waiver programs. Many colleges also offer installment plans.";
      } else if (text.toLowerCase().includes('study') || text.toLowerCase().includes('schedule')) {
        response += "For effective study planning, I recommend using the Smart Tasks and Pomodoro features. Break your study into focused sessions with regular breaks.";
      } else if (text.toLowerCase().includes('pg') || text.toLowerCase().includes('hostel') || text.toLowerCase().includes('location')) {
        response += "To find PG accommodations or other places near you, please use the Locations tab where you can search for nearby PGs, hostels, mess facilities, and more using your GPS location!";
      } else {
        response += "I can help with information about government schemes, scholarships, study planning, and guide you to find nearby facilities. What would you like to know more about?";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>

      <Card className="glass-strong flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-6">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'glass border border-glass-border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass border border-glass-border p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Chips */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {quickChips.map((chip, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(chip)}
                  className="text-xs"
                >
                  {chip}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="bg-background/50"
              disabled={loading}
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}