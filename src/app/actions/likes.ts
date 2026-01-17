'use server';

import { createServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function toggleLike(postId: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if like exists
        const { data: existingLike } = await (supabase
            .from('post_likes') as any)
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // UNLIKE: Remove the like
            const { error } = await supabase
                .from('post_likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) throw error;
            return { success: true, liked: false };
        } else {
            // LIKE: Create new like
            const { error } = await (supabase
                .from('post_likes') as any)
                .insert({
                    post_id: postId,
                    user_id: user.id
                });

            if (error) throw error;
            return { success: true, liked: true };
        }
    } catch (error: any) {
        console.error('Like error:', error);
        return { success: false, error: error.message };
    }
}
