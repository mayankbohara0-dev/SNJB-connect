'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getAvatarUrl } from '@/lib/utils';
import { Trophy, Star } from 'lucide-react';

export function KarmaLeaderboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            const { data } = await supabase
                .from('public_profiles')
                .select('*')
                .order('karma', { ascending: false })
                .limit(5);
            setUsers(data || []);
            setLoading(false);
        }
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="h-40 animate-pulse bg-gray-50 rounded-xl" />;

    return (
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" />
                Top Students
            </h3>
            <div className="space-y-4">
                {users.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold w-4 ${index === 0 ? 'text-yellow-500 text-base' :
                                index === 1 ? 'text-gray-400' :
                                    index === 2 ? 'text-orange-400' : 'text-muted'
                                }`}>
                                #{index + 1}
                            </span>
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                                <img src={getAvatarUrl(user.id)} alt="Av" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    {user.alias || user.username || 'Student'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full border border-yellow-100">
                            <Star size={10} className="fill-yellow-500" />
                            <span className="text-xs font-bold">{user.karma || 0}</span>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <div className="text-xs text-muted text-center py-4">No karma points yet!</div>}
            </div>
        </div>
    );
}
