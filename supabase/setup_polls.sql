-- Add poll_data column to posts table if not exists
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS poll_data JSONB DEFAULT NULL;

-- Create poll_votes table to track who voted for what
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- One vote per user per poll
);

-- Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for poll_votes
-- Policies for poll_votes
DROP POLICY IF EXISTS "Public can view votes" ON public.poll_votes;
CREATE POLICY "Public can view votes" 
ON public.poll_votes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.poll_votes;
CREATE POLICY "Authenticated users can vote" 
ON public.poll_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their vote" ON public.poll_votes;
CREATE POLICY "Users can remove their vote" 
ON public.poll_votes FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Function to get vote counts efficiently (or just count in client)
-- For now, client-side counting is fine for moderate scale.
