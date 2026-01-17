'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ApprovalPendingPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⏳</span>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-4">Approval Pending</h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    Thanks for joining <strong>SNJB Connect</strong>! <br />
                    To keep our community safe and exclusive, an admin must approve your account.
                </p>

                <div className="bg-surface-hover rounded-xl p-4 mb-8 text-sm text-gray-400">
                    <p>Please wait for approval. You can check back later.</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-surface-hover hover:bg-gray-200 dark:hover:bg-gray-800 text-foreground font-semibold py-3 rounded-xl transition-colors border border-border"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
