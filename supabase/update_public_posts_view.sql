-- Update public_posts view to include user_id for reporting
-- Run this in Supabase SQL Editor

CREATE OR REPLACE VIEW public.public_posts AS
SELECT
  id,
  created_at,
  content,
  image_url,
  tags,
  type,
  user_id, -- Added for reporting functionality
  -- Generate a stable but anonymous ID for the author PER post (or global alias from profile)
  -- For strict anonymity per post (confessions), we might not even want that.
  -- But usually "OP" is useful. Let's use the profile username (which is random: User482)
  (SELECT username FROM public.profiles WHERE profiles.id = posts.user_id) as author_alias
FROM public.posts
WHERE is_approved = true;

-- Grant access to the view
GRANT SELECT ON public.public_posts TO authenticated, anon;
