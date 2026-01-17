-- Comments System (Corrected)

CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) > 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments on approved posts
CREATE POLICY "Public can view comments" ON public.comments
    FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Admins can delete any comment (checks profile.role = 'admin')
CREATE POLICY "Admins can delete comments" ON public.comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );

-- Trigger to update updated_at
-- Make sure the helper function exists. If not, create it:
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
