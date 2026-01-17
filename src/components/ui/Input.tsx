import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">{label}</label>}
            <div className="relative">
                <input
                    className={`w-full bg-surface border border-border text-foreground rounded-pill px-5 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted/50 ${icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:ring-red-200' : ''} ${className}`}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-500 ml-2">{error}</p>}
        </div>
    );
}
