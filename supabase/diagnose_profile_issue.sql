-- Diagnostic Script: Check Profile Creation Issues
-- Run this in Supabase SQL Editor to diagnose why profiles aren't being created

-- 1. Check if the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. List all users in auth.users (requires admin access)
-- This shows users who have signed up
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. List all profiles
-- This shows which users have profiles created
SELECT 
    id,
    email,
    real_name,
    role,
    status,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Find users without profiles (the problem users)
-- These are users who registered but don't have profiles
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 6. Check table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
