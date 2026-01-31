'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Reservation, Room } from '@/types';
import { Plus, Check, X, Calendar, Clock, CheckCircle, XCircle, CalendarCheck, User, Phone, BedDouble } from 'lucide-react';

type FilterStatus = 'TODAS' | 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('TODAS');
  const [formData, setFormData] = useState({
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 1,
    notes: '',
    guest: {
      name: '',
      email: '',
      phone: '',
      document: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reservationsRes, roomsRes] = await Promise.all([
        api.get('/reservations'),
        api.get('/rooms'),
      ]);
      setReservations(reservationsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      setIsModalOpen(false);
      loadData();
      setFormData({
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        guestsCount: 1,
        notes: '',
        guest: { name: '', email: '', phone: '', document: '' },
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar reserva');
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.patch(`/reservations/${id}/confirm`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao confirmar reserva');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao cancelar reserva');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'TODAS') return true;
    return r.status === filter;
  });

  // Stats
  const pendentes = reservations.filter((r) => r.status === 'PENDENTE').length;
  const confirmadas = reservations.filter((r) => r.status === 'CONFIRMADA').length;
  const canceladas = reservations.filter((r) => r.status === 'CANCELADA').length;
  const finalizadas = reservations.filter((r) => r.status === 'FINALIZADA').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Badge variant="warning">Pendente</Badge>;
      case 'CONFIRMADA':
        return <Badge variant="success">Confirmada</Badge>;
      case 'CANCELADA':
        return <Badge variant="danger">Cancelada</Badge>;
      case 'FINALIZADA':
        return <Badge variant="info">Finalizada</Badge>;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie as reservas da pousada</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Confirmadas</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{confirmadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Finalizadas</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{finalizadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Canceladas</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{canceladas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['TODAS', 'PENDENTE', 'CONFIRMADA', 'FINALIZADA', 'CANCELADA'] as FilterStatus[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'TODAS' ? 'Todas' : status.charAt(0) + status.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma reserva encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
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
                      {getStatusBadge(reservation.status)}
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {reservation.status === 'PENDENTE' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConfirm(reservation.id)}
                          title="Confirmar Reserva"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancel(reservation.id)}
                          title="Cancelar Reserva"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {reservation.status === 'CONFIRMADA' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancel(reservation.id)}
                        title="Cancelar Reserva"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    {(reservation.status === 'FINALIZADA' || reservation.status === 'CANCELADA') && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {reservation.status === 'FINALIZADA' ? 'Concluída' : 'Cancelada'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Nova Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nova Reserva</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="roomSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quarto</label>
                  <select
                    id="roomSelect"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione um quarto</option>
                    {rooms.filter(r => r.status === 'LIVRE').map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.number} - {room.name} ({formatCurrency(room.dailyRate)}/dia)
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Check-in"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                  required
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                  required
                />
                <Input
                  label="Nº Hóspedes"
                  type="number"
                  min={1}
                  value={formData.guestsCount}
                  onChange={(e) => setFormData({ ...formData, guestsCount: Number(e.target.value) })}
                  required
                />
              </div>

              <hr className="my-4 border-gray-200 dark:border-slate-700" />
              <h3 className="font-medium text-gray-900 dark:text-white">Dados do Hóspede</h3>

              <Input
                label="Nome Completo"
                value={formData.guest.name}
                onChange={(e) => setFormData({ ...formData, guest: { ...formData.guest, name: e.target.value } })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CPF/Documento"
                  value={formData.guest.document}
                  onChange={(e) => setFormData({ ...formData, guest: { ...formData.guest, document: e.target.value } })}
                  required
                />
                <Input
                  label="Whatsapp"
                  value={formData.guest.phone}
                  onChange={(e) => setFormData({ ...formData, guest: { ...formData.guest, phone: e.target.value } })}
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={formData.guest.email}
                onChange={(e) => setFormData({ ...formData, guest: { ...formData.guest, email: e.target.value } })}
              />

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Criar Reserva
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
