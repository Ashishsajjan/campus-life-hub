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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Failed to get user');
    }

    // Get stored OAuth token
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'classroom')
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google Classroom not connected. Please connect your Google Classroom account first.');
    }

    console.log('Fetching Google Classroom courses...');

    // Fetch courses from Classroom API
    const coursesResponse = await fetch(
      'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!coursesResponse.ok) {
      throw new Error(`Classroom API error: ${coursesResponse.statusText}`);
    }

    const coursesData = await coursesResponse.json();
    const announcements = [];

    // Fetch announcements for each course
    if (coursesData.courses) {
      for (const course of coursesData.courses.slice(0, 3)) {
        const announcementsResponse = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/announcements?pageSize=5`,
          {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          }
        );

        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          
          if (announcementsData.announcements) {
            for (const announcement of announcementsData.announcements) {
              announcements.push({
                id: announcement.id,
                courseId: course.id,
                courseName: course.name,
                text: announcement.text,
                creationTime: announcement.creationTime,
                updateTime: announcement.updateTime,
                creatorUserId: announcement.creatorUserId,
              });
            }
          }
        }
      }
    }

    console.log(`Fetched ${announcements.length} Classroom announcements from ${coursesData.courses?.length || 0} courses`);

    return new Response(
      JSON.stringify({ announcements }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in classroom-fetch:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
