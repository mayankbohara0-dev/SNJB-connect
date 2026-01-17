-- Create Reports Table
-- Run this in Supabase SQL Editor

-- Step 1: Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    reported_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    reason text NOT NULL,
    status text CHECK (status IN ('pending', 'reviewed', 'dismissed')) DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- Step 2: Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policy - Users can create reports
CREATE POLICY "reports_insert" ON public.reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = reported_by);

-- Step 4: RLS Policy - Users can see their own reports
CREATE POLICY "reports_select_own" ON public.reports
    FOR SELECT TO authenticated
    USING (auth.uid() = reported_by);

-- Step 5: RLS Policy - Admins can view all reports
CREATE POLICY "reports_select_admin" ON public.reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Step 6: RLS Policy - Admins can update reports (mark as reviewed/dismissed)
CREATE POLICY "reports_update_admin" ON public.reports
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Step 7: Create index for faster queries
CREATE INDEX IF NOT EXISTS reports_reported_user_idx ON public.reports(reported_user);
CREATE INDEX IF NOT EXISTS reports_post_id_idx ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);

-- Step 8: Verify the table was created
SELECT * FROM public.reports LIMIT 1;
