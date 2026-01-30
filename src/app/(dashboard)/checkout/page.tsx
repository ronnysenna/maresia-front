'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Reservation, CheckOut } from '@/types';
import { LogOut, User, Calendar, Clock, X, DollarSign, Users, BedDouble, Phone, CheckCircle } from 'lucide-react';

export default function CheckOutPage() {
  const [todayCheckOuts, setTodayCheckOuts] = useState<Reservation[]>([]);
  const [allPendingCheckOuts, setAllPendingCheckOuts] = useState<Reservation[]>([]);
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
      const [todayRes, pendingRes, recentRes] = await Promise.all([
        api.get('/checkout/today'),
        api.get('/checkout/pending'),
        api.get('/checkout'),
      ]);
      setTodayCheckOuts(todayRes.data);
      setAllPendingCheckOuts(pendingRes.data);
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao realizar check-out');
    }
  };

  // Stats
  const previstoHoje = todayCheckOuts.length;
  const hospedadosTotal = allPendingCheckOuts.length;
  const realizadosHoje = recentCheckOuts.filter(c => {
    const checkOutDate = new Date(c.dateTime);
    const today = new Date();
    return checkOutDate.toDateString() === today.toDateString();
  }).length;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check-out</h1>
        <p className="text-gray-500 dark:text-gray-400">Realize o check-out dos hóspedes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Previstos Hoje</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{previstoHoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Hospedados</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{hospedadosTotal}</p>
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
      </div>

      {/* Today's Check-outs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Check-outs de Hoje ({todayCheckOuts.length})
        </h2>

        {todayCheckOuts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum check-out previsto para hoje</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayCheckOuts.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {reservation.guest?.name}
                        </span>
                        <Badge variant="warning">Hoje</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {reservation.guest?.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          Quarto {reservation.room?.number}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Entrada</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkInDate)}</p>
                      </div>
                      <div className="text-gray-300 dark:text-gray-600">→</div>
                      <div className="text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Saída</p>
                        <p className="font-medium text-purple-600 dark:text-purple-400">{formatDate(reservation.checkOutDate)}</p>
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
                    <Button onClick={() => openCheckOutModal(reservation)} variant="secondary">
                      <LogOut className="w-4 h-4 mr-2" />
                      Fazer Check-out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Guests Currently Hosted */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Hóspedes Hospedados ({allPendingCheckOuts.length})
        </h2>

        {allPendingCheckOuts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum hóspede hospedado no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allPendingCheckOuts.map((reservation) => (
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
                        <Badge variant="info">Hospedado</Badge>
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
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Entrada</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkInDate)}</p>
                      </div>
                      <div className="text-gray-300 dark:text-gray-600">→</div>
                      <div className="text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Saída</p>
                        <p className="font-medium text-orange-600 dark:text-orange-400">{formatDate(reservation.checkOutDate)}</p>
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
                    <Button onClick={() => openCheckOutModal(reservation)} variant="primary">
                      <LogOut className="w-4 h-4 mr-2" />
                      Check-out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Check-outs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          Check-outs Recentes
        </h2>

        {recentCheckOuts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <LogOut className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum check-out realizado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentCheckOuts.map((checkout) => (
              <Card key={checkout.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {checkout.reservation?.guest?.name}
                        </span>
                        <Badge variant="success">Finalizado</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          Quarto {checkout.reservation?.room?.number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(checkout.dateTime)}
                        </span>
                        {Number(checkout.extraCharges) > 0 && (
                          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            Extras: {formatCurrency(checkout.extraCharges)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attendant */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-xs uppercase tracking-wide block">Atendente</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{checkout.user?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Check-out */}
      {isModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Realizar Check-out</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Reservation Info */}
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">{selectedReservation.guest?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quarto {selectedReservation.room?.number}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Valor da hospedagem:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(selectedReservation.totalValue)}</span>
                </div>
              </div>

              {/* Extra Charges */}
              <div>
                <label htmlFor="extraCharges" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <DollarSign className="w-4 h-4" />
                  Consumos Extras (R$)
                </label>
                <Input
                  id="extraCharges"
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
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Observações sobre o check-out..."
                />
              </div>

              {/* Total */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total a pagar:</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
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
