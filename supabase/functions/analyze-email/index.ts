import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailContent } = await req.json();
    
    if (!emailContent) {
      throw new Error('Email content is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get authenticated user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log('Analyzing email for user:', user.id);

    // Call Lovable AI to extract tasks and deadlines
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent email analyzer. Extract tasks, deadlines, and important events from emails.
Return your analysis as a JSON object with this structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "deadline": "ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ) or null if no specific deadline",
      "priority": "high" | "medium" | "low",
      "category": "Study" | "Personal" | "Admin",
      "subject": "Subject/Course name if applicable"
    }
  ],
  "summary": "Brief summary of the email"
}

Guidelines:
- Extract actionable tasks with clear deadlines
- Set priority based on urgency indicated in the email
- Use "high" priority for urgent items with close deadlines
- Include subject/course names when mentioned
- If no deadline is specified, use null
- Be concise and actionable`
          },
          {
            role: 'user',
            content: `Analyze this email and extract tasks:\n\n${emailContent}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_email_tasks",
              description: "Extract tasks and deadlines from email content",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        deadline: { type: ["string", "null"] },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        category: { type: "string", enum: ["Study", "Personal", "Admin"] },
                        subject: { type: "string" }
                      },
                      required: ["title", "description", "priority", "category"]
                    }
                  },
                  summary: { type: "string" }
                },
                required: ["tasks", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_email_tasks" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse));

    // Extract the function call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Extracted analysis:', JSON.stringify(analysis));

    // Create tasks and events in database
    const createdTasks = [];
    const createdEvents = [];

    for (const task of analysis.tasks) {
      // Determine deadline
      let taskDeadline = task.deadline;
      if (!taskDeadline) {
        // Default to 7 days from now at 5 PM
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        defaultDate.setHours(17, 0, 0, 0);
        taskDeadline = defaultDate.toISOString();
      }

      // Insert task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: task.title,
          description: task.description,
          category: task.category,
          subject: task.subject || null,
          deadline: taskDeadline,
          priority: task.priority,
          is_completed: false
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
      } else {
        createdTasks.push(taskData);

        // Create linked calendar event
        const deadlineDate = new Date(taskDeadline);
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert({
            user_id: user.id,
            title: task.title,
            event_type: 'assignment',
            event_date: deadlineDate.toISOString().split('T')[0],
            start_time: `${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}:00`,
            end_time: `${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}:00`,
            subject: task.subject || null,
            notes: `From email: ${task.description}`
          })
          .select()
          .single();

        if (eventError) {
          console.error('Error creating event:', eventError);
        } else {
          createdEvents.push(eventData);
        }
      }
    }

    return new Response(
      JSON.stringify({
        summary: analysis.summary,
        tasksCreated: createdTasks.length,
        eventsCreated: createdEvents.length,
        tasks: createdTasks,
        events: createdEvents
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
