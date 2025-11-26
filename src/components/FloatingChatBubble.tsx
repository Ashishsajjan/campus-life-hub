import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Floating AI Chat Bubble - persistent chat widget available on all pages
 * Opens a slide-up panel with conversation history and input
 */
export const FloatingChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm LifeHub AI. I can help you with government schemes, study planning, college info, and finding places near you. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const quickChips = [
    "Explain a government scheme",
    "Help with college fees",
    "Plan study schedule",
    "Find PG near college"
  ];

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    setMessages([...messages, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    // Mock AI response - in production, call backend /api/chat endpoint
    setTimeout(() => {
      let response = "I'm here to help! ";
      
      if (text.toLowerCase().includes('scheme') || text.toLowerCase().includes('government')) {
        response += "India has several student-focused schemes like National Scholarship Portal (NSP), PM-YASASVI, and state-specific scholarships. Would you like details about any specific scheme?";
      } else if (text.toLowerCase().includes('fees') || text.toLowerCase().includes('loan')) {
        response += "For college fees, explore education loans from banks, scholarships, and fee waiver programs. Many colleges also offer installment plans.";
      } else if (text.toLowerCase().includes('study') || text.toLowerCase().includes('schedule')) {
        response += "For effective study planning, use the Smart Tasks and Pomodoro features. Break your study into focused sessions with regular breaks.";
      } else if (text.toLowerCase().includes('pg') || text.toLowerCase().includes('hostel') || text.toLowerCase().includes('location')) {
        response += "To find PG accommodations or nearby facilities, use the Locations tab! It uses your GPS to search for PGs, hostels, mess facilities, and more on Google Maps.";
      } else {
        response += "I can help with government schemes, scholarships, study planning, and guide you to find nearby facilities. What would you like to know?";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Chat Panel - slides up from bottom */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[70vh] md:h-[600px] glass-strong border border-glass-border rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4">
          <CardHeader className="border-b border-glass-border flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              LifeHub AI
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass border border-glass-border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass border border-glass-border p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips - show only on first message */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {quickChips.map((chip, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(chip)}
                    className="text-xs h-7"
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
              <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      )}

      {/* Floating Chat Button - bottom right corner */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 md:right-6 h-14 w-14 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform"
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </Button>
    </>
  );
};
