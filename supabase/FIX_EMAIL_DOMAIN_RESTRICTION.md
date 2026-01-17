# URGENT FIX: Supabase Email Domain Restriction

## Problem Identified ✅
Supabase is rejecting Gmail addresses with error:
```
Email address "teststudent123@gmail.com" is invalid
```

This is a **Supabase backend configuration issue**, not a frontend problem.

## Root Cause
Your Supabase project has **Email Domain Restrictions** enabled that only allow specific domains (probably @snjb.org).

## Solution: Update Supabase Settings

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **alwwkmbbjwjlenpttaif**

### Step 2: Navigate to Auth Settings
1. Click **Authentication** in the left sidebar
2. Click **Settings** (or **Providers**)
3. Look for **Email** provider settings

### Step 3: Remove Email Domain Restrictions

Look for one of these settings:

#### Option A: Email Domain Allowlist
- If you see **"Email Domain Allowlist"** or **"Allowed Email Domains"**
- It might be set to: `snjb.org` or similar
- **Solution**: 
  - Either **remove all entries** (to allow all domains)
  - Or **add**: `gmail.com`, `yahoo.com`, `outlook.com`, etc.

#### Option B: Email Domain Blocklist
- If you see **"Email Domain Blocklist"** or **"Blocked Email Domains"**
- Make sure `gmail.com` is NOT in the blocklist
- **Solution**: Remove `gmail.com` from blocklist if present

#### Option C: Email Validation Settings
- Look for **"Email Validation"** or **"Email Format Validation"**
- There might be a regex pattern or custom validation
- **Solution**: Set it to accept standard email formats

### Step 4: Save Changes
1. Click **Save** or **Update**
2. Wait a few seconds for changes to propagate

### Step 5: Test Registration
1. Go back to `http://localhost:3000/register`
2. Try registering with a Gmail address
3. Should work now!

## Alternative Solution: Disable Email Validation (Development Only)

If you can't find the domain restriction settings:

### Via Supabase Dashboard
1. Go to **Authentication** → **Settings**
2. Look for **"Email Validation"** or **"Email Provider Settings"**
3. Disable strict email validation (if available)

### Via SQL (Advanced)
Run this in Supabase SQL Editor to check current settings:

```sql
-- Check auth configuration
SELECT * FROM auth.config;

-- If there's a domain restriction, you may need to update it
-- (This depends on your Supabase version and setup)
```

## Quick Test After Fix

After updating Supabase settings, test with:
- Email: `test@gmail.com`
- Should register successfully without "invalid email" error

## Screenshots Location
Error screenshot saved at:
`registration_error_gmail_1768588453020.png`

Shows the exact error: "Email address \"teststudent123@gmail.com\" is invalid"

## What to Look For in Supabase Dashboard

Common locations for email restrictions:
1. **Authentication** → **Settings** → **Email Auth**
2. **Authentication** → **Providers** → **Email**
3. **Project Settings** → **Auth** → **Email Settings**
4. **Authentication** → **Policies** (less common)

## If You Can't Find the Setting

Contact Supabase support or:
1. Create a new Supabase project without restrictions
2. Migrate your data
3. Update your `.env.local` with new project credentials

## Temporary Workaround (Not Recommended)

If you need to allow users immediately while fixing Supabase:
- Manually create accounts in Supabase Dashboard
- Go to **Authentication** → **Users**
- Click **"Invite User"** or **"Add User"**
- Enter their email and set a password
- They can then login

## Expected Behavior After Fix

✅ Users can register with ANY email:
- Gmail: `user@gmail.com`
- Yahoo: `user@yahoo.com`
- Outlook: `user@outlook.com`
- Custom domains: `user@example.com`

## Need Help?

If you can't find the email restriction settings:
1. Take a screenshot of your Supabase Auth settings page
2. Check Supabase documentation for your version
3. Look for "Email Domain" or "Email Validation" in settings
