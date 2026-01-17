'use client';

import { useState } from 'react';
import { createEvent } from '@/app/actions/resources';

export default function CreateEvent() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await createEvent(formData);
        if (res.success) {
            setIsOpen(false);
            e.currentTarget.reset();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-accent hover:bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
            >
                + Create Event
            </button>
        );
    }

    return (
        <div className="bg-surface border border-border p-4 rounded-xl shadow-lg mb-6 max-w-md">
            <h3 className="font-bold mb-4">Host an Event</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input name="title" type="text" placeholder="Event Name" required className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
                <textarea name="description" placeholder="Details..." className="w-full bg-background border border-border rounded px-3 py-2 text-sm h-20" />
                <input name="location" type="text" placeholder="Location (e.g. Auditorium)" required className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
                <input name="date" type="datetime-local" required className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-accent text-black px-3 py-1.5 rounded-lg text-sm font-bold">
                        {loading ? 'Creating...' : 'Host Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
