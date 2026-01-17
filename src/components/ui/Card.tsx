import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function Card({ children, className = '', hoverEffect = false, ...props }: CardProps) {
    return (
        <div
            className={`bg-surface rounded-card shadow-soft p-6 ${hoverEffect ? 'transition-transform duration-200 hover:-translate-y-1' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
