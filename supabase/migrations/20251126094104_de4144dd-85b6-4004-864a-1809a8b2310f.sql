-- Add completion tracking to events table
ALTER TABLE public.events
ADD COLUMN is_completed boolean DEFAULT false,
ADD COLUMN completed_at timestamp with time zone;