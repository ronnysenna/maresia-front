'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Reservation, CheckIn } from '@/types';
import { LogIn, User, Calendar, Clock } from 'lucide-react';

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
        api.get('/checkin/today'),
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao realizar check-in');
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
        <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>
        <p className="text-gray-500">Realize o check-in dos hóspedes</p>
      </div>

      {/* Pending Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Check-ins de Hoje ({pendingCheckIns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCheckIns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum check-in pendente para hoje
            </p>
          ) : (
            <div className="space-y-4">
              {pendingCheckIns.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reservation.guest?.name}</h3>
                      <p className="text-sm text-gray-500">{reservation.guest?.phone}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium">Quarto {reservation.room?.number}</span>
                        <span className="text-gray-500">•</span>
                        <span>{reservation.guestsCount} hóspede(s)</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-600 font-medium">{formatCurrency(reservation.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleCheckIn(reservation.id)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Check-in
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Check-ins Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckIns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum check-in realizado ainda
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hóspede</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quarto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data/Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Atendente</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCheckIns.map((checkin) => (
                    <tr key={checkin.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{checkin.reservation?.guest?.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{checkin.reservation?.room?.number}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDateTime(checkin.dateTime)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {checkin.user?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
