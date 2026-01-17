'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadNoteMetadata } from '@/app/actions/resources';

export default function UploadNote() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('Sem 1');
    const [uploading, setUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload File to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('notes')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(filePath);

            // 3. Save Metadata to DB via Server Action
            const result = await uploadNoteMetadata(publicUrl, title, subject, semester);
            if (!result.success) throw new Error(result.error);

            alert('Note uploaded successfully!');
            setFile(null);
            setTitle('');
            setSubject('');
            setIsOpen(false);
        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
            >
                + Upload Notes
            </button>
        );
    }

    return (
        <div className="bg-surface border border-border p-4 rounded-xl shadow-lg mb-6 max-w-md">
            <h3 className="font-bold mb-4">Share Notes</h3>
            <form onSubmit={handleUpload} className="space-y-3">
                <input
                    type="text" placeholder="Title (e.g. Unit 1 Algebra)"
                    value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                    required
                />
                <input
                    type="text" placeholder="Subject (e.g. Maths)"
                    value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                    required
                />
                <select
                    value={semester} onChange={e => setSemester(e.target.value)}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={`Sem ${s}`}>Sem {s}</option>)}
                </select>
                <input
                    type="file" accept=".pdf"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    required
                />

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 text-sm">Cancel</button>
                    <button type="submit" disabled={uploading} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                        {uploading ? 'Uploading...' : 'Share PDF'}
                    </button>
                </div>
            </form>
        </div>
    );
}
