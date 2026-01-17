'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Calendar, CheckCircle } from 'lucide-react';

export default function SetupProfilePage() {
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!branch || !year) {
            setError('Please select both branch and year');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    branch,
                    year,
                    profile_completed: true
                })
                .eq('id', user.id);

            if (updateError) {
                setError(updateError.message);
            } else {
                // Force full page reload to refresh layout
                window.location.href = '/feed';
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-2xl animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-surface rounded-3xl shadow-soft mb-6 border border-border">
                        <GraduationCap size={48} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
                    <p className="text-muted text-lg">Tell us about your academic journey</p>
                </div>

                {/* Setup Card */}
                <Card className="border-t-4 border-primary p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Branch Selection */}
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

                        {/* Year Selection */}
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

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={!branch || !year || loading}
                            isLoading={loading}
                            fullWidth
                            size="lg"
                            className="text-base"
                        >
                            {!loading && (
                                <span className="flex items-center gap-2 justify-center">
                                    <CheckCircle size={20} />
                                    Complete Setup
                                </span>
                            )}
                        </Button>

                        {/* Selected Summary */}
                        {(branch || year) && (
                            <div className="text-center text-sm text-muted">
                                {branch && <span className="font-medium">{branch}</span>}
                                {branch && year && <span> • </span>}
                                {year && <span className="font-medium">{year}</span>}
                            </div>
                        )}
                    </form>
                </Card>

                {/* Info */}
                <p className="text-center text-xs text-muted mt-6 px-8">
                    This information is only visible to you and admins. It helps us provide better campus-specific content.
                </p>
            </div>
        </div>
    );
}
