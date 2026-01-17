'use server';

import { createServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const location = formData.get('location') as string;
        const dateStr = formData.get('date') as string;

        const { error } = await (supabase.from('events') as any).insert({
            user_id: user.id,
            title,
            description,
            location,
            event_date: new Date(dateStr).toISOString() // Validate date format
        });

        if (error) throw error;
        revalidatePath('/resources');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadNoteMetadata(fileUrl: string, title: string, subject: string, semester: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { error } = await (supabase.from('notes') as any).insert({
            user_id: user.id,
            title,
            subject,
            semester,
            file_url: fileUrl
        });

        if (error) throw error;
        revalidatePath('/resources');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleRSVP(eventId: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // Check if already RSVP'd
        const { data: existing } = await (supabase
            .from('event_rsvps') as any)
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            // Remove RSVP
            await (supabase.from('event_rsvps') as any).delete().eq('event_id', eventId).eq('user_id', user.id);
        } else {
            // Add RSVP
            await (supabase.from('event_rsvps') as any).insert({ event_id: eventId, user_id: user.id });
        }

        revalidatePath('/resources');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
