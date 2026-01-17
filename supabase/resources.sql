-- 1) Add a status column to public.profiles (text with default 'pending')
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 2) Create notes table (if not exists)
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL CHECK (char_length(title) > 0),
  subject text NOT NULL,
  semester text NOT NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Ensure policies for notes
DROP POLICY IF EXISTS "notes_select" ON public.notes;
CREATE POLICY "notes_select" ON public.notes
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "notes_insert" ON public.notes;
CREATE POLICY "notes_insert" ON public.notes
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND status = 'approved'
  )
);

-- 3) Create events table (if not exists)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL CHECK (char_length(title) > 0),
  description text,
  event_date timestamp with time zone NOT NULL,
  location text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "events_insert" ON public.events;
CREATE POLICY "events_insert" ON public.events
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND status = 'approved'
  )
);

-- 4) Create event_rsvps table (if not exists)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for event_rsvps
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rsvps_select" ON public.event_rsvps;
CREATE POLICY "rsvps_select" ON public.event_rsvps
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "rsvps_insert" ON public.event_rsvps;
CREATE POLICY "rsvps_insert" ON public.event_rsvps
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "rsvps_delete" ON public.event_rsvps;
CREATE POLICY "rsvps_delete" ON public.event_rsvps
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);
