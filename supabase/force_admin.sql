-- FORCE ADMIN SCRIPT
-- Run this in Supabase SQL Editor to manually make yourself an admin.

INSERT INTO public.profiles (id, email, role, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'mayankbohara0@gmail.com' LIMIT 1),
  'mayankbohara0@gmail.com',
  'admin',
  'approved'
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  status = 'approved';

-- After running this, the "role" column in your profile will be 'admin'.
-- This guarantees dashboard access.
