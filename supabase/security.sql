-- Enable RLS on all base tables (do NOT enable on views)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;      -- base table for public_posts view
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
-- Everyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 2. Posts (the public_posts view should read from posts; apply RLS on posts)
CREATE POLICY "Posts are viewable by everyone"
  ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.role() = 'authenticated'));

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 3. Comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.role() = 'authenticated'));

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 4. Likes
CREATE POLICY "Likes are viewable by everyone"
  ON post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can toggle likes"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.role() = 'authenticated'));

CREATE POLICY "Users can remove own likes"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 5. Poll Options
CREATE POLICY "Poll options are viewable by everyone"
  ON poll_options
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert options"
  ON poll_options
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.role() = 'authenticated'));

-- 6. Notices
CREATE POLICY "Notices are viewable by everyone"
  ON notices
  FOR SELECT
  USING (true);
