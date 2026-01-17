'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { UserRow } from './UserRow';
import { Card } from '@/components/ui/Card';

interface User {
    id: string;
    email: string;
    real_name: string | null;
    alias?: string | null;
    status: string;
    role: string;
    updated_at: string;
}

interface UserManagementProps {
    initialUsers: User[];
}

export function UserManagement({ initialUsers }: UserManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch = (
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.real_name && user.real_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = initialUsers.filter(u => u.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Student Database</h2>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:border-primary outline-none"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 rounded-lg bg-surface border border-border focus:border-primary outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Active</option>
                        <option value="pending">Pending</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            {/* Pending Alert */}
            {pendingCount > 0 && filterStatus === 'all' && !searchTerm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        <p className="text-yellow-800 font-bold">{pendingCount} students waiting for approval</p>
                    </div>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className="text-xs font-bold text-yellow-700 hover:text-yellow-900 underline"
                    >
                        View Pending
                    </button>
                </div>
            )}

            <Card className="overflow-hidden border border-border bg-surface">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-hover/50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Joined</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        id={user.id}
                                        email={user.email}
                                        realName={user.real_name}
                                        alias={user.alias}
                                        status={user.status}
                                        role={user.role}
                                        createdAt={user.updated_at || new Date().toISOString()}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
