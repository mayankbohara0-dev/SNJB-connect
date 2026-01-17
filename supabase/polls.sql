-- Add 'poll' to the check constraint if not already (it was text CHECK type)
-- We need to ensure the existing check constraint on 'posts' supports 'poll'.
-- Since we defined it as CHECK (type IN ('text', 'image', 'confession')) in posts.sql,
-- we need to alter it.

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_type_check CHECK (type IN ('text', 'image', 'confession', 'poll'));

-- Poll Options Table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL CHECK (char_length(label) > 0),
  vote_count int DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

-- Policies for Poll Options
CREATE POLICY "poll_options_select" ON public.poll_options
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "poll_options_insert" ON public.poll_options
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = poll_options.post_id AND posts.user_id = auth.uid()
    )
  );

-- Poll Votes Table (Tracks who voted to prevent double voting, but RLS hides it)
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL, -- Denormalized for easy unique check
  created_at timestamp with time zone DEFAULT now(),

  UNIQUE(user_id, post_id) -- One vote per user per poll
);

-- Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for Poll Votes
-- Users can insert their own vote
CREATE POLICY "poll_votes_insert" ON public.poll_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can SEE their own vote (to know what they voted for)
CREATE POLICY "poll_votes_select_own" ON public.poll_votes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Function to increment vote count
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.poll_option_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_cast
  AFTER INSERT ON public.poll_votes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_vote();
