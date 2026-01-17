'use server';

import { createServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminEmail } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

// Helper to verify admin status before actions
const checkAdmin = async () => {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Double check admin status (though UI hides buttons)
    // We can use standard client for reading own profile if RLS allows, or just trust the ID check if we are rigorous.
    // Ideally use admin client to verify role
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Explicit casting
    const profileData = profile as any;
    const isEmailAdmin = isAdminEmail(user.email);

    if (!isEmailAdmin && profileData?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }

    return true; // Authorized
};

export async function approveUser(userId: string) {
    try {
        await checkAdmin();

        // Step 1: Update profile status to approved
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'approved' })
            .eq('id', userId);

        if (profileError) throw profileError;

        // Step 2: Automatically confirm user's email so they can login with magic link
        // This updates the auth.users table to set email_confirmed_at
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { email_confirm: true }
        );

        if (emailError) {
            console.error('Error confirming email:', emailError);
            // Don't throw - approval still succeeded, just email confirmation failed
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function banUser(userId: string) {
    try {
        await checkAdmin();

        // Use Admin Client for the update to bypass RLS
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'banned' })
            .eq('id', userId);

        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        await checkAdmin();

        // First, delete the profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) throw profileError;

        // Then, delete the auth user (requires admin client)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) throw authError;

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
