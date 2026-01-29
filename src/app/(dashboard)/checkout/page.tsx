'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Reservation, CheckOut } from '@/types';
import { LogOut, User, Calendar, Clock, X, DollarSign } from 'lucide-react';

export default function CheckOutPage() {
  const [pendingCheckOuts, setPendingCheckOuts] = useState<Reservation[]>([]);
  const [recentCheckOuts, setRecentCheckOuts] = useState<CheckOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [extraCharges, setExtraCharges] = useState(0);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendingRes, recentRes] = await Promise.all([
        api.get('/checkout/today'),
        api.get('/checkout'),
      ]);
      setPendingCheckOuts(pendingRes.data);
      setRecentCheckOuts(recentRes.data.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCheckOutModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setExtraCharges(0);
    setObservations('');
    setIsModalOpen(true);
  };

  const handleCheckOut = async () => {
    if (!selectedReservation) return;
    try {
      await api.post('/checkout', {
        reservationId: selectedReservation.id,
        extraCharges,
        observations,
      });
      setIsModalOpen(false);
      loadData();
      alert('Check-out realizado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao realizar check-out');
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
        <h1 className="text-2xl font-bold text-gray-900">Check-out</h1>
        <p className="text-gray-500">Realize o check-out dos hóspedes</p>
      </div>

      {/* Pending Check-outs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Check-outs de Hoje ({pendingCheckOuts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCheckOuts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum check-out pendente para hoje
            </p>
          ) : (
            <div className="space-y-4">
              {pendingCheckOuts.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reservation.guest?.name}</h3>
                      <p className="text-sm text-gray-500">{reservation.guest?.phone}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium">Quarto {reservation.room?.number}</span>
                        <span className="text-gray-500">•</span>
                        <span>Entrada: {formatDate(reservation.checkInDate)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-600 font-medium">{formatCurrency(reservation.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => openCheckOutModal(reservation)} variant="secondary">
                    <LogOut className="w-4 h-4 mr-2" />
                    Fazer Check-out
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-outs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Check-outs Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckOuts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum check-out realizado ainda
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hóspede</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quarto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data/Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Extras</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Atendente</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCheckOuts.map((checkout) => (
                    <tr key={checkout.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{checkout.reservation?.guest?.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{checkout.reservation?.room?.number}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDateTime(checkout.dateTime)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {Number(checkout.extraCharges) > 0 ? (
                          <span className="text-orange-600 font-medium">
                            {formatCurrency(checkout.extraCharges)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {checkout.user?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Check-out */}
      {isModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Realizar Check-out</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Reservation Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedReservation.guest?.name}</p>
                <p className="text-sm text-gray-500">Quarto {selectedReservation.room?.number}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Valor da hospedagem:</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedReservation.totalValue)}</span>
                </div>
              </div>

              {/* Extra Charges */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4" />
                  Consumos Extras (R$)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  rows={3}
                  placeholder="Observações sobre o check-out..."
                />
              </div>

              {/* Total */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total a pagar:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(Number(selectedReservation.totalValue) + extraCharges)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCheckOut} className="flex-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  Confirmar Check-out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
