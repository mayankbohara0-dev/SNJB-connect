-- Drop existing view first to avoid column-name conflicts, then recreate and grant access
DROP VIEW IF EXISTS public.public_posts;

CREATE VIEW public.public_posts AS
SELECT
  p.id,
  p.created_at,
  p.content,
  p.image_url,
  p.tags,
  p.type,
  p.user_id,
  p.upvotes,
  p.downvotes,
  pr.username AS author_alias
FROM public.posts p
LEFT JOIN public.profiles pr ON pr.id = p.user_id
WHERE p.is_approved = true;

GRANT SELECT ON public.public_posts TO authenticated;
GRANT SELECT ON public.public_posts TO anon;
