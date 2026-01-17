-- View for Public Profile Data (Leaderboard)

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT
    id,
    alias,
    username,
    karma,
    role
FROM public.profiles
WHERE status = 'approved'; -- Only show approved users

-- Grant access
GRANT SELECT ON public.public_profiles TO authenticated, anon;
