import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar, CheckSquare, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * AI Gmail/Classroom Analyzer with Full OAuth Integration
 * - Real OAuth connection to Gmail and Google Classroom
 * - Fetches actual emails and announcements
 * - Displays connected status and data
 */
export default function AIMail() {
  const [inputText, setInputText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [classroomConnected, setClassroomConnected] = useState(false);
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [classroomAnnouncements, setClassroomAnnouncements] = useState<any[]>([]);
  const [fetchingGmail, setFetchingGmail] = useState(false);
  const [fetchingClassroom, setFetchingClassroom] = useState(false);
  const [results, setResults] = useState<{
    alerts: string[];
    tasks: string[];
    summary: string;
  } | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tokens } = await supabase
        .from('oauth_tokens')
        .select('provider')
        .eq('user_id', user.id);

      if (tokens) {
        setGmailConnected(tokens.some(t => t.provider === 'gmail'));
        setClassroomConnected(tokens.some(t => t.provider === 'classroom'));
      }
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-oauth-start', {
        body: { provider: 'gmail' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Open OAuth window
      const authWindow = window.open(data.authUrl, 'gmail-oauth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!authWindow) {
        toast.error("Popup blocked! Please allow popups for this site.");
        return;
      }
      
      // Listen for OAuth success message
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'oauth-success' && event.data.provider === 'gmail') {
          setGmailConnected(true);
          toast.success("Gmail connected successfully!");
          window.removeEventListener('message', messageHandler);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          fetchGmailMessages();
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Check if window closed manually
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          checkConnections(); // Recheck in case auth completed
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error connecting Gmail:', error);
      toast.error(error.message || "Failed to connect Gmail");
    }
  };

  const handleConnectClassroom = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-oauth-start', {
        body: { provider: 'classroom' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Open OAuth window
      const authWindow = window.open(data.authUrl, 'classroom-oauth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!authWindow) {
        toast.error("Popup blocked! Please allow popups for this site.");
        return;
      }
      
      // Listen for OAuth success message
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'oauth-success' && event.data.provider === 'classroom') {
          setClassroomConnected(true);
          toast.success("Google Classroom connected successfully!");
          window.removeEventListener('message', messageHandler);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          fetchClassroomAnnouncements();
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Check if window closed manually
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          checkConnections(); // Recheck in case auth completed
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error connecting Classroom:', error);
      toast.error(error.message || "Failed to connect Google Classroom");
    }
  };

  const fetchGmailMessages = async () => {
    setFetchingGmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-fetch');
      
      if (error) throw error;
      
      setGmailMessages(data.messages || []);
      toast.success(`Fetched ${data.messages?.length || 0} Gmail messages`);
    } catch (error: any) {
      console.error('Error fetching Gmail:', error);
      toast.error(error.message || "Failed to fetch Gmail messages");
    } finally {
      setFetchingGmail(false);
    }
  };

  const fetchClassroomAnnouncements = async () => {
    setFetchingClassroom(true);
    try {
      const { data, error } = await supabase.functions.invoke('classroom-fetch');
      
      if (error) throw error;
      
      setClassroomAnnouncements(data.announcements || []);
      toast.success(`Fetched ${data.announcements?.length || 0} Classroom announcements`);
    } catch (error: any) {
      console.error('Error fetching Classroom:', error);
      toast.error(error.message || "Failed to fetch Classroom announcements");
    } finally {
      setFetchingClassroom(false);
    }
  };

  // Mock AI analysis for pasted text
  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error("Please paste some text to analyze");
      return;
    }

    setAnalyzing(true);

    setTimeout(() => {
      const mockAlerts = [];
      const mockTasks = [];

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

      if (mockAlerts.length === 0) {
        mockAlerts.push('ℹ️ General information message');
      }

      setResults({
        alerts: mockAlerts,
        tasks: mockTasks.length > 0 ? mockTasks : ['No specific tasks detected'],
        summary: inputText.length > 150 ? inputText.substring(0, 150) + '...' : inputText
      });

      setAnalyzing(false);
      toast.success(`Found ${mockAlerts.length} alerts and ${mockTasks.length} tasks`);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Gmail & Classroom Analyzer</h1>

      {/* Connection Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Button
            onClick={gmailConnected ? fetchGmailMessages : handleConnectGmail}
            className="w-full"
            variant={gmailConnected ? "default" : "outline"}
            disabled={fetchingGmail}
          >
            {fetchingGmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {gmailConnected ? "Refresh Gmail" : "Connect Gmail"}
          </Button>
          {gmailConnected && (
            <p className="text-xs text-muted-foreground text-center">✓ Connected</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={classroomConnected ? fetchClassroomAnnouncements : handleConnectClassroom}
            className="w-full"
            variant={classroomConnected ? "default" : "outline"}
            disabled={fetchingClassroom}
          >
            {fetchingClassroom ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            {classroomConnected ? "Refresh Classroom" : "Connect Google Classroom"}
          </Button>
          {classroomConnected && (
            <p className="text-xs text-muted-foreground text-center">✓ Connected</p>
          )}
        </div>
      </div>

      {/* Display Gmail Messages */}
      {gmailMessages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Recent Gmail Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gmailMessages.map((message) => (
              <div key={message.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{message.subject}</h4>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">From: {message.from}</p>
                <p className="text-xs text-muted-foreground">{message.date}</p>
                <p className="text-sm mt-2">{message.snippet}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Display Classroom Announcements */}
      {classroomAnnouncements.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Classroom Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classroomAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{announcement.courseName}</h4>
                </div>
                <p className="text-sm">{announcement.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(announcement.creationTime).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Text Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Text Manually</CardTitle>
          <CardDescription>Paste email or announcement text to analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your email or announcement text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
          />
          <Button onClick={handleAnalyze} disabled={analyzing || !inputText.trim()} className="w-full">
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Analyze Messages
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {results && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.alerts.map((alert, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{alert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks from Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.tasks.map((task, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{task}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
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
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Gmail and Classroom integration uses real OAuth authentication. 
            The text analyzer provides mock analysis for demonstration purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
