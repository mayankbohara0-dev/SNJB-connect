-- Force update the role for your specific email
UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'mayankbohara0@gmail.com'
);

-- Initial check to confirm it exists
SELECT email, role, status
FROM auth.users 
JOIN public.profiles ON auth.users.id = public.profiles.id
WHERE email = 'mayankbohara0@gmail.com';
