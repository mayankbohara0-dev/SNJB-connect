-- Hide Admin Status from Public View
-- Redefine public_profiles to MASK the role

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT
    id,
    COALESCE(alias, 'Anonymous') as alias,
    'student' as username, -- Mask username
    karma,
    'student' as role -- ALWAYS return 'student' to hide 'admin' status
FROM public.profiles
WHERE status = 'approved';

GRANT SELECT ON public.public_profiles TO authenticated, anon;
