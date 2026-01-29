'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoomStatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { Room } from '@/types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function QuartosPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    type: 'STANDARD',
    description: '',
    capacity: 2,
    dailyRate: 0,
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        number: room.number,
        name: room.name,
        type: room.type,
        description: room.description || '',
        capacity: room.capacity,
        dailyRate: Number(room.dailyRate),
      });
    } else {
      setEditingRoom(null);
      setFormData({
        number: '',
        name: '',
        type: 'STANDARD',
        description: '',
        capacity: 2,
        dailyRate: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      closeModal();
      loadRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar quarto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      loadRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao excluir quarto');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/rooms/${id}/status`, { status });
      loadRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar status');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quartos</h1>
          <p className="text-gray-500">Gerencie os quartos da pousada</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Quarto
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Quarto {room.number}</h3>
                  <p className="text-gray-500">{room.name}</p>
                </div>
                <RoomStatusBadge status={room.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Capacidade:</span>
                  <span className="font-medium">{room.capacity} pessoas</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Diária:</span>
                  <span className="font-medium text-green-600">{formatCurrency(room.dailyRate)}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-1 mb-4">
                {['LIVRE', 'MANUTENCAO'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(room.id, status)}
                    disabled={room.status === status}
                    className={`px-2 py-1 text-xs rounded ${
                      room.status === status
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'LIVRE' ? 'Liberar' : 'Manutenção'}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openModal(room)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(room.id)}>
                  <Trash2 className="w-4 h-4 mr-1 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingRoom ? 'Editar Quarto' : 'Novo Quarto'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input
                label="Número"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
              />
              <Input
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Suíte Standard"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="LUXO">Luxo</option>
                  <option value="MASTER">Master</option>
                </select>
              </div>
              <Input
                label="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                label="Capacidade"
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
              />
              <Input
                label="Valor da Diária (R$)"
                type="number"
                min={0}
                step={0.01}
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                required
              />

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingRoom ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
