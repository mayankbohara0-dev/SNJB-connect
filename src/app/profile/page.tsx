'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Calendar, User, Mail, ArrowLeft, Star, Shield, Edit2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { updateAlias } from '@/app/actions/profile';
import { getAvatarUrl } from '@/lib/utils';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { LogOut } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [alias, setAlias] = useState('');
    const [newAlias, setNewAlias] = useState('');
    const [isEditingAlias, setIsEditingAlias] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingAlias, setSavingAlias] = useState(false);
    const [message, setMessage] = useState('');
    const [aliasMessage, setAliasMessage] = useState('');
    const [bio, setBio] = useState('');
    const [savingBio, setSavingBio] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
    const [activityPosts, setActivityPosts] = useState<any[]>([]);
    const [activityComments, setActivityComments] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);

    const router = useRouter();

    const branches = [
        { value: 'Engineering', label: '🎓 Engineering', icon: '⚙️' },
        { value: 'MBA', label: '💼 MBA', icon: '📊' },
        { value: 'Pharmacy', label: '💊 Pharmacy', icon: '🏥' },
        { value: 'Polytechnic', label: '🔧 Polytechnic', icon: '🛠️' }
    ];

    const years = [
        { value: '1st Year', label: '1st Year' },
        { value: '2nd Year', label: '2nd Year' },
        { value: '3rd Year', label: '3rd Year' },
        { value: '4th Year', label: '4th Year' }
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setBranch(profileData.branch || '');
                setYear(profileData.year || '');
                setAlias(profileData.alias || '');
                setAlias(profileData.alias || '');
                setNewAlias(profileData.alias || '');
                setBio(profileData.bio || '');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAlias = async () => {
        setSavingAlias(true);
        setAliasMessage('');

        const result = await updateAlias(newAlias);

        if (result.success) {
            setAlias(newAlias);
            setIsEditingAlias(false);
            setAliasMessage('Alias updated successfully! 🎉');
            // Refresh profile to update cooldown
            fetchProfile();
        } else {
            setAliasMessage(`Error: ${result.error}`);
        }
        setSavingAlias(false);
    };

    const handleSaveBio = async () => {
        setSavingBio(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ bio: bio.trim() })
                .eq('id', profile.id);

            if (error) throw error;
            // Update local profile state
            setProfile({ ...profile, bio: bio.trim() });
            alert('Bio updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update bio');
        } finally {
            setSavingBio(false);
        }
    };

    useEffect(() => {
        if (profile?.id) {
            fetchActivity();
        }
    }, [profile?.id, activeTab]);

    const fetchActivity = async () => {
        if (!profile?.id) return;
        setActivityLoading(true);
        try {
            if (activeTab === 'posts') {
                const { data } = await supabase.from('public_posts').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
                setActivityPosts(data || []);
            } else {
                const { data } = await supabase.from('comments').select('*, posts(content)').eq('user_id', profile.id).order('created_at', { ascending: false });
                setActivityComments(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActivityLoading(false);
        }
    };

    const handleSaveBackend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!branch || !year) {
            setMessage('Please select both branch and year');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    branch,
                    year,
                    profile_completed: true
                })
                .eq('id', user.id);

            if (error) {
                setMessage('Error: ' + error.message);
            } else {
                setMessage('Profile updated successfully!');
                setTimeout(() => {
                    router.push('/feed');
                }, 1500);
            }
        } catch (err) {
            setMessage('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const getDaysRemaining = () => {
        if (!profile?.last_alias_change) return 0;
        const lastChange = new Date(profile.last_alias_change);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastChange.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, 18 - diffDays);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-muted">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <TopNavbar userId={profile?.id} />

            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Private Info */}
                    <div className="space-y-6">
                        <Card className="p-6 border-l-4 border-l-red-500">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-white border border-border shadow-sm flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                                    <img
                                        src={profile?.id ? getAvatarUrl(profile.id) : ''}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{profile?.real_name || 'No Name'}</h2>
                                <p className="text-sm text-muted mb-2">My Real Identity</p>
                                <div className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                    <Shield size={10} />
                                    Only visible to you & admins
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail size={16} className="text-muted" />
                                    <span className="text-foreground truncate">{profile?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <User size={16} className="text-muted" />
                                    <span className="text-foreground capitalize">{profile?.role || 'student'}</span>
                                </div>
                            </div>

                            <Button onClick={handleLogout} variant="ghost" className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <LogOut size={16} className="mr-2" />
                                Sign Out
                            </Button>
                        </Card>
                    </div>

                    {/* Right Column - Public Identity & Settings */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Public Identity (Alias) */}
                        <Card className="p-8 border-l-4 border-l-green-500">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-foreground">Public Identity</h3>
                                        <div className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            <Shield size={10} />
                                            Visible to everyone
                                        </div>
                                    </div>
                                    <p className="text-muted text-sm">This is how you appear to other students.</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {/* Karma Badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 shadow-sm">
                                        <Star size={16} className="fill-yellow-500 text-yellow-500" />
                                        <span className="font-bold text-sm">{profile?.karma || 0} Karma</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-hover/50 p-6 rounded-xl border border-border">
                                {!isEditingAlias ? (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-muted uppercase tracking-wider font-bold mb-1">Your Alias</p>
                                            <p className="text-3xl font-black text-primary">{alias || 'Loading...'}</p>
                                        </div>
                                        <Button onClick={() => setIsEditingAlias(true)} variant="outline">
                                            <Edit2 size={16} className="mr-2" />
                                            Change Alias
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-foreground block mb-2">New Alias</label>
                                            <input
                                                type="text"
                                                value={newAlias}
                                                onChange={(e) => setNewAlias(e.target.value)}
                                                className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Enter new alias..."
                                                maxLength={20}
                                            />
                                            <p className="text-xs text-muted mt-2">
                                                Must be 3-20 chars. Cannot contain real name.
                                                <br />
                                                {getDaysRemaining() > 0 ? (
                                                    <span className="text-red-500 font-bold">Cooldown active: {getDaysRemaining()} days remaining.</span>
                                                ) : (
                                                    <span className="text-green-600">You can change this now. 18-day cooldown applies after save.</span>
                                                )}
                                            </p>
                                        </div>

                                        {aliasMessage && (
                                            <div className={`text-sm ${aliasMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                                {aliasMessage}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleUpdateAlias}
                                                disabled={savingAlias || !newAlias || newAlias.length < 3 || getDaysRemaining() > 0}
                                                isLoading={savingAlias}
                                            >
                                                Save Alias
                                            </Button>
                                            <Button
                                                onClick={() => { setIsEditingAlias(false); setNewAlias(alias); setAliasMessage(''); }}
                                                variant="ghost"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-surface-hover/50 p-6 rounded-xl border border-border mt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-foreground flex items-center gap-2">
                                        About Me
                                        <span className="textxs font-normal text-muted">(Optional)</span>
                                    </h4>
                                </div>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us a bit about yourself..."
                                    className="w-full bg-background border border-border rounded-xl p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary mb-2 resize-none"
                                    maxLength={150}
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted">{bio.length}/150</span>
                                    <Button
                                        onClick={handleSaveBio}
                                        disabled={savingBio || bio === (profile?.bio || '')}
                                        isLoading={savingBio}
                                        size="sm"
                                    >
                                        Save Bio
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Academic Info */}
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Academic Information</h3>

                            <form onSubmit={handleSaveBackend} className="space-y-8">
                                {/* Branch */}
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} className="text-primary" />
                                        Select Your Branch
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {branches.map((b) => (
                                            <button
                                                key={b.value}
                                                type="button"
                                                onClick={() => setBranch(b.value)}
                                                className={`p-6 rounded-2xl border-2 transition-all text-left ${branch === b.value
                                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                                    : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                                                    }`}
                                            >
                                                <div className="text-3xl mb-2">{b.icon}</div>
                                                <div className="font-bold text-foreground">{b.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Calendar size={20} className="text-primary" />
                                        Select Your Year
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {years.map((y) => (
                                            <button
                                                key={y.value}
                                                type="button"
                                                onClick={() => setYear(y.value)}
                                                className={`p-4 rounded-xl border-2 transition-all font-bold ${year === y.value
                                                    ? 'border-primary bg-primary text-white shadow-lg'
                                                    : 'border-border text-foreground hover:border-primary/50 hover:bg-surface-hover'
                                                    }`}
                                            >
                                                {y.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                {message && (
                                    <div className={`p-4 rounded-xl text-sm font-medium border ${message.includes('Error')
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                        {message}
                                    </div>
                                )}

                                {/* Save Button */}
                                <Button
                                    type="submit"
                                    disabled={!branch || !year || saving}
                                    isLoading={saving}
                                    fullWidth
                                    size="lg"
                                    className="text-base"
                                >
                                    Save Changes
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>

                {/* Activity Tabs */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Your Activity</h2>
                    <div className="flex gap-6 border-b border-border mb-6">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'posts'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted hover:text-foreground'
                                }`}
                        >
                            My Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'comments'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted hover:text-foreground'
                                }`}
                        >
                            My Comments
                        </button>
                    </div>

                    <div className="min-h-[200px] space-y-4">
                        {activeTab === 'posts' ? (
                            // Posts List
                            activityLoading ? <div className="text-center text-muted">Loading posts...</div> :
                                activityPosts.length === 0 ? <div className="text-center text-muted italic">No posts yet.</div> :
                                    activityPosts.map((post: any) => (
                                        <div key={post.id} className="bg-surface rounded-xl border border-border p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-primary uppercase border border-primary/20 bg-primary/5 px-2 py-1 rounded-full">{post.type}</span>
                                                <span className="text-xs text-muted">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                                        </div>
                                    ))
                        ) : (
                            // Comments List
                            activityLoading ? <div className="text-center text-muted">Loading comments...</div> :
                                activityComments.length === 0 ? <div className="text-center text-muted italic">No comments yet.</div> :
                                    activityComments.map((comment: any) => (
                                        <div key={comment.id} className="bg-surface rounded-xl border border-border p-4">
                                            <p className="text-sm text-foreground mb-2">"{comment.content}"</p>
                                            <div className="text-xs text-muted flex gap-2">
                                                <span>On post:</span>
                                                <span className="truncate max-w-[200px] italic">{comment.posts?.content || 'Deleted Post'}</span>
                                                <span>• {new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
