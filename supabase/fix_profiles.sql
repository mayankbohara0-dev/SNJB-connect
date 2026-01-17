-- Fix missing profiles by backfilling from auth.users
-- Run this to resolve "Profile not found" errors

INSERT INTO public.profiles (id, email, role, status, real_name, username, created_at, updated_at)
SELECT 
  u.id, 
  u.email, 
  'student', 
  'pending', 
  COALESCE(u.raw_user_meta_data->>'full_name', 'Student'),
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Ensure RLS doesn't block insertion (optional safety check, usually not needed for direct SQL run)
