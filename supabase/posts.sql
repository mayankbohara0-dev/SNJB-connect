-- Create Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL CHECK (char_length(content) > 0),
  image_url text,
  tags text[] DEFAULT '{}',
  type text CHECK (type IN ('text', 'image', 'confession')) DEFAULT 'text',
  
  -- Metrics (denormalized for performance, or count via separate table. Simple counter for now)
  upvotes int DEFAULT 0,
  downvotes int DEFAULT 0,
  is_approved boolean DEFAULT true -- Auto-approve for now, mod can change
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 1. SECURE VIEW for Anonymous Feed
-- This verifies strict anonymity. Frontend queries THIS view, not the table.
CREATE OR REPLACE VIEW public.public_posts AS
SELECT
  id,
  created_at,
  content,
  image_url,
  tags,
  type,
  -- Generate a stable but anonymous ID for the author PER post (or global alias from profile)
  -- For strict anonymity per post (confessions), we might not even want that.
  -- But usually "OP" is useful. Let's use the profile username (which is random: User482)
  (SELECT username FROM public.profiles WHERE profiles.id = posts.user_id) as author_alias
FROM public.posts
WHERE is_approved = true;

-- Grant access to the view
GRANT SELECT ON public.public_posts TO authenticated, anon;

-- 2. RLS Policies on the BASE table
-- Users can insert their own posts
CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own posts (e.g. for "My Posts" history)
CREATE POLICY "posts_select_own" ON public.posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see ALL posts (including user_id)
CREATE POLICY "posts_select_admin" ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can update/delete
CREATE POLICY "posts_update_admin" ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "posts_delete_admin" ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
