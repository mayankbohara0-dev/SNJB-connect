-- Quick Fix: Confirm User Email and Enable Login
-- Run this in Supabase SQL Editor to allow approved users to login

-- Option 1: Confirm a specific user's email
-- Replace 'user@email.com' with the actual email address
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'bohoramayank80@gmail.com'  -- Replace with your friend's email
  AND email_confirmed_at IS NULL;

-- Option 2: Confirm ALL approved users' emails
-- This will allow all approved users to login
UPDATE auth.users u
SET email_confirmed_at = NOW()
FROM public.profiles p
WHERE u.id = p.id
  AND p.status = 'approved'
  AND u.email_confirmed_at IS NULL;

-- Option 3: Confirm ALL users' emails (Development Only - NOT for production!)
-- ⚠️ WARNING: Only use this in development environments
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;

-- Verify the changes
SELECT 
    u.email,
    u.email_confirmed_at,
    p.status,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
        ELSE '❌ Not Confirmed'
    END as confirmation_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
