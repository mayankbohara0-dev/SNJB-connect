-- Automatic Email Confirmation on User Approval
-- This trigger automatically confirms a user's email when their profile status is set to 'approved'

-- Create a function to confirm email when user is approved
CREATE OR REPLACE FUNCTION public.auto_confirm_email_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Only run if status changed to 'approved' and email is not already confirmed
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update the auth.users table to confirm the email
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id
      AND email_confirmed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_approved ON public.profiles;

-- Create trigger that fires when profile status is updated
CREATE TRIGGER on_profile_approved
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.auto_confirm_email_on_approval();

-- Also confirm emails for any currently approved users who aren't confirmed yet
UPDATE auth.users u
SET email_confirmed_at = NOW()
FROM public.profiles p
WHERE u.id = p.id
  AND p.status = 'approved'
  AND u.email_confirmed_at IS NULL;

-- Verify the setup
SELECT 
    u.email,
    p.status,
    u.email_confirmed_at,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Can Login'
        ELSE '❌ Cannot Login'
    END as login_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
