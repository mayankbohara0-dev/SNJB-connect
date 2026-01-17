-- Replace 'your_email@example.com' with your actual email
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- Verify it worked
SELECT email, role 
FROM auth.users 
JOIN public.profiles ON auth.users.id = public.profiles.id
WHERE email = 'YOUR_EMAIL_HERE';
