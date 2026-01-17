'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Report {
    id: string;
    post_id: string;
    reason: string;
    status: string;
    created_at: string;
    // Joined fields
    post?: {
        content: string;
        type: string;
        user_id: string;
    };
    reporter?: {
        email: string;
    };
}

interface ReportsListProps {
    initialReports: Report[];
}

export function ReportsList({ initialReports }: ReportsListProps) {
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleDismiss = async (reportId: string) => {
        setProcessingId(reportId);
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: 'dismissed' })
                .eq('id', reportId);

            if (error) throw error;
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (err: any) {
            alert('Failed to dismiss: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeletePost = async (reportId: string, postId: string) => {
        if (!confirm('Are you sure? This will delete the post and resolve the report.')) return;

        setProcessingId(reportId);
        try {
            // Delete the post
            const { error: deleteError } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (deleteError) throw deleteError;

            // Update report status (automatic if ON DELETE CASCADE, but updating just in case)
            // Actually if ON DELETE CASCADE is set, report might disappear. 
            // We'll optimistically remove it.

            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (err: any) {
            alert('Failed to delete post: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (reports.length === 0) {
        return (
            <Card className="p-6 bg-surface border border-border mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Reported Content</h2>
                    <span className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-bold">
                        All Clean
                    </span>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="text-green-500" size={32} />
                    </div>
                    <p className="text-muted text-sm">No pending reports.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-white border border-red-100 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                    <Shield className="text-red-500" />
                    Reported Content
                </h2>
                <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold animate-pulse">
                    {reports.length} Pending
                </span>
            </div>

            <div className="space-y-4">
                {reports.map((report) => (
                    <div key={report.id} className="bg-red-50/50 border border-red-100 rounded-xl p-4 transition-all hover:bg-red-50">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded">
                                        REASON: {report.reason}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(report.created_at).toLocaleString()}
                                    </span>
                                </div>

                                <p className="text-gray-800 font-medium bg-white p-3 rounded-lg border border-gray-100 mb-2">
                                    "{report.post?.content || 'Content unavailable'}"
                                </p>

                                <div className="text-xs text-gray-500">
                                    Type: <span className="font-bold capitalize">{report.post?.type}</span> •
                                    Reporter: {report.reporter?.email || 'Unknown'}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => handleDismiss(report.id)}
                                    disabled={processingId === report.id}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    <CheckCircle size={14} />
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => handleDeletePost(report.id, report.post_id)}
                                    disabled={processingId === report.id}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-none"
                                >
                                    {processingId === report.id ? (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Delete Post
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
