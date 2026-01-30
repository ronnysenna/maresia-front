'use client';

import { useTheme } from 'next-themes';
import { useState, useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hook para verificar se está no cliente
function useIsMounted() {
    return useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );
}

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useIsMounted();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    const themes = [
        { value: 'light', label: 'Claro', icon: Sun },
        { value: 'dark', label: 'Escuro', icon: Moon },
        { value: 'system', label: 'Sistema', icon: Monitor },
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[2];
    const CurrentIcon = currentTheme.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                    'p-2 rounded-lg transition-colors',
                    'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
                    'text-gray-600 dark:text-gray-300'
                )}
                aria-label="Alterar tema"
            >
                <CurrentIcon className="w-5 h-5" />
            </button>

            {menuOpen && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Fechar menu de tema"
                    />
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = theme === t.value;
                            return (
                                <button
                                    key={t.value}
                                    onClick={() => {
                                        setTheme(t.value);
                                        setMenuOpen(false);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
