'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, Shield, Plus, User } from 'lucide-react';
import { useMemo } from 'react';

export default function BottomNav({ isAdmin, debugRole }: { isAdmin: boolean; debugRole?: string }) {
    const pathname = usePathname();

    // Hide on login, landing page, or non-app pages
    if (pathname === '/' || pathname === '/login' || pathname === '/approval-pending' || pathname === '/auth/callback') {
        return null;
    }

    const navItems = useMemo(() => {
        const items = [
            {
                label: 'Feed',
                href: '/feed',
                icon: Home,
            },
            {
                label: 'Resources',
                href: '/resources',
                icon: BookOpen,
            },
        ];

        if (isAdmin) {
            items.push({
                label: 'Admin',
                href: '/admin',
                icon: Shield,
            });
        }

        items.push({
            label: 'Profile',
            href: '/profile',
            icon: User,
        });

        return items;
    }, [isAdmin]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-soft rounded-full px-6 py-3 flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                                ${isActive ? 'text-primary bg-primary/10 scale-110' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                            `}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>
                            )}
                        </Link>
                    );
                })}

                {/* Simulated "Add" button for visual balance if needed, or just link to Create Post which is usually on Feed */}
                {/* For now keeping it clean with just navigation items as requested, but floating style makes it look "App-like" */}
            </div>
        </div>
    );
}
