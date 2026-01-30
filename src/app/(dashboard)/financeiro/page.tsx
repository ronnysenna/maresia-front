'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';

export default function FinanceiroPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState({ totalEntradas: 0, totalSaidas: 0, saldo: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [formData, setFormData] = useState({
        type: 'ENTRADA' as 'ENTRADA' | 'SAIDA',
        category: 'DIARIA',
        description: '',
        amount: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            const [transactionsRes, summaryRes] = await Promise.all([
                api.get('/transactions'),
                api.get(`/transactions/summary?startDate=${startDate}&endDate=${endDate}`),
            ]);

            setTransactions(transactionsRes.data);
            setSummary({
                totalEntradas: Number(summaryRes.data.totalEntradas) || 0,
                totalSaidas: Number(summaryRes.data.totalSaidas) || 0,
                saldo: Number(summaryRes.data.saldo) || 0,
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/transactions', formData);
            setIsModalOpen(false);
            loadData();
            setFormData({ type: 'ENTRADA', category: 'DIARIA', description: '', amount: 0 });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao criar transação');
        }
    };

    const filteredTransactions = transactions.filter((t) => {
        if (!filter) return true;
        return t.type === filter;
    });

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            DIARIA: 'Diária',
            EXTRA: 'Extra',
            MANUTENCAO: 'Manutenção',
            LIMPEZA: 'Limpeza',
            COMPRA: 'Compra',
            OUTRO: 'Outro',
        };
        return labels[category] || category;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
                    <p className="text-gray-500 dark:text-gray-400">Controle de entradas e saídas</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transação
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Entradas (Mês)</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalEntradas)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Saídas (Mês)</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalSaidas)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo (Mês)</p>
                            <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(summary.saldo)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['', 'ENTRADA', 'SAIDA'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {type === '' ? 'Todas' : type === 'ENTRADA' ? 'Entradas' : 'Saídas'}
                    </button>
                ))}
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transações</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Data</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(transaction.date)}</td>
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{getCategoryLabel(transaction.category)}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={transaction.type === 'ENTRADA' ? 'success' : 'danger'}>
                                            {transaction.type === 'ENTRADA' ? 'Entrada' : 'Saída'}
                                        </Badge>
                                    </td>
                                    <td className={`py-3 px-4 text-right font-medium ${transaction.type === 'ENTRADA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {transaction.type === 'ENTRADA' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        Nenhuma transação encontrada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Nova Transação */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nova Transação</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ENTRADA' | 'SAIDA' })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="ENTRADA">Entrada</option>
                                    <option value="SAIDA">Saída</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="DIARIA">Diária</option>
                                    <option value="EXTRA">Extra</option>
                                    <option value="MANUTENCAO">Manutenção</option>
                                    <option value="LIMPEZA">Limpeza</option>
                                    <option value="COMPRA">Compra</option>
                                    <option value="OUTRO">Outro</option>
                                </select>
                            </div>

                            <Input
                                label="Descrição"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ex: Pagamento diária quarto 101"
                                required
                            />

                            <Input
                                label="Valor (R$)"
                                type="number"
                                min={0}
                                step={0.01}
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                required
                            />

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Criar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
