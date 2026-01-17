-- Migration: Add Branch, Year, and Profile Completion to Profiles
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS branch text CHECK (branch IN ('Engineering', 'MBA', 'Pharmacy', 'Polytechnic')),
ADD COLUMN IF NOT EXISTS year text CHECK (year IN ('1st Year', '2nd Year', '3rd Year', '4th Year')),
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Step 2: Set profile_completed = true for existing approved users
-- This prevents them from being forced to the setup page
UPDATE public.profiles 
SET profile_completed = true 
WHERE status = 'approved' AND created_at < NOW();

-- Step 3: Admin should have profile completed by default
UPDATE public.profiles 
SET profile_completed = true 
WHERE role = 'admin';

-- Step 4: Verify the changes
SELECT 
    email,
    branch,
    year,
    profile_completed,
    status,
    role
FROM public.profiles
ORDER BY created_at DESC;
