'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { Cleaning } from '@/types';
import { Brush, Play, CheckCircle, Clock } from 'lucide-react';

export default function LimpezaPage() {
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const endpoint = filter === 'pending' ? '/cleaning/pending' : '/cleaning';
      const response = await api.get(endpoint);
      setCleanings(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.patch(`/cleaning/${id}/start`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao iniciar limpeza');
    }
  };

  const handleFinish = async (id: string) => {
    try {
      await api.patch(`/cleaning/${id}/finish`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao finalizar limpeza');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'warning' | 'info' | 'success' }> = {
      PENDENTE: { label: 'Pendente', variant: 'warning' },
      EM_ANDAMENTO: { label: 'Em Andamento', variant: 'info' },
      FINALIZADA: { label: 'Finalizada', variant: 'success' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'warning' as const };
    return <Badge variant={variant}>{label}</Badge>;
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
        <h1 className="text-2xl font-bold text-gray-900">Limpeza</h1>
        <p className="text-gray-500">Gerencie a limpeza dos quartos</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Cleanings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cleanings.map((cleaning) => (
          <Card key={cleaning.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brush className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quarto {cleaning.room?.number}</h3>
                    <p className="text-sm text-gray-500">{cleaning.room?.name}</p>
                  </div>
                </div>
                {getStatusBadge(cleaning.status)}
              </div>

              {cleaning.notes && (
                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                  {cleaning.notes}
                </p>
              )}

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  Criado: {formatDateTime(cleaning.createdAt)}
                </div>
                {cleaning.startedAt && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Play className="w-4 h-4" />
                    Iniciado: {formatDateTime(cleaning.startedAt)}
                  </div>
                )}
                {cleaning.finishedAt && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Finalizado: {formatDateTime(cleaning.finishedAt)}
                  </div>
                )}
                {cleaning.user && (
                  <p className="text-gray-500">Responsável: {cleaning.user.name}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {cleaning.status === 'PENDENTE' && (
                  <Button onClick={() => handleStart(cleaning.id)} size="sm" className="flex-1">
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                )}
                {cleaning.status === 'EM_ANDAMENTO' && (
                  <Button onClick={() => handleFinish(cleaning.id)} size="sm" className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Finalizar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {cleanings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhuma limpeza {filter === 'pending' ? 'pendente' : ''} encontrada
          </div>
        )}
      </div>
    </div>
  );
}
