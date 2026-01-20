-- Fix Function Search Paths (Security Best Practice)
-- Setting search_path prevents malicious code from overriding standard functions if a user can create objects in public schema.

ALTER FUNCTION public.handle_new_vote(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_like(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_remove_like(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_random_alias() SET search_path = public, pg_temp;
ALTER FUNCTION public.auto_assign_alias() SET search_path = public, pg_temp;

-- Fix View Security (Security Definer -> Security Invoker)
-- Views defined as SECURITY DEFINER runs with the permissions of the view owner (often postgres/superuser).
-- This bypasses RLS policies on underlying tables. We want them to respect the querying user's RLS.
-- Since we cannot simple "ALTER VIEW" to remove SECURITY DEFINER (it's implicit based on owner unless changed),
-- we usually just need to not have it, but standard views are fine. Supabase usually flags this if we specifically
-- set it or if it interacts with RLS tables.
-- Actually, Postgres 15+ allows `security_invoker = true`. If this fails (older PG), we might need to recreate.
-- But Supabase is usually on PG15 now.

-- Trying ALTER VIEW first.
ALTER VIEW public.public_profiles SET (security_invoker = true);
ALTER VIEW public.public_posts SET (security_invoker = true);

-- Note: If the views were created with `CREATE VIEW ... WITH (security_barrier)` or similar, this just adds/updates options.
