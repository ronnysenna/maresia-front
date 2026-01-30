'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Wrench, Clock, CheckCircle, Play, X } from 'lucide-react';

interface Maintenance {
    id: string;
    title: string;
    description: string;
    status: 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA';
    priority: string;
    cost: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    createdAt: string;
    room: {
        id: string;
        number: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
    };
}

type FilterStatus = 'TODAS' | 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA';

export default function ManutencaoPage() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('TODAS');
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [finishData, setFinishData] = useState({
        observation: '',
        cost: 0,
    });

    useEffect(() => {
        loadMaintenances();
    }, []);

    const loadMaintenances = async () => {
        try {
            const response = await api.get('/maintenance');
            setMaintenances(response.data);
        } catch (error) {
            console.error('Erro ao carregar manutenções:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = async (id: string) => {
        try {
            await api.patch(`/maintenance/${id}/start`);
            loadMaintenances();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao iniciar manutenção');
        }
    };

    const openFinishModal = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        setFinishData({ observation: '', cost: 0 });
        setIsFinishModalOpen(true);
    };

    const closeFinishModal = () => {
        setIsFinishModalOpen(false);
        setSelectedMaintenance(null);
    };

    const handleFinishSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaintenance) return;

        try {
            await api.patch(`/maintenance/${selectedMaintenance.id}/finish`, {
                cost: finishData.cost,
                observation: finishData.observation,
            });
            closeFinishModal();
            loadMaintenances();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao finalizar manutenção');
        }
    };

    const filteredMaintenances = maintenances.filter((m) => {
        if (filter === 'TODAS') return true;
        return m.status === filter;
    });

    const pendentes = maintenances.filter((m) => m.status === 'PENDENTE').length;
    const emAndamento = maintenances.filter((m) => m.status === 'EM_ANDAMENTO').length;
    const finalizadas = maintenances.filter((m) => m.status === 'FINALIZADA').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDENTE':
                return <Badge variant="warning">Pendente</Badge>;
            case 'EM_ANDAMENTO':
                return <Badge variant="info">Em Andamento</Badge>;
            case 'FINALIZADA':
                return <Badge variant="success">Finalizada</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'BAIXA':
                return <Badge variant="default">Baixa</Badge>;
            case 'MEDIA':
                return <Badge variant="info">Média</Badge>;
            case 'ALTA':
                return <Badge variant="warning">Alta</Badge>;
            case 'URGENTE':
                return <Badge variant="danger">Urgente</Badge>;
            default:
                return <Badge>{priority}</Badge>;
        }
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manutenção</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie as manutenções dos quartos</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</p>
                                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendentes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Em Andamento</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{emAndamento}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400">Finalizadas</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{finalizadas}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['TODAS', 'PENDENTE', 'EM_ANDAMENTO', 'FINALIZADA'] as FilterStatus[]).map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setFilter(status)}
                    >
                        {status === 'TODAS' ? 'Todas' :
                            status === 'PENDENTE' ? 'Pendentes' :
                                status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Finalizadas'}
                    </Button>
                ))}
            </div>

            {/* Maintenance List */}
            <Card>
                <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Manutenções ({filteredMaintenances.length})
                    </h2>

                    {filteredMaintenances.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Nenhuma manutenção encontrada
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredMaintenances.map((maintenance) => (
                                <div
                                    key={maintenance.id}
                                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    Quarto {maintenance.room.number}
                                                </span>
                                                {getStatusBadge(maintenance.status)}
                                                {getPriorityBadge(maintenance.priority)}
                                            </div>

                                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                                {maintenance.title}
                                            </h3>

                                            {maintenance.description && (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                    {maintenance.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span>
                                                    Criada em: {formatDate(maintenance.createdAt)}
                                                </span>
                                                {maintenance.startedAt && (
                                                    <span>
                                                        Iniciada em: {formatDate(maintenance.startedAt)}
                                                    </span>
                                                )}
                                                {maintenance.finishedAt && (
                                                    <span>
                                                        Finalizada em: {formatDate(maintenance.finishedAt)}
                                                    </span>
                                                )}
                                                {maintenance.cost && parseFloat(maintenance.cost) > 0 && (
                                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                                        Custo: {formatCurrency(maintenance.cost)}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                Responsável: {maintenance.user.name}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            {maintenance.status === 'PENDENTE' && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleStart(maintenance.id)}
                                                >
                                                    <Play className="w-4 h-4 mr-1" />
                                                    Iniciar
                                                </Button>
                                            )}
                                            {maintenance.status === 'EM_ANDAMENTO' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => openFinishModal(maintenance)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Finalizar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Finalizar Manutenção */}
            {isFinishModalOpen && selectedMaintenance && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Finalizar Manutenção - Quarto {selectedMaintenance.room.number}
                            </h2>
                            <button type="button" onClick={closeFinishModal}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleFinishSubmit} className="p-4 space-y-4">
                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <strong>Título:</strong> {selectedMaintenance.title}
                                </p>
                                {selectedMaintenance.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {selectedMaintenance.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Observações do Serviço
                                </label>
                                <textarea
                                    value={finishData.observation}
                                    onChange={(e) => setFinishData({ ...finishData, observation: e.target.value })}
                                    placeholder="Descreva o que foi feito..."
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white min-h-[100px]"
                                />
                            </div>

                            <Input
                                label="Valor Cobrado (R$)"
                                type="number"
                                min={0}
                                step={0.01}
                                value={finishData.cost}
                                onChange={(e) => setFinishData({ ...finishData, cost: Number(e.target.value) })}
                                placeholder="0,00"
                            />

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                * O valor será registrado como saída no caixa (categoria: Manutenção)
                            </p>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={closeFinishModal} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Finalizar e Liberar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
