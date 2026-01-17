-- Fix Posts RLS Policy to Allow Approved Users to Post
-- This updates the posts_insert policy to check if user is approved

-- Drop existing policy
DROP POLICY IF EXISTS "posts_insert" ON public.posts;

-- Create new policy that checks approval status
CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.status = 'approved'
    )
  );

-- Verify the policy
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'posts';
