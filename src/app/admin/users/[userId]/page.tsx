import { createServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound, redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, GraduationCap, Calendar, Shield, AlertTriangle, FileText, Ban, Trash2, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { getAvatarUrl } from '@/lib/utils';

export default async function UserDetailsPage(props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;
    console.log("Admin User Details Page Loaded");
    console.log("UserID:", params.userId);

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if current user is admin
    if (!user) {
        redirect('/login');
    }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const adminData = adminProfile as any;
    if (adminData?.role !== 'admin') {
        redirect('/feed');
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', params.userId)
        .single();

    if (profileError || !profile) {
        console.error("Profile not found or error:", profileError);
        console.error("Profile data:", profile);
        notFound();
    }

    // Fetch user posts
    const { data: posts } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('user_id', params.userId)
        .order('created_at', { ascending: false });

    // Fetch reports against this user
    const { data: reports } = await supabaseAdmin
        .from('reports')
        .select('*, posts(content)')
        .eq('reported_user', params.userId)
        .order('created_at', { ascending: false });

    const postsCount = posts?.length || 0;
    const reportsCount = reports?.length || 0;
    const accountAge = profile.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="min-h-screen bg-background p-6 pb-32">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link href="/admin" className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-4">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Admin Dashboard</span>
                </Link>
                <h1 className="text-3xl font-bold text-foreground">User Details</h1>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                <img src={getAvatarUrl(profile.id)} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{profile.real_name || 'No Name'}</h2>
                            <p className="text-sm text-muted">{profile.username}</p>
                            {profile.alias && (
                                <div className="mt-2 inline-block px-3 py-1 bg-green-50 rounded-full border border-green-200">
                                    <span className="text-xs text-green-700 font-bold">@{profile.alias}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail size={16} className="text-muted" />
                                <span className="text-foreground">{profile.email}</span>
                            </div>

                            {profile.branch && (
                                <div className="flex items-center gap-3 text-sm">
                                    <GraduationCap size={16} className="text-muted" />
                                    <span className="text-foreground">{profile.branch}</span>
                                </div>
                            )}

                            {profile.year && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-muted" />
                                    <span className="text-foreground">{profile.year}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-sm">
                                <Shield size={16} className="text-muted" />
                                <span className="text-foreground capitalize">{profile.role || 'student'}</span>
                            </div>

                            <div className="pt-3 border-t border-border">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${profile.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {profile.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Statistics Card */}
                    <Card className="p-6">
                        <h3 className="font-bold text-foreground mb-4">Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted">Total Posts</span>
                                <span className="font-bold text-foreground">{postsCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted">Reports Received</span>
                                <span className="font-bold text-red-600">{reportsCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted">Account Age</span>
                                <span className="font-bold text-foreground">{accountAge} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted">Profile Completed</span>
                                <span className="font-bold text-foreground">{profile.profile_completed ? '✅' : '❌'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted">Karma Score</span>
                                <div className="flex items-center gap-1 font-bold text-yellow-600">
                                    <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                    <span>{profile.karma || 0}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="p-6">
                        <h3 className="font-bold text-foreground mb-4">Admin Actions</h3>
                        <div className="space-y-2">
                            {profile.status === 'pending' && (
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle size={16} className="mr-2" />
                                    Approve User
                                </Button>
                            )}
                            {profile.status !== 'banned' && profile.role !== 'admin' && (
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                                    <Ban size={16} className="mr-2" />
                                    Ban User
                                </Button>
                            )}
                            {profile.role !== 'admin' && (
                                <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
                                    <Trash2 size={16} className="mr-2" />
                                    Delete User
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Posts & Reports */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Posts */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-primary" />
                            <h3 className="font-bold text-foreground">User Posts ({postsCount})</h3>
                        </div>

                        {posts && posts.length > 0 ? (
                            <div className="space-y-4">
                                {posts.map((post: any) => (
                                    <div key={post.id} className="p-4 bg-surface rounded-xl border border-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${post.type === 'confession' ? 'bg-purple-100 text-purple-800' :
                                                post.type === 'poll' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {post.type}
                                            </span>
                                            <span className="text-xs text-muted">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-xs text-muted">👍 {post.upvotes || 0}</span>
                                            <span className="text-xs text-muted">👎 {post.downvotes || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted py-8">No posts yet</p>
                        )}
                    </Card>

                    {/* Reports */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={20} className="text-red-600" />
                            <h3 className="font-bold text-foreground">Reports Against User ({reportsCount})</h3>
                        </div>

                        {reports && reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.map((report: any) => (
                                    <div key={report.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {report.status}
                                            </span>
                                            <span className="text-xs text-muted">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-red-900 mb-2">Reason: {report.reason}</p>
                                        {report.posts && (
                                            <p className="text-xs text-red-700 line-clamp-2">Post: {report.posts.content}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted py-8">No reports</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
