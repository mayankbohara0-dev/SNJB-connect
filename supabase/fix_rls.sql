-- 1. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy for Admins to View All Profiles
-- Drop existing potential policy to avoid conflict
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  role = 'admin' 
  OR 
  email = 'mayankbohara0@gmail.com' -- Hardcoded safety for the Super Admin
);

-- 3. Create Policy for Admins to Update Profiles (Approve/Ban)
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

CREATE POLICY "Admins can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  role = 'admin' 
  OR 
  email = 'mayankbohara0@gmail.com'
);

-- 4. Allow users to insert their OWN profile (for trigger to work if needed, though usually handled by trigger/auth)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Standard User Policy (View own profile + View basic public info if needed)
-- For this app, maybe users need to see others? If assume anonymous, maybe not?
-- But let's ensure they can at least read their own.
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- NOTIFY: Run this in Supabase SQL Editor!
