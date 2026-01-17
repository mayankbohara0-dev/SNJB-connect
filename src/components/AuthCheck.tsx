'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                if (pathname !== '/login' && pathname !== '/auth/callback') {
                    router.push('/login');
                }
                setLoading(false);
                return;
            }

            // Admin Bypass: Hardcoded admin email gets instant access regardless of DB status delay
            const isAdmin = user.email === 'mayankbohara0@gmail.com' || (process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

            if (isAdmin) {
                // If on restricted pages, go to feed. Otherwise let them pass.
                if (pathname === '/approval-pending' || pathname === '/login') {
                    router.push('/feed');
                }
                setLoading(false);
                return;
            }


            // Check profile status for everyone else
            const { data: profile } = await supabase
                .from('profiles')
                .select('status, role, profile_completed, created_at')
                .eq('id', user.id)
                .single();

            if (profile) {
                if (profile.status === 'pending') {
                    // Pending approval
                    if (pathname !== '/approval-pending') {
                        router.push('/approval-pending');
                    }
                } else if (profile.status === 'approved' || profile.role === 'admin') {
                    // Check if profile is completed for NEW users only
                    // Users created after this feature was added should complete profile
                    const profileCreatedAt = new Date(profile.created_at);
                    const featureReleaseDate = new Date('2026-01-17'); // Today
                    const isNewUser = profileCreatedAt >= featureReleaseDate;

                    if (!profile.profile_completed && profile.role !== 'admin' && isNewUser) {
                        // Redirect NEW users to profile setup
                        if (pathname !== '/setup-profile') {
                            router.push('/setup-profile');
                        }
                    } else {
                        // Profile completed or existing user, allow access
                        if (pathname === '/approval-pending' || pathname === '/login' || pathname === '/setup-profile') {
                            router.push('/feed');
                        }
                    }
                }
            }

            setLoading(false);
        };

        checkAuth();
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
