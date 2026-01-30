'use client';

import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn(
            'rounded-xl shadow-sm border p-6',
            'bg-white dark:bg-slate-800',
            'border-gray-200 dark:border-slate-700',
            className
        )}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }: CardProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className }: CardProps) {
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
}
