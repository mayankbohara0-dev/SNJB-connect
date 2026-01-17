-- Add status column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'approved', 'banned')) DEFAULT 'pending';

-- Update the handle_new_user function to set status dynamically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, real_name, role, username, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'admin'
      ELSE 'student'
    END,
    'user' || lpad( (floor(random() * 10000)::int)::text, 4, '0' ),
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'approved'
      ELSE 'pending'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Secure the Post Views to only show content to APPROVED users
-- We need to check the viewer's status in the policies/views.

-- Update View: public_posts
-- Only allow showing posts if the viewer is approved (or if we want to be strict)
-- Actually, RLS on the underlying table or view logic? 
-- Let's update RLS on 'public_posts' (if it were a table, but it's a view).
-- Taking a simpler approach: Update the View definition to join profiles? 
-- No, View security is usually done via RLS on underlying or simply by checking current user status.

-- Let's add a policy to 'posts' table that requires 'approved' status to SELECT.
-- DROP existing select policy first if needed, or just OR it?
-- The previous policy was: "posts_select_own". We added "posts_select_admin".
-- We need a general "posts_select_approved" for the feed.

CREATE POLICY "posts_select_approved" ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status = 'approved'
    )
  );

-- Update RLS for Inserting posts (Only approved users can post)
DROP POLICY IF EXISTS "posts_insert" ON public.posts;

CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status = 'approved'
    )
  );
