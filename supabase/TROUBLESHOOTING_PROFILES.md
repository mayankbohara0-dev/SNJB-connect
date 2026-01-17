# Troubleshooting: Missing User Registration Requests

## Problem
Your friend registered but their profile doesn't appear in the admin dashboard for approval.

## Root Cause
The database trigger that automatically creates a profile when a user signs up might not be:
1. Created in your database yet
2. Working properly
3. Or existing users registered before the trigger was set up

## Solution: Run the Fix Script

### Step 1: Run Diagnostic (Optional)
To see what's wrong, run `supabase/diagnose_profile_issue.sql` in Supabase SQL Editor.

This will show you:
- If the trigger exists
- Which users don't have profiles
- Current table structure

### Step 2: Run the Fix Script (Required)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Fix**
   - Copy the entire contents of `supabase/fix_missing_profiles.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl+Enter`

4. **Check the Results**
   - At the bottom of the script, you'll see a verification query
   - It will show all users with ✅ or ❌ indicating if they have profiles
   - All users should now have ✅ HAS PROFILE

### Step 3: Verify in Admin Dashboard

1. Refresh your admin dashboard at `http://localhost:3000/admin`
2. You should now see your friend's registration request in the "Pending" section
3. You can approve or manage their account

## What the Fix Does

1. **Recreates the trigger function** with better error handling
2. **Ensures the trigger is active** on the auth.users table
3. **Creates profiles for ALL existing users** who don't have one (including your friend)
4. **Sets proper defaults**:
   - Admin users: `status = 'approved'`
   - Regular users: `status = 'pending'`
5. **Verifies the fix** by showing all users and their profile status

## Prevention

After running this fix:
- All future user registrations will automatically create profiles
- The trigger has error handling to prevent silent failures
- You can monitor the verification query to ensure it's working

## Common Issues

### Issue: "Permission denied for table auth.users"
**Solution**: Make sure you're running this as a database admin or service role user in Supabase.

### Issue: Still not seeing users
**Solution**: 
1. Check if your friend actually completed the email verification
2. Run the diagnostic script to see if they're in auth.users
3. Check browser console for any errors during registration

### Issue: Trigger not firing for new users
**Solution**: 
1. Verify the trigger exists: Run query 1 from the diagnostic script
2. Check Supabase logs for any errors
3. Try creating a test user to see if the trigger fires

## Testing the Fix

To test if everything works:

1. **Create a test account**
   - Use a different email (e.g., test@example.com)
   - Complete the magic link or password signup

2. **Check admin dashboard**
   - The new user should appear immediately in "Pending" section

3. **Approve the user**
   - Click "Approve" button
   - User should move to "Active Students" section

## Need More Help?

If the issue persists:
1. Run the diagnostic script and share the results
2. Check Supabase logs in Dashboard > Logs
3. Look for any errors in the browser console during registration
