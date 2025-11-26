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
      let response = "";
      
      if (text.toLowerCase().includes('scheme') || text.toLowerCase().includes('government')) {
        response += "I'd be happy to help you with government schemes for students! 🎓\n\nIndia offers several excellent scholarship and support schemes:\n\n**National Scholarship Portal (NSP):**\n- A one-stop platform for various scholarships\n- Includes Pre-matric, Post-matric, Merit-cum-Means scholarships\n- Apply online at scholarships.gov.in\n- Eligibility varies by scheme (typically based on family income, marks, category)\n\n**PM-YASASVI Scheme:**\n- For OBC, EBC, and DNT students in classes 9-11\n- Covers tuition fees and other expenses\n- Annual family income limit applies\n\n**State-Specific Scholarships:**\n- Each state has unique schemes\n- Check your state's education portal\n- Often includes SC/ST/OBC scholarships, minority scholarships\n\n**Other Important Schemes:**\n- AICTE Pragati/Saksham for technical education\n- UGC scholarships for higher education\n- Inspire Awards for science students\n\nWould you like detailed information about any specific scheme or help with the application process?";
      } else if (text.toLowerCase().includes('fees') || text.toLowerCase().includes('loan')) {
        response += "Let me provide you with comprehensive information about managing college fees! 💰\n\n**Education Loans:**\n\n*Government Banks:*\n- SBI Student Loan: Up to ₹1.5 crore, competitive interest rates\n- Canara Bank Vidya Turant: Quick processing, collateral-free up to ₹7.5 lakhs\n- Bank of Baroda Scholar Loan: Special rates for premier institutions\n\n*Private Banks:*\n- HDFC Credila: Flexible repayment, covers overseas education\n- ICICI Bank Student Loan: Quick approval, minimal documentation\n- Axis Bank Education Loan: Covers tuition, accommodation, books\n\n**Key Loan Features:**\n- Moratorium period: Repay after course completion + 6 months\n- Interest subsidy schemes available for economically weaker sections\n- No collateral required for loans up to ₹7.5 lakhs\n- Tax benefits under Section 80E\n\n**Scholarships & Fee Waivers:**\n- Merit-based scholarships from colleges\n- Need-based fee concessions\n- Corporate scholarships (Tata, Reliance, etc.)\n- Community-specific scholarships\n\n**Installment Plans:**\n- Most colleges offer semester-wise payment\n- Some allow monthly installments\n- Early payment discounts available\n\n**Pro Tips:**\n- Apply for multiple scholarships simultaneously\n- Compare interest rates across banks\n- Check if your college has tie-ups with specific banks\n- Keep all documents ready: marksheets, income certificate, admission letter\n\nNeed help with anything specific?";
      } else if (text.toLowerCase().includes('study') || text.toLowerCase().includes('schedule') || text.toLowerCase().includes('plan')) {
        response += "I'll help you create an effective study plan! 📚✨\n\n**Proven Study Strategies:**\n\n**1. Time Management:**\n- Use the Pomodoro Technique (25 min focus + 5 min break)\n- Peak productivity hours: Morning (6-10 AM) for complex subjects\n- Evening (4-8 PM) for revision and practice\n- Avoid marathon sessions - your brain needs breaks!\n\n**2. Subject Distribution:**\n- Alternate between difficult and easier subjects\n- Study similar subjects on different days to avoid confusion\n- Daily: 2-3 hours for current topics\n- Weekly: 3-4 hours for revision\n\n**3. Active Learning Techniques:**\n- Feynman Technique: Explain concepts in simple terms\n- Mind mapping for visual learners\n- Practice problems > passive reading\n- Teach concepts to friends - best retention method\n\n**4. Using This App:**\n- **Smart Tasks**: Break syllabus into daily tasks with deadlines\n- **Pomodoro Timer**: Stay focused during study sessions\n- **Calendar**: Schedule study blocks for each subject\n- **Streak System**: Build consistent daily study habits\n\n**Sample Daily Schedule:**\n- 6:00-7:30 AM: Difficult subject (Math/Physics)\n- 7:30-8:00 AM: Break + breakfast\n- 8:00-10:00 AM: Classes/moderate subject\n- 4:00-6:00 PM: Practice problems/assignments\n- 7:00-8:30 PM: Revision + notes\n- 9:00-10:00 PM: Light reading/next day prep\n\n**Exam Preparation:**\n- 3 months before: Complete syllabus\n- 1 month before: First revision cycle\n- 15 days before: Second revision + mock tests\n- 1 week before: Quick revision + previous papers\n\nWould you like help setting up a specific study schedule?";
      } else if (text.toLowerCase().includes('pg') || text.toLowerCase().includes('hostel') || text.toLowerCase().includes('location') || text.toLowerCase().includes('accommodation')) {
        response += "Looking for accommodation near your college? I can help! 🏠\n\n**Finding PG/Hostels:**\n\nUse the **Locations tab** in this app to quickly search for:\n- PG accommodations near your college\n- Hostels with meal facilities\n- Budget-friendly options\n- Transportation nearby\n\n**What to Look For:**\n\n*Safety & Security:*\n- CCTV cameras in common areas\n- Secure entry/exit system\n- Female/Male-only options if preferred\n- Background-verified owners\n\n*Facilities:*\n- WiFi availability and speed\n- Laundry services\n- Attached/common bathroom\n- Study room or quiet hours policy\n- Meal options (included/separate)\n\n*Location Factors:*\n- Distance from college (ideally 2-3 km)\n- Public transport connectivity\n- Nearby markets, medical stores\n- Safety of the neighborhood\n\n**Typical Costs:**\n- Basic PG: ₹4,000-8,000/month\n- Premium PG: ₹8,000-15,000/month\n- Includes: Room + meals (usually)\n- Security deposit: 1-2 months rent\n\n**Useful Platforms:**\n- Search directly via Locations tab\n- NestAway, Zolo (PG aggregators)\n- College Facebook groups\n- Local brokers (may charge fee)\n\n**Before Finalizing:**\n- Visit in person if possible\n- Read reviews from current residents\n- Check rent agreement carefully\n- Verify distance using Google Maps\n- Ask about notice period for leaving\n\nGo to the **Locations** tab now to start your search! I'll guide you through finding the best options near you. 🗺️";
      } else if (text.toLowerCase().includes('career') || text.toLowerCase().includes('job') || text.toLowerCase().includes('internship')) {
        response += "Let me help you with career planning and opportunities! 🚀\n\n**For Current Students:**\n\n*Internships:*\n- LinkedIn, Internshala, AngelList for listings\n- Start applying in 2nd/3rd year\n- Summer internships: Apply by January-February\n- Even unpaid internships add value to resume\n\n*Skill Development:*\n- Technical: Coursera, Udemy, freeCodeCamp\n- Communication: Join debate clubs, toastmasters\n- Projects: Build portfolio on GitHub\n- Certifications relevant to your field\n\n**Placement Preparation:**\n- Start 1 year before placements\n- Resume: Keep it 1-page, achievement-focused\n- Aptitude: Practice daily on IndiaBix, PrepInsta\n- Coding (CS students): LeetCode, HackerRank\n- Mock interviews with seniors\n\n**Career Options by Field:**\n\n*Engineering:*\n- Core jobs, IT sector, higher studies (MS/MBA)\n- Government jobs (ISRO, DRDO, PSUs)\n- Startups for hands-on experience\n\n*Commerce:*\n- CA, CS, CFA certifications\n- Banking, Finance sector\n- MBA for management roles\n\n*Science:*\n- Research (PhD, postdoc)\n- Industry R&D positions\n- Teaching, government labs\n\n*Arts/Humanities:*\n- Civil services, journalism\n- Content writing, digital marketing\n- NGO sector, social work\n\n**Job Search Tips:**\n- Network with alumni on LinkedIn\n- Attend college placement drives\n- Apply off-campus (don't wait only for campus placements)\n- Keep learning new skills\n\nWhat's your field of study? I can provide more specific guidance!";
      } else if (text.toLowerCase().includes('exam') || text.toLowerCase().includes('test') || text.toLowerCase().includes('preparation')) {
        response += "I'll help you ace your exams! 📝💯\n\n**Exam Preparation Timeline:**\n\n**3 Months Before:**\n- Complete entire syllabus\n- Make comprehensive notes\n- Identify weak areas\n- Start solving previous year papers\n\n**1 Month Before:**\n- First revision of all subjects\n- Focus on important topics\n- Create formula sheets/flashcards\n- Join study groups for doubt clearing\n\n**2 Weeks Before:**\n- Second revision (faster)\n- Practice time management with mock tests\n- Solve 5-10 previous year papers\n- Review mistakes thoroughly\n\n**1 Week Before:**\n- Quick revision of notes only\n- Practice 1-2 papers per day\n- Review formulas, definitions, diagrams\n- Get proper sleep (no all-nighters!)\n\n**Day Before Exam:**\n- Light revision only\n- Prepare exam kit (pen, ID, admit card)\n- Relax, watch something light\n- Sleep early (8 hours minimum)\n\n**During Exam:**\n- Read paper completely first (5 mins)\n- Answer easy questions first\n- Time management: Set time per section\n- Review answers if time permits\n- Don't panic if something's unfamiliar\n\n**Subject-Specific Tips:**\n\n*Math/Physics:*\n- Practice 100+ problems per chapter\n- Formula revision daily\n- Focus on previous year patterns\n\n*Theory Subjects:*\n- Make point-wise notes\n- Use mnemonics for memorization\n- Practice diagram-based questions\n\n*Languages:*\n- Read sample answers\n- Practice writing within time limit\n- Focus on grammar and formatting\n\n**Use This App:**\n- Set task deadlines for each chapter\n- Use Pomodoro for focused study sessions\n- Track your streak to stay consistent\n- Schedule mock tests in Calendar\n\nWhat subject do you need help with specifically?";
      } else {
        response += "Hello! I'm your AI assistant for college life. I can provide detailed help with:\n\n**📚 Academic Support:**\n- Study planning and time management strategies\n- Exam preparation tips and techniques\n- Subject-specific guidance\n- Note-taking methods and revision strategies\n\n**💰 Financial Guidance:**\n- Government scholarships and schemes (NSP, PM-YASASVI, etc.)\n- Education loan options from various banks\n- Fee payment plans and waivers\n- Budget management tips for students\n\n**🏠 Accommodation:**\n- Finding PG/hostels near college (use Locations tab)\n- What to look for in accommodations\n- Safety and facility checklist\n- Typical costs and agreements\n\n**🚀 Career Development:**\n- Internship and job search strategies\n- Resume building and interview prep\n- Skill development resources\n- Career path guidance by field\n\n**🗺️ Local Information:**\n- Finding nearby restaurants, stationery shops\n- Transportation options (metro, bus)\n- Medical facilities and emergency services\n- Tourist places and recreation spots\n\n**⏰ Productivity Tools:**\n- Smart task management\n- Pomodoro technique for focused study\n- Calendar and timetable organization\n- Building study streaks\n\nJust ask me anything specific, and I'll provide detailed, actionable information to help you succeed in college! What would you like to know about?";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1500);
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