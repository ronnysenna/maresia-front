'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ReservationStatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Reservation, Room } from '@/types';
import { Plus, Check, X, Eye } from 'lucide-react';

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
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
    if (!filter) return true;
    return r.status === filter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500">Gerencie as reservas da pousada</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status || 'Todas'}
          </button>
        ))}
      </div>

      {/* Reservations Table */}
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hóspede</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quarto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check-in</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check-out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.guest?.name}</p>
                      <p className="text-sm text-gray-500">{reservation.guest?.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{reservation.room?.number}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">{formatDate(reservation.checkInDate)}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(reservation.checkOutDate)}</td>
                  <td className="py-3 px-4 font-medium text-green-600">
                    {formatCurrency(reservation.totalValue)}
                  </td>
                  <td className="py-3 px-4">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {reservation.status === 'PENDENTE' && (
                        <>
                          <button
                            onClick={() => handleConfirm(reservation.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Confirmar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {reservation.status === 'CONFIRMADA' && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Nenhuma reserva encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal Nova Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nova Reserva</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quarto</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
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

              <hr className="my-4" />
              <h3 className="font-medium text-gray-900">Dados do Hóspede</h3>

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
                  label="Telefone"
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
