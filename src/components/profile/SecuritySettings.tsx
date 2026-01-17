'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, Check, AlertCircle } from 'lucide-react';

export default function SecuritySettings({ user }: { user: any }) {
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Confirmation link sent to new email.' });
            setNewEmail('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Lock size={16} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Security Settings</h3>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-fade-in-up ${message.type === 'success' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Change Email Card */}
            <div className="bg-surface-hover rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                    <Mail size={16} className="text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Change Email</h4>
                </div>
                <form onSubmit={handleUpdateEmail} className="space-y-3">
                    <Input
                        placeholder="New Email Address"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        className="h-11 text-sm bg-background border-border"
                    />
                    <p className="text-[10px] text-muted leading-relaxed">
                        📧 You'll receive a verification link at your new email address
                    </p>
                    <Button
                        type="submit"
                        disabled={loading || !newEmail}
                        isLoading={loading && !!newEmail}
                        fullWidth
                        size="sm"
                        className="h-11 bg-primary hover:bg-primary-hover"
                    >
                        Update Email
                    </Button>
                </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-surface-hover rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                    <Lock size={16} className="text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Change Password</h4>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <Input
                        placeholder="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="h-11 text-sm bg-background border-border"
                    />
                    <Input
                        placeholder="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-11 text-sm bg-background border-border"
                    />
                    <p className="text-[10px] text-muted leading-relaxed">
                        🔒 Use a strong password with at least 8 characters
                    </p>
                    <Button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        isLoading={loading && !!newPassword}
                        fullWidth
                        size="sm"
                        className="h-11 bg-primary hover:bg-primary-hover"
                    >
                        Update Password
                    </Button>
                </form>
            </div>
        </div>
    );
}
