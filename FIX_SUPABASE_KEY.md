# How to Fix Supabase Service Role Key Error - PERMANENT SOLUTION

## The Problem
Your admin dashboard cannot fetch user profiles because the `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is invalid.

## The Solution (5 Minutes)

### Step 1: Get Your Service Role Key

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Log in with your account

2. **Select Your Project**
   - Click on your project: `alwwkmbbjwjlenpttaif`

3. **Navigate to API Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API** in the settings menu

4. **Find Service Role Key**
   - Scroll down to **Project API keys**
   - You'll see two keys:
     - ✅ `anon` `public` - This is already correct in your .env.local
     - ✅ `service_role` `secret` - **THIS IS THE ONE YOU NEED**

5. **Copy the Service Role Key**
   - Click the eye icon (👁️) next to `service_role` to reveal it
   - Click the copy icon to copy the entire key
   - It should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...`

### Step 2: Update Your .env.local File

1. **Open `.env.local`** in your project root

2. **Replace the SUPABASE_SERVICE_ROLE_KEY line** with the key you just copied:

```env
NEXT_PUBLIC_SUPABASE_URL=https://alwwkmbbjwjlenpttaif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsd3drbWJiandqbGVucHR0YWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NDQyNjksImV4cCI6MjA4NDEyMDI2OX0.b6TzJfZEGdjpBVv0d2ElHJKrD2h8x_JQvDcTWJujbRE
SUPABASE_SERVICE_ROLE_KEY=<PASTE YOUR SERVICE ROLE KEY HERE>
```

3. **Save the file**

### Step 3: Restart Your Dev Server

1. **Stop the current server**
   - Go to your terminal running `npm run dev`
   - Press `Ctrl + C`

2. **Start it again**
   ```bash
   npm run dev
   ```

3. **Test the Admin Dashboard**
   - Go to http://localhost:3000/admin
   - The error should be gone!

---

## How to Verify It's Working

After restarting, you should see:
- ✅ No console errors about "Invalid API key"
- ✅ User counts showing correctly (Pending, Active, Banned)
- ✅ User list populated in the admin dashboard

---

## Why This Happened

The current key in your `.env.local` appears to be either:
- A custom JWT token (not a Supabase service role key)
- An expired or incorrect key
- A key from a different project

The service role key is required for admin operations that bypass Row Level Security (RLS), like viewing all user profiles.

---

## Security Note ⚠️

**NEVER commit `.env.local` to Git!**

The service role key has full database access. Make sure `.env.local` is in your `.gitignore` file (it already is).

---

## Still Having Issues?

If you're still seeing the error after following these steps:

1. **Double-check the key format**
   - It should be a long JWT token
   - No extra spaces or line breaks
   - Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

2. **Verify you copied the right key**
   - Make sure it's the `service_role` key, NOT the `anon` key
   - The label should say "service_role" and "secret"

3. **Check your Supabase project**
   - Make sure you're logged into the correct Supabase account
   - Verify the project URL matches: `alwwkmbbjwjlenpttaif`
