'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, User, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setSuccess(false);

        // Validation
        if (password !== confirmPassword) {
            setMessage('Passwords do not match!');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setMessage(error.message);
            } else {
                setSuccess(true);
                setMessage('Registration successful! Please check your email to verify your account.');

                // Clear form
                setEmail('');
                setFullName('');
                setPassword('');
                setConfirmPassword('');

                // Redirect to approval pending page after 3 seconds
                setTimeout(() => {
                    router.push('/approval-pending');
                }, 3000);
            }
        } catch (err) {
            setMessage('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-md animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-surface rounded-3xl shadow-soft mb-6 border border-border">
                        <span className="text-4xl">🎓</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Join SNJB Connect</h1>
                    <p className="text-muted text-lg">Create your account to get started.</p>
                </div>

                {/* Registration Card */}
                <Card className="border-t-4 border-primary">
                    <h2 className="text-xl font-bold text-foreground mb-6">Student Registration</h2>

                    {success ? (
                        <div className="text-center py-8 animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Registration Successful!</h3>
                            <p className="text-muted text-sm mb-4">
                                Please check your email to verify your account.
                            </p>
                            <p className="text-muted text-sm">
                                Your account is pending approval from an admin.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <Input
                                label="Full Name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                required
                                icon={<User size={20} />}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@gmail.com"
                                required
                                icon={<Mail size={20} />}
                            />
                            <p className="text-xs text-muted -mt-4 mb-2">
                                You can use any email address (Gmail, Yahoo, etc.)
                            </p>

                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                icon={<span className="text-xl">🔑</span>}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                icon={<span className="text-xl">🔒</span>}
                            />

                            {message && (
                                <div className={`p-4 rounded-2xl text-sm font-medium text-center ${message.includes('successful') || message.includes('check your email')
                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                    : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}>
                                    {message}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                size="lg"
                                isLoading={loading}
                                className="text-base"
                            >
                                {!loading && (
                                    <span className="flex items-center gap-2">
                                        Create Account <ArrowRight size={18} />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </Card>

                {/* Login Link */}
                <p className="text-center text-sm text-muted mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Sign in here
                    </Link>
                </p>

                <p className="text-center text-sm text-muted mt-8">
                    By joining, you agree to our <a href="#" className="text-primary hover:underline font-medium">Community Guidelines</a>.
                    <br />
                    Identities are kept strictly anonymous.
                </p>
            </div>
        </div>
    );
}
