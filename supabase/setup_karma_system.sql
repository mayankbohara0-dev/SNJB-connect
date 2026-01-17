-- Karma System & Real Likes Migration
-- Safe to run multiple times in Supabase SQL Editor

-- 1. Add karma column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS karma integer DEFAULT 0;

-- 2. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    -- Prevent duplicate likes from same user on same post
    UNIQUE(post_id, user_id)
);

-- 3. Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Drop existing policies if present, then create desired policies

DROP POLICY IF EXISTS "likes_insert" ON public.post_likes;
CREATE POLICY "likes_insert" ON public.post_likes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "likes_delete" ON public.post_likes;
CREATE POLICY "likes_delete" ON public.post_likes
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "likes_select" ON public.post_likes;
CREATE POLICY "likes_select" ON public.post_likes
  FOR SELECT TO authenticated
  USING (true);

-- 5. Karma & Upvote Automation Functions

-- Function: Handle New Like (+10 karma, +1 upvote)
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment post upvotes
  UPDATE public.posts 
  SET upvotes = COALESCE(upvotes, 0) + 1 
  WHERE id = NEW.post_id;
  
  -- Increment author karma by 10
  UPDATE public.profiles 
  SET karma = COALESCE(karma, 0) + 10 
  WHERE id = (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Handle Remove Like (-10 karma, -1 upvote)
CREATE OR REPLACE FUNCTION public.handle_remove_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement post upvotes (not below 0)
  UPDATE public.posts 
  SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0)
  WHERE id = OLD.post_id;
  
  -- Decrement author karma by 10
  UPDATE public.profiles 
  SET karma = COALESCE(karma, 0) - 10 
  WHERE id = (SELECT user_id FROM public.posts WHERE id = OLD.post_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Triggers

-- Trigger for INSERT (New Like)
DROP TRIGGER IF EXISTS on_like_added ON public.post_likes;
CREATE TRIGGER on_like_added
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_like();

-- Trigger for DELETE (Remove Like)
DROP TRIGGER IF EXISTS on_like_removed ON public.post_likes;
CREATE TRIGGER on_like_removed
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_remove_like();

-- 7. Grant permissions (limited)
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
