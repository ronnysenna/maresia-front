'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Reservation, CheckIn } from '@/types';
import { LogIn, User, Calendar, Clock, CheckCircle, BedDouble, Phone, Users } from 'lucide-react';

export default function CheckInPage() {
  const [pendingCheckIns, setPendingCheckIns] = useState<Reservation[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendingRes, recentRes] = await Promise.all([
        api.get('/checkin/pending-checkins/list'),
        api.get('/checkin'),
      ]);
      setPendingCheckIns(pendingRes.data);
      setRecentCheckIns(recentRes.data.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      await api.post('/checkin', { reservationId });
      loadData();
      alert('Check-in realizado com sucesso!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao realizar check-in');
    }
  };

  // Stats
  const pendentesHoje = pendingCheckIns.length;
  const realizadosHoje = recentCheckIns.filter(c => {
    const checkInDate = new Date(c.dateTime);
    const today = new Date();
    return checkInDate.toDateString() === today.toDateString();
  }).length;
  const totalRealizados = recentCheckIns.length;

  const isCheckInToday = (date: string | Date) => {
    const checkInDate = new Date(date);
    const today = new Date();
    return checkInDate.toDateString() === today.toDateString();
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check-in</h1>
        <p className="text-gray-500 dark:text-gray-400">Realize o check-in dos hóspedes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes para Check-in</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendentesHoje}</p>
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
                <p className="text-sm text-green-600 dark:text-green-400">Realizados Hoje</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{realizadosHoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <LogIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Recentes</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalRealizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Check-ins List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Próximos Check-ins ({pendingCheckIns.length})
        </h2>

        {pendingCheckIns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum check-in pendente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingCheckIns.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {reservation.guest?.name}
                        </span>
                        <Badge variant={isCheckInToday(reservation.checkInDate) ? "warning" : "default"}>
                          {isCheckInToday(reservation.checkInDate) ? "Hoje" : "Em breve"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {reservation.guest?.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          Quarto {reservation.room?.number} - {reservation.room?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {reservation.guestsCount} hóspede(s)
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Check-in</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkInDate)}</p>
                      </div>
                      <div className="text-gray-300 dark:text-gray-600">→</div>
                      <div className="text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Check-out</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkOutDate)}</p>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-center lg:text-right">
                      <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Valor</p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {formatCurrency(reservation.totalValue)}
                      </p>
                    </div>

                    {/* Action */}
                    <Button onClick={() => handleCheckIn(reservation.id)}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Fazer Check-in
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Check-ins List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          Check-ins Recentes
        </h2>

        {recentCheckIns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <LogIn className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum check-in realizado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentCheckIns.map((checkin) => (
              <Card key={checkin.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {checkin.reservation?.guest?.name}
                        </span>
                        <Badge variant="success">Realizado</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          Quarto {checkin.reservation?.room?.number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(checkin.dateTime)}
                        </span>
                      </div>
                    </div>

                    {/* Attendant */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-xs uppercase tracking-wide block">Atendente</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{checkin.user?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
