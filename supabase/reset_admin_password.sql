-- Reset Admin Password
-- This script updates the password for mayankbohara0@gmail.com
-- Run this in your Supabase SQL Editor

-- Note: Supabase uses bcrypt hashing, so we need to use the auth.users table
-- The password will be: MAYANK@111406

-- First, get the user ID
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Find the admin user
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'mayankbohara0@gmail.com';

    -- Update the password using Supabase's internal function
    -- This requires admin/service role access
    IF admin_user_id IS NOT NULL THEN
        -- You'll need to use the Supabase Dashboard's "Reset Password" feature
        -- OR use the Supabase Management API
        RAISE NOTICE 'Admin user found: %', admin_user_id;
        RAISE NOTICE 'Please use one of these methods to reset password:';
        RAISE NOTICE '1. Supabase Dashboard > Authentication > Users > ... menu > Reset Password';
        RAISE NOTICE '2. Use the Profile page Security Settings after logging in with Magic Link';
    ELSE
        RAISE NOTICE 'Admin user not found';
    END IF;
END $$;
