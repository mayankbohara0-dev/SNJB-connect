-- 1. Fix the existing user row if it exists
UPDATE public.profiles
SET 
  role = 'admin',
  status = 'approved'
WHERE email = 'mayankbohara0@gmail.com';

-- 2. Ensure the trigger function is definitely correct for future (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, real_name, role, username, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'admin'
      ELSE 'student'
    END,
    'user' || lpad( (floor(random() * 10000)::int)::text, 4, '0' ),
    CASE
      WHEN NEW.email = 'mayankbohara0@gmail.com' THEN 'approved'
      ELSE 'pending'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status
  WHERE EXCLUDED.email = 'mayankbohara0@gmail.com'; 
  -- The ON CONFLICT clause above ensures that if the admin signs up again or if logic re-runs, they get updated.

  RETURN NEW;
END;
$$;
