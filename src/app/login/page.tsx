'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMode, setLoginMode] = useState<'magic' | 'password'>('magic');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (loginMode === 'magic') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) {
                    setMessage(error.message);
                } else {
                    setMessage('Check your email for the magic link!');
                }
            } else {
                // Password Login
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    // Provide helpful error messages
                    if (error.message.includes('Invalid login credentials')) {
                        setMessage('Wrong email or password. If you haven\'t set a password yet, use the Magic Link tab to sign in, then set your password in Profile Settings.');
                    } else {
                        setMessage(error.message);
                    }
                } else {
                    // Success! Force full page reload to refresh server-side layout with correct role
                    setMessage('Success! Redirecting...');
                    window.location.href = '/feed';
                }
            }
        } catch (err) {
            setMessage('An unexpected error occurred.');
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h1>
                    <p className="text-muted text-lg">Enter your details to access your account.</p>
                </div>

                {/* Login Card */}
                <Card className="border-t-4 border-primary">
                    <h2 className="text-xl font-bold text-foreground mb-6">Student Login</h2>

                    {/* Login Mode Toggle */}
                    <div className="flex gap-4 mb-6 border-b border-border pb-2">
                        <button
                            onClick={() => { setMessage(''); setLoginMode('magic'); }}
                            className={`text-sm font-bold pb-2 transition-colors ${loginMode === 'magic' ? 'text-primary border-b-2 border-primary -mb-2.5' : 'text-muted hover:text-foreground'}`}
                        >
                            Magic Link
                        </button>
                        <button
                            onClick={() => { setMessage(''); setLoginMode('password'); }}
                            className={`text-sm font-bold pb-2 transition-colors ${loginMode === 'password' ? 'text-primary border-b-2 border-primary -mb-2.5' : 'text-muted hover:text-foreground'}`}
                        >
                            Password
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@gmail.com"
                            required
                            icon={<Mail size={20} />}
                        />

                        {loginMode === 'password' && (
                            <div className="animate-fade-in-up">
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    icon={<span className="text-xl">🔑</span>}
                                />
                                <div className="text-right mt-2">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setLoginMode('magic'); setMessage('Use Magic Link to sign in, then set a new password in Profile.'); }} className="text-xs text-primary hover:underline">
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 rounded-2xl text-sm font-medium text-center ${message.includes('Check') || message.includes('Success') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
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
                                    {loginMode === 'magic' ? 'Send Magic Link' : 'Sign In Directly'} <ArrowRight size={18} />
                                </span>
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Registration Link */}
                <p className="text-center text-sm text-muted mt-6">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Register here
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
