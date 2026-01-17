# Automated Email Confirmation Setup

## What This Does

When you click "Approve" for a user in the admin dashboard, the system will **automatically**:
1. ✅ Set their status to 'approved'
2. ✅ Confirm their email address
3. ✅ Allow them to login with magic link immediately

**No more manual SQL scripts needed!**

## Setup Instructions

### Step 1: Run the Database Trigger (One-Time Setup)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** → **New query**
4. Copy and paste the contents of `auto_confirm_on_approval.sql`
5. Click **Run**

This creates:
- A database trigger that auto-confirms emails on approval
- Confirms any currently approved users who aren't confirmed yet

### Step 2: Restart Your Dev Server (Already Done)

The code changes are already in place:
- `src/app/actions/admin.ts` has been updated
- The `approveUser` function now auto-confirms emails

Just make sure your dev server is running (it is).

### Step 3: Test It!

1. Go to admin dashboard: `http://localhost:3000/admin`
2. Find a pending user
3. Click **"Approve"**
4. ✅ User is approved
5. ✅ Email is automatically confirmed
6. ✅ User can now login with magic link!

## How It Works

### Frontend (Application Code)
When you click "Approve" in the admin dashboard:

```typescript
// src/app/actions/admin.ts
export async function approveUser(userId: string) {
    // 1. Update profile status
    await supabaseAdmin
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

    // 2. Auto-confirm email
    await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
    );
}
```

### Backend (Database Trigger)
As a backup, the database also has a trigger:

```sql
-- When profile.status changes to 'approved'
-- Automatically set auth.users.email_confirmed_at = NOW()
```

This provides **double protection** - both the app and database ensure emails are confirmed.

## Benefits

### Before (Manual Process)
1. Admin approves user
2. User tries to login with magic link
3. ❌ Doesn't work (email not confirmed)
4. Admin has to run SQL script manually
5. User tries again
6. ✅ Finally works

### After (Automated)
1. Admin approves user
2. ✅ Email automatically confirmed
3. User can login immediately with magic link
4. ✅ Works first time!

## What Users Can Do After Approval

Once approved, users can login using:

### Option 1: Magic Link (Now Works!)
1. Go to login page
2. Enter email
3. Click "Send Magic Link"
4. Check email
5. Click link
6. ✅ Logged in!

### Option 2: Password
1. Go to login page
2. Click "Password" tab
3. Enter email + password
4. ✅ Logged in!

## Troubleshooting

### If Auto-Confirmation Doesn't Work

**Check 1: Verify Trigger is Installed**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_profile_approved';
```

**Check 2: Check Function Exists**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'auto_confirm_email_on_approval';
```

**Check 3: Test Manually**
```sql
-- Approve a test user
UPDATE public.profiles 
SET status = 'approved' 
WHERE email = 'test@example.com';

-- Check if email was confirmed
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'test@example.com';
```

### If Still Having Issues

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify admin client has proper permissions
4. Make sure trigger is enabled

## Maintenance

### View All Users and Their Status
```sql
SELECT 
    u.email,
    p.status,
    u.email_confirmed_at,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Can Login'
        ELSE '❌ Cannot Login'
    END as login_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

### Manually Confirm a Specific User (If Needed)
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Confirm All Approved Users (Bulk Fix)
```sql
UPDATE auth.users u
SET email_confirmed_at = NOW()
FROM public.profiles p
WHERE u.id = p.id
  AND p.status = 'approved'
  AND u.email_confirmed_at IS NULL;
```

## Summary

✅ **Automated**: Email confirmation happens automatically on approval
✅ **Dual System**: Both app code and database trigger ensure it works
✅ **Immediate Access**: Users can login right after approval
✅ **No Manual Work**: No more running SQL scripts manually
✅ **Backward Compatible**: Works for existing and new users

## Files Modified

1. **`src/app/actions/admin.ts`** - Updated `approveUser` function
2. **`supabase/auto_confirm_on_approval.sql`** - Database trigger (run once)

## Next Steps

1. ✅ Run `auto_confirm_on_approval.sql` in Supabase SQL Editor
2. ✅ Test by approving a user
3. ✅ Verify user can login with magic link
4. 🎉 Enjoy automated email confirmation!
