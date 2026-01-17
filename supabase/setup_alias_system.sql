-- Anonymous Identity System Migration

-- 1. Add Alias Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS alias text UNIQUE,
ADD COLUMN IF NOT EXISTS last_alias_change timestamp with time zone;

-- 2. Function to Generate Random Alias
CREATE OR REPLACE FUNCTION generate_random_alias()
RETURNS text AS $$
DECLARE
  adjectives text[] := ARRAY['Neon', 'Cyber', 'Mystic', 'Iron', 'Golden', 'Silent', 'Cosmic', 'Hyper', 'Swift', 'Dark', 'Light', 'Wild', 'Urban', 'Tech', 'Digital', 'Solar', 'Lunar', 'Arctic', 'Crimson', 'Azure'];
  nouns text[] := ARRAY['Wolf', 'Tiger', 'Eagle', 'Falcon', 'Hawk', 'Fox', 'Owl', 'Panda', 'Bear', 'Shark', 'Viper', 'Cobra', 'Raven', 'Phoenix', 'Dragon', 'Titan', 'Ghost', 'Shadow', 'Storm', 'Spark'];
  new_alias text;
  is_unique boolean := false;
BEGIN
  FOR i IN 1..20 LOOP
    -- Try Adjective + Noun (Clean and Crisp)
    new_alias := adjectives[1 + floor(random() * array_length(adjectives, 1))::int] || ' ' || 
                 nouns[1 + floor(random() * array_length(nouns, 1))::int];
                 
    -- 20% chance to add a small number for variety if collisions are high
    IF i > 10 THEN
       new_alias := new_alias || ' ' || floor(random() * 99)::text;
    END IF;

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE alias = new_alias) THEN
      is_unique := true;
      EXIT;
    END IF;
  END LOOP;
  
  -- Fallback
  IF NOT is_unique THEN
    new_alias := 'Agent ' || floor(random() * 9999)::text;
  END IF;
  
  RETURN new_alias;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to Auto-Assign Alias on Approval
CREATE OR REPLACE FUNCTION auto_assign_alias()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to approved AND alias is missing
  IF NEW.status = 'approved' AND (OLD.status != 'approved' OR OLD.status IS NULL) AND NEW.alias IS NULL THEN
     NEW.alias := generate_random_alias();
     NEW.last_alias_change := now(); -- Set initial change time
  END IF;
  return NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_approve_assign_alias ON public.profiles;
CREATE TRIGGER on_approve_assign_alias
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE auto_assign_alias();

-- 4. Backfill Existing Approved Users
-- We use a DO block to update null aliases
DO $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE status = 'approved' AND alias IS NULL LOOP
    UPDATE public.profiles 
    SET alias = generate_random_alias(),
        last_alias_change = now() - interval '20 days' -- Allow immediate change
    WHERE id = r.id;
  END LOOP;
END $$;

-- 5. Update public_posts VIEW to use ALIAS
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
  -- Use Alias if exists, otherwise fallback to username (legacy safety)
  COALESCE(pr.alias, pr.username) AS author_alias,
  -- We include is_liked logic in frontend, but view remains simple
  pr.karma -- Maybe expose author karma too? useful for credibility
FROM public.posts p
LEFT JOIN public.profiles pr ON pr.id = p.user_id
WHERE p.is_approved = true;

GRANT SELECT ON public.public_posts TO authenticated, anon;
