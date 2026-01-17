-- Real Notices System (Idempotent & Safe)

-- 1) Create table if not exists
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  type text CHECK (type IN ('exam', 'event', 'holiday', 'info')) DEFAULT 'info',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- 2) Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 3) Ensure the "Public can read notices" policy exists (drop if present then create)
DROP POLICY IF EXISTS "Public can read notices" ON public.notices;

CREATE POLICY "Public can read notices" ON public.notices
  FOR SELECT
  USING (true);

-- 4) Ensure the "Admins can manage notices" policy exists (drop if present then create)
DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;

CREATE POLICY "Admins can manage notices" ON public.notices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 5) Seed some initial real-looking data (only if empty / missing specific title)
INSERT INTO public.notices (title, content, type, date)
SELECT 'Mid-Sem Exams', 'Mid-semester examinations start from Feb 15th.', 'exam', '2026-02-15'
WHERE NOT EXISTS (SELECT 1 FROM public.notices);

INSERT INTO public.notices (title, content, type, date)
SELECT 'Tech Fest 2026', 'Annual Tech Symposium registration open.', 'event', '2026-03-01'
WHERE NOT EXISTS (SELECT 1 FROM public.notices WHERE title = 'Tech Fest 2026');

-- 6) Enable Realtime (Replication) for this table
-- This mimics "Go to Database -> Replication -> Enable for notices"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
  END IF;
END
$$;
