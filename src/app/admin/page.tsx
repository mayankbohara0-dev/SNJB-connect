import { createServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminEmail } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { UserRow } from '@/components/admin/UserRow'; // Used inside UserManagement potentially, but we import UserManagement here
import { CreateNotice } from '@/components/admin/CreateNotice';
import { UserManagement } from '@/components/admin/UserManagement';
import { NoticesList } from '@/components/admin/NoticesList';
import { ConfessionsList } from '@/components/admin/ConfessionsList';
import { ReportsList } from '@/components/admin/ReportsList';
import { TopNavbar } from '@/components/layout/TopNavbar';

export default async function AdminDashboardPage() {
    const supabase = await createServerClient();

    // Verify Admin Access
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Use Admin Client to bypass RLS for checking Role
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

    const profileData = profile as any;

    const isEmailAdmin = isAdminEmail(user.email);

    if (!isEmailAdmin && profileData?.role !== 'admin') {
        redirect('/feed');
    }

    // Self-healing: If email is admin but role/status is not, fix it.
    if (isEmailAdmin && (profileData?.role !== 'admin' || profileData?.status !== 'approved')) {
        await supabaseAdmin.from('profiles').update({
            role: 'admin',
            status: 'approved'
        }).eq('id', user.id);
    }

    // Fetch all users using Admin Client (Bypasses RLS)
    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching profiles:', JSON.stringify(error, null, 2));
    }

    // Fetch all notices
    const { data: notices, error: noticeError } = await supabaseAdmin
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

    if (noticeError) {
        console.error('Error fetching notices:', noticeError);
    }

    // Fetch reports
    const { data: reports, error: reportsError } = await supabaseAdmin
        .from('reports')
        .select(`
            *,
            post:posts(content, type, user_id),
            reporter:reported_by(email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    // Fetch all posts (for moderation)
    const { data: allPosts, error: postsError } = await supabaseAdmin
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to recent 50 for now to avoid overload

    const pendingUsers = profiles?.filter((p: any) => p.status === 'pending') || [];
    const approvedUsers = profiles?.filter((p: any) => p.status === 'approved') || [];
    const bannedUsers = profiles?.filter((p: any) => p.status === 'banned') || [];

    return (
        <div className="min-h-screen bg-background pb-8">
            <TopNavbar userId={user.id} />

            <div className="max-w-6xl mx-auto px-6">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-gray-500 font-medium text-sm">Pending Request</h3>
                        <p className="text-3xl font-bold text-yellow-500">{pendingUsers.length}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-gray-500 font-medium text-sm">Active Students</h3>
                        <p className="text-3xl font-bold text-green-500">{approvedUsers.length}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-gray-500 font-medium text-sm">Banned Users</h3>
                        <p className="text-3xl font-bold text-red-500">{bannedUsers.length}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-gray-500 font-medium text-sm">Reported Posts</h3>
                        <p className="text-3xl font-bold text-warning">0</p>
                    </div>
                </div>

                {/* Create Notice Section */}
                <div className="mb-8">
                    <CreateNotice />
                    <NoticesList initialNotices={notices || []} />
                    <ConfessionsList initialPosts={allPosts || []} />
                </div>

                {/* Reports Section */}
                <ReportsList initialReports={reports || []} />

                {/* User Management Section */}
                <UserManagement initialUsers={profiles || []} />
            </div>
        </div>
    );
}
