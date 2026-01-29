'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo / Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Pousada Maresia</h1>
                        <p className="text-gray-500 mt-1">Sistema de Gestão</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Entrar
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-8">
                        © 2026 Pousada Maresia. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
