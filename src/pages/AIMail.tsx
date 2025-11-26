import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, FileText, AlertCircle, ListChecks, Sparkles } from 'lucide-react';

/**
 * AI Gmail/Classroom Analyzer
 * - Connect buttons for future OAuth integration
 * - Text input area to paste email/announcement content
 * - Analyze button that extracts important alerts, deadlines, tasks
 * - Backend endpoint /api/analyzeMessages would call AI API in production
 */
export default function AIMail() {
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    alerts: string[];
    tasks: string[];
    summary: string;
  } | null>(null);
  const { toast } = useToast();

  // Mock AI analysis - in production, call backend /api/analyzeMessages
  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste some text to analyze',
        variant: 'destructive'
      });
      return;
    }

    setAnalyzing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock extraction logic - in production, AI would parse this
      const mockAlerts = [];
      const mockTasks = [];

      // Simple keyword detection for demo
      if (inputText.toLowerCase().includes('deadline') || inputText.toLowerCase().includes('due')) {
        mockAlerts.push('⚠️ Deadline detected in message');
        mockTasks.push('Complete assignment mentioned in email');
      }
      if (inputText.toLowerCase().includes('exam') || inputText.toLowerCase().includes('test')) {
        mockAlerts.push('📝 Exam/Test notification found');
        mockTasks.push('Prepare for upcoming exam');
      }
      if (inputText.toLowerCase().includes('fee') || inputText.toLowerCase().includes('payment')) {
        mockAlerts.push('💰 Fee/Payment reminder detected');
        mockTasks.push('Pay college fees before due date');
      }
      if (inputText.toLowerCase().includes('class') || inputText.toLowerCase().includes('lecture')) {
        mockAlerts.push('🎓 Class/Lecture update found');
      }
      if (inputText.toLowerCase().includes('submission')) {
        mockAlerts.push('📤 Submission deadline detected');
        mockTasks.push('Submit assignment/project');
      }

      // Default messages if nothing detected
      if (mockAlerts.length === 0) {
        mockAlerts.push('ℹ️ General information message');
      }

      setResults({
        alerts: mockAlerts,
        tasks: mockTasks.length > 0 ? mockTasks : ['No specific tasks detected'],
        summary: inputText.length > 150
          ? inputText.substring(0, 150) + '...'
          : inputText
      });

      setAnalyzing(false);
      toast({
        title: 'Analysis Complete',
        description: `Found ${mockAlerts.length} alerts and ${mockTasks.length} tasks`
      });
    }, 1500);
  };

  const handleConnectGmail = () => {
    toast({
      title: 'Coming Soon',
      description: 'Gmail OAuth integration will be implemented using Google APIs'
    });
  };

  const handleConnectClassroom = () => {
    toast({
      title: 'Coming Soon',
      description: 'Google Classroom integration will be implemented using Google APIs'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Gmail & Classroom Analyzer</h1>

      {/* Connection Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-strong hover:border-primary/50 transition-all cursor-pointer" onClick={handleConnectGmail}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Connect Gmail</h3>
              <p className="text-sm text-muted-foreground">
                Auto-analyze emails for deadlines
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong hover:border-primary/50 transition-all cursor-pointer" onClick={handleConnectClassroom}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Connect Google Classroom</h3>
              <p className="text-sm text-muted-foreground">
                Extract assignments and due dates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Section */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Paste Email or Announcement Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste email content, classroom announcements, or any college communication here..."
            className="min-h-[200px] bg-background/50"
          />
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !inputText.trim()}
            className="w-full gap-2"
          >
            {analyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Messages
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Important Alerts */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Important Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.alerts.map((alert, idx) => (
                  <div key={idx} className="p-3 glass rounded-lg border border-glass-border">
                    <p className="text-sm">{alert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detected Tasks */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="w-5 h-5 text-primary" />
                Tasks from Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.tasks.map((task, idx) => (
                  <div key={idx} className="p-3 glass rounded-lg border border-glass-border flex items-start gap-2">
                    <p className="text-sm flex-1">{task}</p>
                    {task !== 'No specific tasks detected' && (
                      <Button size="sm" variant="outline" className="text-xs">
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="glass-strong md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{results.summary}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Note */}
      <Card className="glass border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a preview interface. In production, the backend endpoint 
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">/api/analyzeMessages</code> 
            would call an AI API to intelligently extract deadlines, tasks, and important information 
            from your emails and classroom announcements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}