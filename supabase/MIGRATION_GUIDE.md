# Database Migration Guide

## Issue
The application is trying to query `created_at` and `status` columns from the `profiles` table, but these columns don't exist in your current database schema.

## Solution
Run the migration SQL file to add the missing columns to your existing database.

## Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the contents of `supabase/add_created_at_column.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Success**
   - You should see a success message
   - The columns `created_at` and `status` are now added to your `profiles` table

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "c:\Users\Mayank-Pc\Downloads\New folder"

# Run the migration
supabase db execute --file supabase/add_created_at_column.sql
```

### Option 3: For Fresh Database Setup

If you're setting up a fresh database or want to recreate everything:

1. Run `supabase/schema.sql` first (creates the base tables)
2. Run `supabase/resources.sql` (creates additional tables like notes, events)
3. Run `supabase/add_created_at_column.sql` (adds missing columns if needed)

## What the Migration Does

1. **Adds `created_at` column**
   - Type: `timestamp with time zone`
   - Default: Current UTC time
   - For existing rows: Uses `updated_at` value or current time

2. **Adds `status` column**
   - Type: `text` with CHECK constraint
   - Valid values: 'pending', 'approved', 'banned'
   - Default: 'pending'
   - For existing rows: Sets 'approved' for admin users, 'pending' for others

3. **Sets default for `updated_at`**
   - Ensures new rows get automatic timestamps

## After Migration

Once you run the migration:
1. Refresh your browser (the error should be gone)
2. The admin dashboard should now work correctly
3. Users will be sorted by creation date
4. The approval system will work properly

## Troubleshooting

If you still see errors after migration:
1. Check that the migration ran successfully (no SQL errors)
2. Clear your browser cache
3. Restart the development server (`npm run dev`)
4. Check the browser console for any new errors
