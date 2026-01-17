'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveUser, banUser, deleteUser } from '@/app/actions/admin';
import { getAvatarUrl } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface UserRowProps {
    id: string;
    email: string;
    realName: string | null;
    alias?: string | null; // Added alias
    status: string;
    role: string;
    createdAt: string;
}

export const UserRow: React.FC<UserRowProps> = ({ id, email, realName, alias, status, role, createdAt }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleApprove = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm(`Approve access for ${email}?`)) return;
        setLoading(true);
        await approveUser(id);
        setLoading(false);
    };

    const handleBan = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm(`Are you sure you want to BAN ${email}?`)) return;
        setLoading(true);
        await banUser(id);
        setLoading(false);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm(`⚠️ PERMANENTLY DELETE ${email}?\n\nThis will:\n- Delete their profile\n- Delete their auth account\n- Remove all their data\n\nThis action CANNOT be undone!`)) return;
        setLoading(true);
        const result = await deleteUser(id);
        if (result.success) {
            alert('User deleted successfully');
        } else {
            alert(`Error: ${result.error}`);
        }
        setLoading(false);
    };

    const isPending = status === 'pending';

    return (
        <tr
            onClick={() => router.push(`/admin/users/${id}`)}
            className="border-b border-border hover:bg-surface-hover/50 transition-colors cursor-pointer"
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                        <img src={getAvatarUrl(id)} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{realName || 'N/A'}</span>
                        {alias && <span className="text-xs text-primary font-bold">@{alias}</span>}
                    </div>
                </div>
            </td>
            <td className="py-4 px-4 text-sm text-gray-500">{email}</td>
            <td className="py-4 px-4 text-sm text-gray-500">{new Date(createdAt).toLocaleDateString('en-GB')}</td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {status.toUpperCase()}
                </span>
            </td>
            <td className="py-4 px-4 text-right space-x-2">
                {isPending && (
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                        Approve
                    </button>
                )}
                {status !== 'banned' && role !== 'admin' && (
                    <button
                        onClick={handleBan}
                        disabled={loading}
                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                        Ban
                    </button>
                )}
                {role !== 'admin' && (
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-white bg-gray-800 hover:bg-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1"
                        title="Permanently delete this user"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                )}
            </td>
        </tr>
    );
};
