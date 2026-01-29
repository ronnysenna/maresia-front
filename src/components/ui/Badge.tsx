'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

// Helper para status de quarto
export function RoomStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        LIVRE: { label: 'Livre', variant: 'success' },
        RESERVADO: { label: 'Reservado', variant: 'info' },
        OCUPADO: { label: 'Ocupado', variant: 'warning' },
        LIMPEZA: { label: 'Limpeza', variant: 'default' },
        MANUTENCAO: { label: 'Manutenção', variant: 'danger' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Helper para status de reserva
export function ReservationStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        PENDENTE: { label: 'Pendente', variant: 'warning' },
        CONFIRMADA: { label: 'Confirmada', variant: 'success' },
        CANCELADA: { label: 'Cancelada', variant: 'danger' },
        NO_SHOW: { label: 'No-show', variant: 'danger' },
        FINALIZADA: { label: 'Finalizada', variant: 'default' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
