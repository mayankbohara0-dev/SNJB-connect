'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Search, FileText, Download, ExternalLink, BookOpen, Plus, X, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { useEffect } from 'react';

export default function ResourcesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadLink, setUploadLink] = useState('');
    const [uploadCategory, setUploadCategory] = useState('Notes');

    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    // Live Data (Starts Empty)
    const [resources, setResources] = useState<any[]>([]);

    const categories = ['All', 'Notes', 'Papers', 'Syllabus', 'Lab'];

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'All' || res.category === category;
        return matchesSearch && matchesCategory;
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please login to upload resources.');
                router.push('/login');
                return;
            }

            // Check if user is approved
            const { data: profile } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', user.id)
                .single();

            if (profile?.status !== 'approved') {
                alert('Your account is pending approval. Please wait for admin approval.');
                router.push('/approval-pending');
                setUploading(false);
                return;
            }

            // Insert into notes table
            const { data, error } = await supabase.from('notes').insert({
                user_id: user.id,
                title: uploadTitle,
                subject: uploadCategory,
                semester: 'General', // You can add a semester selector if needed
                file_url: uploadLink
            }).select();

            if (error) {
                console.error('Error uploading resource:', error);
                alert('Error uploading resource: ' + error.message);
            } else {
                // Add to local state for immediate display
                const newRes = {
                    id: data[0].id,
                    title: uploadTitle,
                    type: 'Link',
                    size: '-',
                    category: uploadCategory,
                    date: 'Just now'
                };
                setResources([newRes, ...resources]);
                setIsUploadOpen(false);
                setUploadTitle('');
                setUploadLink('');
                alert('Resource uploaded successfully!');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            <TopNavbar userId={userId} />

            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-foreground">Resources</h1>
                        <p className="text-muted">Find notes, papers, and more.</p>
                    </div>
                    <Button onClick={() => setIsUploadOpen(true)} className="rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                        <Plus size={20} className="mr-2" /> Upload
                    </Button>
                </header>

                {/* Search & Filter */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <Input
                            placeholder="Search notes, papers..."
                            className="pl-12 bg-surface shadow-sm border border-border h-12 text-lg rounded-2xl text-foreground"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${category === cat
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-surface text-muted hover:bg-surface-hover'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>


                <main className="space-y-4">
                    {filteredResources.map(res => (
                        <Card key={res.id} className="bg-surface border-border hover:shadow-md transition-shadow p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${res.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                    }`}>
                                    {res.type === 'PDF' ? <FileText size={24} /> : <ExternalLink size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{res.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{res.category}</span>
                                        <span>• {res.size}</span>
                                        <span>• {res.date}</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-slate-400 hover:text-slate-900 p-2">
                                <Download size={20} />
                            </Button>
                        </Card>
                    ))}

                    {filteredResources.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No resources found.</p>
                        </div>
                    )}
                </main>



            </div>

            {/* Upload Modal */}
            {
                isUploadOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <Card className="w-full max-w-md bg-surface p-6 rounded-3xl shadow-2xl relative border border-border">
                            <button
                                onClick={() => setIsUploadOpen(false)}
                                className="absolute top-4 right-4 text-muted hover:text-foreground bg-background rounded-full p-1"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UploadCloud size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Upload Resource</h2>
                                <p className="text-sm text-gray-500">Share notes or helpful links with peers</p>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                    <Input
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                        placeholder="e.g. Data Structures Unit 1 Notes"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {['Notes', 'Papers', 'Lab'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setUploadCategory(c)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${uploadCategory === c ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-border'
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Link (Drive/PDF)</label>
                                    <Input
                                        value={uploadLink}
                                        onChange={(e) => setUploadLink(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4"
                                    isLoading={uploading}
                                >
                                    Submit Resource
                                </Button>
                            </form>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}
