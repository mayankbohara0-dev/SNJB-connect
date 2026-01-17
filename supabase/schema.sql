-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  username text UNIQUE,
  real_name text,
  email text,
  role text CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  status text CHECK (status IN ('pending', 'approved', 'banned')) DEFAULT 'pending',
  avatar_url text,
  website text,
  CONSTRAINT username_length CHECK (username IS NULL OR char_length(username) >= 3)
);

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "public_profiles_select" ON public.profiles
  FOR SELECT
  TO PUBLIC
  USING ( true );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT auth.uid()) = id );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = id )
  WITH CHECK ( (SELECT auth.uid()) = id );

-- Handle User Creation Trigger
-- This triggers when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, real_name, role, status, username)
  VALUES (
    NEW.id,
    NEW.email,
    -- new.raw_user_meta_data may be json; use ->> to extract text safely
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'admin'
      ELSE 'student'
    END,
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'approved'
      ELSE 'pending'
    END,
    -- simple username generation: "user" + 4-digit random number
    'user' || lpad( (floor(random() * 10000)::int)::text, 4, '0' )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger to call the function after a user is inserted into auth.users
-- Supabase uses auth schema for users; trigger must be created in that schema (or public with proper permissions).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();