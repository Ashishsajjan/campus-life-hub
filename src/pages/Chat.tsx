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
      content: "Hi there! I'm your AI assistant, and I'm here to help you navigate college life successfully. I can assist with government schemes, college fees and loans, study planning, finding accommodation, career guidance, and much more. What would you like to know about today?"
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
        response = "I'd be happy to help you with government schemes for students!\n\nIndia offers several excellent scholarship and support schemes that you should definitely explore:\n\nThe National Scholarship Portal (NSP) is your one-stop platform for various scholarships. It includes Pre-matric, Post-matric, and Merit-cum-Means scholarships. You can apply online at scholarships.gov.in. Eligibility varies by scheme, typically based on your family income, marks, and category.\n\nThe PM-YASASVI Scheme is specifically designed for OBC, EBC, and DNT students in classes 9-11. It covers tuition fees and other expenses, though an annual family income limit does apply.\n\nDon't forget about State-Specific Scholarships - each state has unique schemes, so I recommend checking your state's education portal. These often include SC/ST/OBC scholarships and minority scholarships.\n\nThere are also some excellent central schemes like AICTE Pragati/Saksham for technical education, UGC scholarships for higher education, and Inspire Awards for science students.\n\nWould you like me to provide more detailed information about any specific scheme or help guide you through the application process?";
      } else if (text.toLowerCase().includes('fees') || text.toLowerCase().includes('loan')) {
        response = "Let me provide you with comprehensive information about managing college fees!\n\nRegarding Education Loans, you have several good options:\n\nFrom Government Banks, SBI Student Loan offers up to ₹1.5 crore with competitive interest rates. Canara Bank's Vidya Turant provides quick processing and is collateral-free up to ₹7.5 lakhs. Bank of Baroda Scholar Loan has special rates for premier institutions.\n\nAmong Private Banks, HDFC Credila offers flexible repayment and covers overseas education. ICICI Bank Student Loan provides quick approval with minimal documentation. Axis Bank Education Loan covers tuition, accommodation, and books.\n\nHere are the key features you should know about: There's a moratorium period where you repay only after course completion plus 6 months. Interest subsidy schemes are available for economically weaker sections. No collateral is required for loans up to ₹7.5 lakhs, and you get tax benefits under Section 80E.\n\nFor Scholarships and Fee Waivers, look into merit-based scholarships from colleges, need-based fee concessions, corporate scholarships from companies like Tata and Reliance, and community-specific scholarships.\n\nRegarding Installment Plans, most colleges offer semester-wise payment options. Some even allow monthly installments, and early payment discounts are often available.\n\nHere are some pro tips: Apply for multiple scholarships simultaneously to maximize your chances. Compare interest rates across banks before deciding. Check if your college has tie-ups with specific banks for better rates. Keep all your documents ready including marksheets, income certificate, and admission letter.\n\nIs there anything specific about fees or loans you'd like to discuss further?";
      } else if (text.toLowerCase().includes('study') || text.toLowerCase().includes('schedule') || text.toLowerCase().includes('plan')) {
        response = "I'll help you create an effective study plan that actually works!\n\nLet's start with Time Management. I highly recommend the Pomodoro Technique - 25 minutes of focused study followed by a 5-minute break. Your peak productivity hours are typically in the morning from 6-10 AM for complex subjects, and evening from 4-8 PM for revision and practice. Remember, avoid marathon sessions - your brain needs regular breaks to retain information effectively!\n\nFor Subject Distribution, try alternating between difficult and easier subjects to maintain focus. Study similar subjects on different days to avoid confusion. Daily, aim for 2-3 hours for current topics and dedicate 3-4 hours weekly for revision.\n\nNow, about Active Learning Techniques - these are game-changers! Use the Feynman Technique where you explain concepts in simple terms. Try mind mapping if you're a visual learner. Practice problems are always better than passive reading. And here's the best method for retention: teach concepts to your friends!\n\nYou can use this app to stay on track. The Smart Tasks feature helps you break your syllabus into daily tasks with deadlines. The Pomodoro Timer keeps you focused during study sessions. Use the Calendar to schedule study blocks for each subject, and the Streak System helps you build consistent daily study habits.\n\nHere's a sample daily schedule that works well: 6:00-7:30 AM for difficult subjects like Math or Physics, 7:30-8:00 AM for break and breakfast, 8:00-10:00 AM for classes or moderate subjects, 4:00-6:00 PM for practice problems and assignments, 7:00-8:30 PM for revision and notes, and 9:00-10:00 PM for light reading or next day preparation.\n\nFor Exam Preparation, follow this timeline: Three months before exams, complete your syllabus. One month before, do your first revision cycle. Fifteen days before, complete your second revision and take mock tests. One week before, do quick revision and solve previous papers.\n\nWould you like help setting up a specific study schedule tailored to your needs?";
      } else if (text.toLowerCase().includes('pg') || text.toLowerCase().includes('hostel') || text.toLowerCase().includes('location') || text.toLowerCase().includes('accommodation')) {
        response = "Looking for accommodation near your college? I'm here to help!\n\nYou can use the Locations tab in this app to quickly search for PG accommodations near your college, hostels with meal facilities, budget-friendly options, and check transportation availability nearby.\n\nWhen looking at places, here's what you should prioritize:\n\nFor Safety and Security, check if there are CCTV cameras in common areas, a secure entry and exit system, and whether the place offers female or male-only options if you prefer. It's also important that the owners are background-verified.\n\nRegarding Facilities, make sure to ask about WiFi availability and speed, laundry services, whether bathrooms are attached or common, if there's a study room or quiet hours policy, and what the meal options are - whether included or separate.\n\nLocation-wise, ideally look for places 2-3 km from your college. Check public transport connectivity, nearby markets and medical stores, and research the safety of the neighborhood.\n\nIn terms of costs, basic PG accommodation typically ranges from ₹4,000-8,000 per month, while premium options go from ₹8,000-15,000 per month. This usually includes room and meals. Expect to pay a security deposit of 1-2 months rent.\n\nYou can search directly via the Locations tab here, or try platforms like NestAway and Zolo. College Facebook groups are also helpful, and local brokers can assist though they may charge a fee.\n\nBefore you finalize anything, visit the place in person if possible. Read reviews from current residents, check the rent agreement carefully, verify the distance using Google Maps, and ask about the notice period for leaving.\n\nGo ahead and check out the Locations tab now - I'll guide you through finding the best options near you!";
      } else if (text.toLowerCase().includes('career') || text.toLowerCase().includes('job') || text.toLowerCase().includes('internship')) {
        response = "Let me help you with career planning and opportunities!\n\nFor Current Students looking for internships, I recommend checking LinkedIn, Internshala, and AngelList for listings. Start applying in your 2nd or 3rd year. For summer internships, you should apply by January-February. Remember, even unpaid internships add valuable experience to your resume.\n\nRegarding Skill Development, for technical skills, try Coursera, Udemy, or freeCodeCamp. For communication skills, consider joining debate clubs or toastmasters. Build your project portfolio on GitHub, and get certifications relevant to your field.\n\nFor Placement Preparation, start at least 1 year before placements begin. Keep your resume to 1 page and achievement-focused. Practice aptitude daily on IndiaBix or PrepInsta. If you're a CS student, use LeetCode and HackerRank for coding practice. Take mock interviews with seniors whenever possible.\n\nLet me break down career options by field:\n\nFor Engineering students, you can explore core jobs, the IT sector, or higher studies like MS or MBA. Government jobs with organizations like ISRO, DRDO, and PSUs are great options. Startups offer excellent hands-on experience.\n\nCommerce students should look into CA, CS, or CFA certifications. The Banking and Finance sectors offer good opportunities, and an MBA opens doors to management roles.\n\nScience students can pursue research through PhD or postdoc programs, work in Industry R&D positions, consider teaching, or join government labs.\n\nFor Arts and Humanities students, civil services and journalism are excellent paths. Content writing and digital marketing are growing fields. The NGO sector and social work offer meaningful career options too.\n\nSome job search tips: Network with alumni on LinkedIn, attend all college placement drives, don't wait only for campus placements - apply off-campus as well, and keep learning new skills continuously.\n\nWhat's your field of study? I can provide more specific guidance based on that!";
      } else if (text.toLowerCase().includes('exam') || text.toLowerCase().includes('test') || text.toLowerCase().includes('preparation')) {
        response = "I'll help you ace your exams with a solid preparation strategy!\n\nHere's a timeline that works:\n\nThree months before your exams, focus on completing the entire syllabus, making comprehensive notes, identifying your weak areas, and start solving previous year papers.\n\nOne month before exams, do your first revision of all subjects. Focus on important topics, create formula sheets and flashcards, and join study groups for clearing doubts.\n\nTwo weeks before, complete your second revision faster this time. Practice time management with mock tests, solve 5-10 previous year papers, and review your mistakes thoroughly.\n\nOne week before, do quick revision of your notes only. Practice 1-2 papers per day, review formulas, definitions, and diagrams. Make sure you get proper sleep - no all-nighters!\n\nThe day before your exam, do light revision only. Prepare your exam kit with pen, ID, and admit card. Relax, maybe watch something light, and sleep early - aim for at least 8 hours.\n\nDuring the exam, read the entire paper first - spend about 5 minutes on this. Answer easy questions first to build confidence. Manage your time by setting limits per section. Review your answers if time permits, and don't panic if something looks unfamiliar - stay calm and do your best.\n\nFor subject-specific preparation:\n\nWith Math and Physics, practice at least 100 problems per chapter. Do formula revision daily and focus on previous year patterns.\n\nFor theory subjects, make point-wise notes, use mnemonics for memorization, and practice diagram-based questions.\n\nFor languages, read sample answers, practice writing within time limits, and focus on grammar and formatting.\n\nYou can use this app to stay organized: Set task deadlines for each chapter in Smart Tasks, use Pomodoro for focused study sessions, track your streak to stay consistent, and schedule mock tests in your Calendar.\n\nWhich subject do you need specific help with?";
      } else {
        response = "Hello! I'm your AI assistant for college life, and I'm here to help you succeed.\n\nI can provide detailed support in several areas:\n\nFor Academic Support, I can help with study planning and time management strategies, exam preparation tips and techniques, subject-specific guidance, and effective note-taking and revision methods.\n\nRegarding Financial Guidance, I can inform you about government scholarships and schemes like NSP and PM-YASASVI, education loan options from various banks, fee payment plans and waivers, and budget management tips for students.\n\nFor Accommodation needs, I can help you find PG or hostels near your college using the Locations tab. I'll guide you on what to look for in accommodations, provide a safety and facility checklist, and explain typical costs and agreements.\n\nIn Career Development, I can assist with internship and job search strategies, resume building and interview preparation, skill development resources, and career path guidance specific to your field.\n\nFor Local Information, I can help you find nearby restaurants and stationery shops, transportation options like metro and bus, medical facilities and emergency services, and tourist places and recreation spots.\n\nI can also guide you on using the Productivity Tools in this app, including smart task management, the Pomodoro technique for focused study, calendar and timetable organization, and building study streaks.\n\nJust ask me anything specific, and I'll provide detailed, actionable information to help you succeed in college. What would you like to know about?";
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
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
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