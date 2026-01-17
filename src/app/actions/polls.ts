'use server';

import { createServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function voteOnPoll(postId: string, optionId: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized');

        // Insert vote
        // Database unique constraint ensures checking for double voting
        const { error } = await (supabase
            .from('poll_votes') as any)
            .insert({
                post_id: postId,
                poll_option_id: optionId,
                user_id: user.id
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, error: 'You have already voted on this poll.' };
            }
            throw error;
        }

        revalidatePath('/feed');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
