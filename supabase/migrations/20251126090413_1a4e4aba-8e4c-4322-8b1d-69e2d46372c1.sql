-- Drop the old check constraint that's missing 'class'
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Add the correct check constraint with all event types including 'class'
ALTER TABLE public.events ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('class', 'exam', 'assignment', 'meeting', 'submission', 'personal'));