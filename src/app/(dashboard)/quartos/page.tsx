'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { Room } from '@/types';
import { Plus, Pencil, Trash2, X, Wrench, CheckCircle, BedDouble, Users, DollarSign, Home, Clock, AlertTriangle } from 'lucide-react';

type FilterStatus = 'TODOS' | 'LIVRE' | 'OCUPADO' | 'RESERVADO' | 'LIMPEZA' | 'MANUTENCAO';

export default function QuartosPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isFinishMaintenanceModalOpen, setIsFinishMaintenanceModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [maintenanceRoom, setMaintenanceRoom] = useState<Room | null>(null);
  const [finishMaintenanceRoom, setFinishMaintenanceRoom] = useState<Room | null>(null);
  const [maintenanceData, setMaintenanceData] = useState({
    title: '',
    description: '',
    priority: 'MEDIA',
  });
  const [finishMaintenanceData, setFinishMaintenanceData] = useState({
    observation: '',
    cost: 0,
  });
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao salvar quarto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      loadRooms();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao excluir quarto');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/rooms/${id}/status`, { status });
      loadRooms();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  const openMaintenanceModal = (room: Room) => {
    setMaintenanceRoom(room);
    setMaintenanceData({ title: '', description: '', priority: 'MEDIA' });
    setIsMaintenanceModalOpen(true);
  };

  const closeMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
    setMaintenanceRoom(null);
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceRoom) return;

    try {
      await api.post('/maintenance', {
        roomId: maintenanceRoom.id,
        title: maintenanceData.title,
        description: maintenanceData.description,
        priority: maintenanceData.priority,
      });
      closeMaintenanceModal();
      loadRooms();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao registrar manutenção');
    }
  };

  const openFinishMaintenanceModal = (room: Room) => {
    setFinishMaintenanceRoom(room);
    setFinishMaintenanceData({ observation: '', cost: 0 });
    setIsFinishMaintenanceModalOpen(true);
  };

  const closeFinishMaintenanceModal = () => {
    setIsFinishMaintenanceModalOpen(false);
    setFinishMaintenanceRoom(null);
  };

  const handleFinishMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishMaintenanceRoom) return;

    try {
      const maintenanceResponse = await api.get('/maintenance');
      const activeMaintenance = maintenanceResponse.data.find(
        (m: { roomId: string; status: string }) => m.roomId === finishMaintenanceRoom.id && m.status !== 'FINALIZADA'
      );

      if (activeMaintenance) {
        if (activeMaintenance.status === 'PENDENTE') {
          await api.patch(`/maintenance/${activeMaintenance.id}/start`);
        }
        await api.patch(`/maintenance/${activeMaintenance.id}/finish`, {
          cost: finishMaintenanceData.cost,
          observation: finishMaintenanceData.observation,
        });
      } else {
        await api.patch(`/rooms/${finishMaintenanceRoom.id}/status`, { status: 'LIVRE' });
      }

      closeFinishMaintenanceModal();
      loadRooms();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erro ao finalizar manutenção');
    }
  };

  // Stats
  const livres = rooms.filter((r) => r.status === 'LIVRE').length;
  const ocupados = rooms.filter((r) => r.status === 'OCUPADO').length;
  const reservados = rooms.filter((r) => r.status === 'RESERVADO').length;
  const limpeza = rooms.filter((r) => r.status === 'LIMPEZA').length;
  const manutencao = rooms.filter((r) => r.status === 'MANUTENCAO').length;

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'TODOS') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVRE':
        return <Badge variant="success">Livre</Badge>;
      case 'OCUPADO':
        return <Badge variant="danger">Ocupado</Badge>;
      case 'RESERVADO':
        return <Badge variant="info">Reservado</Badge>;
      case 'LIMPEZA':
        return <Badge variant="warning">Limpeza</Badge>;
      case 'MANUTENCAO':
        return <Badge variant="default">Manutenção</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'STANDARD':
        return <Badge variant="default">Standard</Badge>;
      case 'LUXO':
        return <Badge variant="info">Luxo</Badge>;
      case 'MASTER':
        return <Badge variant="success">Master</Badge>;
      default:
        return <Badge>{type}</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quartos</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie os quartos da pousada</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Quarto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Livres</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{livres}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <Home className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Ocupados</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{ocupados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Reservados</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{reservados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <BedDouble className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Limpeza</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{limpeza}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Manutenção</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{manutencao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['TODOS', 'LIVRE', 'OCUPADO', 'RESERVADO', 'LIMPEZA', 'MANUTENCAO'] as FilterStatus[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'TODOS' ? 'Todos' : status === 'MANUTENCAO' ? 'Manutenção' : status.charAt(0) + status.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Rooms List */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BedDouble className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum quarto encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {/* Card Header with Status Color */}
              <div className={`h-2 ${room.status === 'LIVRE' ? 'bg-green-500' :
                  room.status === 'OCUPADO' ? 'bg-red-500' :
                    room.status === 'RESERVADO' ? 'bg-blue-500' :
                      room.status === 'LIMPEZA' ? 'bg-yellow-500' :
                        'bg-orange-500'
                }`} />

              <CardContent className="p-4">
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quarto {room.number}</h3>
                      {getTypeBadge(room.type)}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{room.name}</p>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                {/* Room Details */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{room.capacity} pessoas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(room.dailyRate)}</span>
                  </div>
                </div>

                {room.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{room.description}</p>
                )}

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  {room.status === 'MANUTENCAO' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openFinishMaintenanceModal(room)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Finalizar Manutenção
                    </Button>
                  ) : (
                    <>
                      {room.status !== 'LIVRE' && room.status !== 'OCUPADO' && room.status !== 'RESERVADO' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(room.id, 'LIVRE')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Liberar
                        </Button>
                      )}
                      {room.status !== 'OCUPADO' && room.status !== 'RESERVADO' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openMaintenanceModal(room)}
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          Manutenção
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Edit/Delete Actions */}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openModal(room)} className="flex-1">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(room.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Novo/Editar Quarto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingRoom ? 'Editar Quarto' : 'Novo Quarto'}
              </h2>
              <button type="button" onClick={closeModal}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Número"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                />
                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    id="roomType"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="LUXO">Luxo</option>
                    <option value="MASTER">Master</option>
                  </select>
                </div>
              </div>
              <Input
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Suíte Standard"
                required
              />
              <Input
                label="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do quarto..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Capacidade"
                  type="number"
                  min={1}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Diária (R$)"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                  required
                />
              </div>

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

      {/* Modal de Manutenção */}
      {isMaintenanceModalOpen && maintenanceRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <AlertTriangle className="w-5 h-5 text-orange-500 inline mr-2" />
                Registrar Manutenção - Quarto {maintenanceRoom.number}
              </h2>
              <button type="button" onClick={closeMaintenanceModal}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="p-4 space-y-4">
              <Input
                label="Título da Manutenção"
                value={maintenanceData.title}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, title: e.target.value })}
                placeholder="Ex: Vazamento no banheiro"
                required
              />
              <div>
                <label htmlFor="maintenanceDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  id="maintenanceDesc"
                  value={maintenanceData.description}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
                  placeholder="Descreva o problema..."
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white min-h-[80px]"
                />
              </div>
              <div>
                <label htmlFor="maintenancePriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <select
                  id="maintenancePriority"
                  value={maintenanceData.priority}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, priority: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={closeMaintenanceModal} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <Wrench className="w-4 h-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Finalizar Manutenção */}
      {isFinishMaintenanceModalOpen && finishMaintenanceRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <CheckCircle className="w-5 h-5 text-green-500 inline mr-2" />
                Finalizar Manutenção - Quarto {finishMaintenanceRoom.number}
              </h2>
              <button type="button" onClick={closeFinishMaintenanceModal}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleFinishMaintenanceSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="finishObs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações do Serviço
                </label>
                <textarea
                  id="finishObs"
                  value={finishMaintenanceData.observation}
                  onChange={(e) => setFinishMaintenanceData({ ...finishMaintenanceData, observation: e.target.value })}
                  placeholder="Descreva o que foi feito..."
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white min-h-[100px]"
                />
              </div>
              <Input
                label="Valor Cobrado (R$)"
                type="number"
                min={0}
                step={0.01}
                value={finishMaintenanceData.cost}
                onChange={(e) => setFinishMaintenanceData({ ...finishMaintenanceData, cost: Number(e.target.value) })}
                placeholder="0,00"
              />
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  O valor será registrado como saída no caixa (categoria: Manutenção)
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={closeFinishMaintenanceModal} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar e Liberar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
