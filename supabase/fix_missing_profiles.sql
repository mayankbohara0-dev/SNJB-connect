-- Fix Script: Create Missing Profiles and Ensure Trigger Works
-- Run this in Supabase SQL Editor to fix profile creation issues

-- Step 1: Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, real_name, role, status, username)
  VALUES (
    NEW.id,
    NEW.email,
    -- Extract full_name from metadata, fallback to email
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Set role based on email
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'admin'
      ELSE 'student'
    END,
    -- Set status based on email
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'approved'
      ELSE 'pending'
    END,
    -- Generate username: "user" + 4-digit random number
    'user' || lpad((floor(random() * 10000)::int)::text, 4, '0')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create profiles for any existing users who don't have one
-- This will catch your friend and any other users who registered but don't have profiles
INSERT INTO public.profiles (id, email, real_name, role, status, username, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as real_name,
  CASE
    WHEN u.email = 'mayankbohara0@gmail.com' THEN 'admin'
    ELSE 'student'
  END as role,
  CASE
    WHEN u.email = 'mayankbohara0@gmail.com' THEN 'approved'
    ELSE 'pending'
  END as status,
  'user' || lpad((floor(random() * 10000)::int)::text, 4, '0') as username,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify the fix
-- This should show all users with their profiles
SELECT 
  u.email as user_email,
  p.email as profile_email,
  p.role,
  p.status,
  p.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
