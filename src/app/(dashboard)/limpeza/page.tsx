'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Brush, Clock, CheckCircle, Play } from 'lucide-react';

interface Cleaning {
  id: string;
  notes: string | null;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA';
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
  } | null;
}

type FilterStatus = 'TODAS' | 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA';

export default function LimpezaPage() {
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('TODAS');

  useEffect(() => {
    loadCleanings();
  }, []);

  const loadCleanings = async () => {
    try {
      const response = await api.get('/cleaning');
      setCleanings(response.data);
    } catch (error) {
      console.error('Erro ao carregar limpezas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.patch(`/cleaning/${id}/start`);
      loadCleanings();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao iniciar limpeza');
    }
  };

  const handleFinish = async (id: string) => {
    try {
      await api.patch(`/cleaning/${id}/finish`);
      loadCleanings();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao finalizar limpeza');
    }
  };

  const filteredCleanings = cleanings.filter((c) => {
    if (filter === 'TODAS') return true;
    return c.status === filter;
  });

  const pendentes = cleanings.filter((c) => c.status === 'PENDENTE').length;
  const emAndamento = cleanings.filter((c) => c.status === 'EM_ANDAMENTO').length;
  const finalizadas = cleanings.filter((c) => c.status === 'FINALIZADA').length;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Limpeza</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie a limpeza dos quartos</p>
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
                <Brush className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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

      {/* Cleaning List */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Limpezas ({filteredCleanings.length})
          </h2>

          {filteredCleanings.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhuma limpeza encontrada
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCleanings.map((cleaning) => (
                <div
                  key={cleaning.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                          <Brush className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Quarto {cleaning.room.number}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          - {cleaning.room.name}
                        </span>
                        {getStatusBadge(cleaning.status)}
                      </div>

                      {cleaning.notes && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-11">
                          {cleaning.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 ml-11">
                        <span>
                          Criada em: {formatDate(cleaning.createdAt)}
                        </span>
                        {cleaning.startedAt && (
                          <span className="text-blue-600 dark:text-blue-400">
                            Iniciada em: {formatDate(cleaning.startedAt)}
                          </span>
                        )}
                        {cleaning.finishedAt && (
                          <span className="text-green-600 dark:text-green-400">
                            Finalizada em: {formatDate(cleaning.finishedAt)}
                          </span>
                        )}
                      </div>

                      {cleaning.user && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-11">
                          Responsável: {cleaning.user.name}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {cleaning.status === 'PENDENTE' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStart(cleaning.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {cleaning.status === 'EM_ANDAMENTO' && (
                        <Button
                          size="sm"
                          onClick={() => handleFinish(cleaning.id)}
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
    </div>
  );
}
