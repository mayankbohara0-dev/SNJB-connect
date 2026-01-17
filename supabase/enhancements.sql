-- 0. Ensure extension for gen_random_uuid() (optional, only if using gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure public.comments exists (create a minimal table if it doesn't).
--    If you already have a comments table, remove or skip this CREATE TABLE block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN
    CREATE TABLE public.comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END;
$$;

-- 2. Add 'bio' to profiles (max 150 chars)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text CHECK (char_length(bio) <= 150);

-- 3. Add 'parent_id' to comments for threading (self-referential FK)
--    Use ALTER TABLE ... ADD COLUMN IF NOT EXISTS, then add the FK constraint only if missing.
DO $$
BEGIN
  -- Add column if missing
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.comments
    ADD COLUMN parent_id uuid;
  END IF;

  -- Add FK constraint if missing
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'comments'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- 4. Create index for parent_id if not exists
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);
