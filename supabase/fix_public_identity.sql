-- PERMANENT IDENTITY FIX
-- 1. Ensure generate_random_alias function exists (from setup_alias_system.sql)
-- (Re-defining here to be safe and self-contained)

CREATE OR REPLACE FUNCTION generate_random_alias()
RETURNS text AS $$
DECLARE
  adjectives text[] := ARRAY['Neon', 'Cyber', 'Mystic', 'Iron', 'Golden', 'Silent', 'Cosmic', 'Hyper', 'Swift', 'Dark', 'Light', 'Wild', 'Urban', 'Tech', 'Digital', 'Solar', 'Lunar', 'Arctic', 'Crimson', 'Azure'];
  nouns text[] := ARRAY['Wolf', 'Tiger', 'Eagle', 'Falcon', 'Hawk', 'Fox', 'Owl', 'Panda', 'Bear', 'Shark', 'Viper', 'Cobra', 'Raven', 'Phoenix', 'Dragon', 'Titan', 'Ghost', 'Shadow', 'Storm', 'Spark'];
  new_alias text;
  is_unique boolean := false;
BEGIN
  FOR i IN 1..20 LOOP
    new_alias := adjectives[1 + floor(random() * array_length(adjectives, 1))::int] || ' ' || 
                 nouns[1 + floor(random() * array_length(nouns, 1))::int];
    IF i > 10 THEN
       new_alias := new_alias || ' ' || floor(random() * 99)::text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE alias = new_alias) THEN
      is_unique := true;
      EXIT;
    END IF;
  END LOOP;
  IF NOT is_unique THEN
    new_alias := 'Agent ' || floor(random() * 9999)::text;
  END IF;
  RETURN new_alias;
END;
$$ LANGUAGE plpgsql;

-- 2. Update Trigger to ALWAYS assign Alias
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, real_name, username, role, status, alias, last_alias_change)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student',
    'pending',
    generate_random_alias(), -- Always generate alias
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Views to NEVER show username/email
DROP VIEW IF EXISTS public.public_posts;
CREATE VIEW public.public_posts AS
SELECT
  p.id,
  p.created_at,
  p.content,
  p.image_url,
  p.tags,
  p.type,
  p.user_id,
  p.upvotes,
  p.downvotes,
  p.poll_options,
  -- Fallback to "Anonymous" if alias is missing (Should not happen, but safe)
  COALESCE(pr.alias, 'Anonymous') AS author_alias,
  pr.karma
FROM public.posts p
LEFT JOIN public.profiles pr ON pr.id = p.user_id
WHERE p.is_approved = true;

GRANT SELECT ON public.public_posts TO authenticated, anon;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT
    id,
    COALESCE(alias, 'Anonymous') as alias, -- Never null
    -- username intentionally OMITTED or masked to prevent leaks
    'student' as username, 
    karma,
    role
FROM public.profiles
WHERE status = 'approved';

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 4. Backfill ANY missing aliases
UPDATE public.profiles
SET alias = generate_random_alias(),
    last_alias_change = now()
WHERE alias IS NULL;
