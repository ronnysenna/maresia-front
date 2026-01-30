'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Room, Reservation, CheckIn, CheckOut } from '@/types';
import {
  BedDouble,
  CalendarDays,
  LogIn,
  LogOut,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Wrench,
  Home,
  Percent,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface DashboardStats {
  quartos: {
    total: number;
    livres: number;
    ocupados: number;
    reservados: number;
    limpeza: number;
    manutencao: number;
  };
  taxaOcupacao: number;
  reservas: {
    pendentes: number;
    confirmadas: number;
    checkInsHoje: number;
    checkOutsHoje: number;
  };
  operacional: {
    limpezasPendentes: number;
    manutencoesPendentes: number;
  };
  financeiro: {
    receitaMes: number;
    despesasMes: number;
    saldoMes: number;
  };
  totais: {
    hospedes: number;
  };
  atividadesRecentes: {
    checkIns: CheckIn[];
    checkOuts: CheckOut[];
  };
  proximasReservas: Reservation[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, roomsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/rooms'),
      ]);

      setStats(statsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVRE': return 'bg-green-500';
      case 'OCUPADO': return 'bg-red-500';
      case 'RESERVADO': return 'bg-blue-500';
      case 'LIMPEZA': return 'bg-yellow-500';
      case 'MANUTENCAO': return 'bg-orange-500';
      default: return 'bg-gray-500';
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Visão geral da pousada - {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Cards - Linha 1: Quartos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Quartos</p>
                <p className="text-3xl font-bold">{stats?.quartos.total}</p>
              </div>
              <BedDouble className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Livres</p>
                <p className="text-3xl font-bold">{stats?.quartos.livres}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Ocupados</p>
                <p className="text-3xl font-bold">{stats?.quartos.ocupados}</p>
              </div>
              <Home className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Reservados</p>
                <p className="text-3xl font-bold">{stats?.quartos.reservados}</p>
              </div>
              <Clock className="w-8 h-8 text-cyan-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Limpeza</p>
                <p className="text-3xl font-bold">{stats?.quartos.limpeza}</p>
              </div>
              <BedDouble className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Manutenção</p>
                <p className="text-3xl font-bold">{stats?.quartos.manutencao}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Linha 2: Métricas Importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Taxa de Ocupação */}
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                <Percent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Taxa de Ocupação</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats?.taxaOcupacao}%</p>
              </div>
            </div>
            <div className="mt-3 bg-purple-200 dark:bg-purple-800 rounded-full h-2">
              <div
                className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats?.taxaOcupacao}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Check-ins Hoje */}
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                <LogIn className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Check-ins Hoje</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats?.reservas.checkInsHoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-outs Hoje */}
        <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                <LogOut className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-rose-600 dark:text-rose-400">Check-outs Hoje</p>
                <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">{stats?.reservas.checkOutsHoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Hóspedes */}
        <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Hóspedes Cadastrados</p>
                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats?.totais.hospedes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Financeiro */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Financeiro do Mês
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-300">Receitas</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats?.financeiro.receitaMes || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                  <span className="text-gray-600 dark:text-gray-300">Despesas</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(stats?.financeiro.despesasMes || 0)}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg ${(stats?.financeiro.saldoMes || 0) >= 0
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-orange-50 dark:bg-orange-900/20'
                }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${(stats?.financeiro.saldoMes || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  <span className="text-gray-600 dark:text-gray-300">Saldo</span>
                </div>
                <span className={`font-bold ${(stats?.financeiro.saldoMes || 0) >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
                  }`}>
                  {formatCurrency(stats?.financeiro.saldoMes || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2: Reservas & Operacional */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Reservas & Operacional
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats?.reservas.pendentes}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Reservas Pendentes</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.reservas.confirmadas}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Confirmadas</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats?.operacional.limpezasPendentes}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Limpezas Pend.</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats?.operacional.manutencoesPendentes}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Manutenções Pend.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 3: Mapa de Quartos */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-gray-600" />
              Mapa de Quartos
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`${getStatusColor(room.status)} p-2 rounded-lg text-white text-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity`}
                  title={`Quarto ${room.number} - ${room.status}`}
                >
                  {room.number}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Livre</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Ocupado</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Reservado</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Limpeza</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded"></span> Manutenção</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Reservas */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Próximas Reservas (7 dias)
          </h3>

          {stats?.proximasReservas && stats.proximasReservas.length > 0 ? (
            <div className="space-y-3">
              {stats.proximasReservas.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.guest?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quarto {reservation.room?.number} - {reservation.room?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <p className="text-gray-500 dark:text-gray-400">Check-in</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkInDate)}</p>
                    </div>
                    <Badge variant={reservation.status === 'CONFIRMADA' ? 'success' : 'warning'}>
                      {reservation.status === 'CONFIRMADA' ? 'Confirmada' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma reserva nos próximos 7 dias</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-ins Recentes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-green-600" />
              Check-ins Recentes
            </h3>

            {stats?.atividadesRecentes.checkIns && stats.atividadesRecentes.checkIns.length > 0 ? (
              <div className="space-y-3">
                {stats.atividadesRecentes.checkIns.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{checkin.reservation?.guest?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quarto {checkin.reservation?.room?.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(checkin.dateTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <LogIn className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum check-in recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-outs Recentes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-600" />
              Check-outs Recentes
            </h3>

            {stats?.atividadesRecentes.checkOuts && stats.atividadesRecentes.checkOuts.length > 0 ? (
              <div className="space-y-3">
                {stats.atividadesRecentes.checkOuts.map((checkout) => (
                  <div
                    key={checkout.id}
                    className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{checkout.reservation?.guest?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quarto {checkout.reservation?.room?.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(checkout.dateTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <LogOut className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum check-out recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
