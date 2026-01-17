-- Migration: Add created_at and status columns to profiles table
-- This migration adds the created_at and status columns to existing profiles table

-- Add created_at column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Add status column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'approved', 'banned')) DEFAULT 'pending';

-- For existing rows, set created_at to updated_at if updated_at exists, otherwise use current time
UPDATE public.profiles 
SET created_at = COALESCE(updated_at, timezone('utc'::text, now()))
WHERE created_at IS NULL;

-- For existing rows, set status to 'approved' for admin users, 'pending' for others
UPDATE public.profiles 
SET status = CASE 
  WHEN role = 'admin' THEN 'approved'
  ELSE 'pending'
END
WHERE status IS NULL;

-- Add default value for updated_at if not already set
ALTER TABLE public.profiles 
ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());
