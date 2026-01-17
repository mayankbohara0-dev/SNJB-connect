const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function approveAndPromote(email) {
    console.log(`[Test Setup] Approving and Promoting ${email}...`);

    // Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('[Error] User not found! Please register the user first via browser or API.');
        process.exit(1);
    }

    // Update Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'approved', role: 'admin' })
        .eq('id', user.id);

    if (updateError) console.error('Error updating profile:', updateError);
    else console.log('Success: User approved and promoted to ADMIN.');
}

async function cleanup(email) {
    console.log(`[Test Cleanup] Cleaning up ${email}...`);

    // Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found, nothing to clean.');
        return;
    }

    const userId = user.id;

    // Explicitly delete content created by this user
    // Although CASCADE might handle it, we want to be 100% sure for "permanent" reliability
    console.log(`Deleting data for user ${userId}...`);

    await Promise.all([
        supabase.from('posts').delete().eq('user_id', userId),
        supabase.from('notices').delete().eq('created_by', userId),
        supabase.from('reports').delete().eq('reported_by', userId),
        supabase.from('reports').delete().eq('reported_user', userId),
        // Add other tables here if needed
    ]);

    // Delete User (Auth + Cascade to Profiles)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) console.error('Error deleting user:', deleteError);
    else console.log('Success: Test user and all associated data deleted.');
}

const action = process.argv[2];
const email = process.argv[3];

if (!email) {
    console.log('Usage: node scripts/manage-test-user.js <promote|cleanup> <email>');
    process.exit(1);
}

if (action === 'promote') {
    approveAndPromote(email);
} else if (action === 'cleanup') {
    cleanup(email);
} else {
    console.log('Usage: node scripts/manage-test-user.js <promote|cleanup> <email>');
}
