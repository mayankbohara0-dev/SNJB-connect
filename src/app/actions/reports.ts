'use server';

import { createServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function reportPost(postId: string, reportedUserId: string, reason: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if user has already reported this post
        const { data: existingReport } = await supabase
            .from('reports')
            .select('id')
            .eq('post_id', postId)
            .eq('reported_by', user.id)
            .single();

        if (existingReport) {
            return { success: false, error: 'You have already reported this post' };
        }

        // Create the report
        const { error } = await (supabase
            .from('reports') as any)
            .insert({
                post_id: postId,
                reported_by: user.id,
                reported_user: reportedUserId,
                reason: reason,
                status: 'pending'
            });

        if (error) throw error;

        revalidatePath('/feed');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
