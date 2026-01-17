'use server';

import { createServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized');

        // Verify Admin
        const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('role')
            .eq('id', user.id)
            .single();

        const profileData = profile as any;

        if (profileData?.role !== 'admin') {
            throw new Error('Unauthorized: Admin access required');
        }

        const { error } = await (supabase
            .from('posts') as any)
            .delete()
            .eq('id', postId);

        if (error) throw error;
        revalidatePath('/feed');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
