'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Guest, Reservation } from '@/types';
import {
    Users,
    Crown,
    Star,
    UserPlus,
    Search,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Tag,
    X,
    Eye,
    Pencil,
    Plus,
    MessageSquare,
    FileText,
    ChevronDown,
    ChevronUp,
    Clock,
    Home,
} from 'lucide-react';

type FilterClassification = 'TODOS' | 'NOVO' | 'REGULAR' | 'VIP';

interface GuestStats {
    total: number;
    vips: number;
    regulars: number;
    novos: number;
    withEmail: number;
    inactiveCount: number;
    topSpenders: {
        id: string;
        name: string;
        totalSpent: number;
        totalStays: number;
        classification: string;
    }[];
}

export default function ClientesPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [stats, setStats] = useState<GuestStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterClassification>('TODOS');
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [newTag, setNewTag] = useState('');
    const [expandedGuest, setExpandedGuest] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        documentType: 'CPF',
        birthDate: '',
        address: '',
        city: '',
        state: '',
        country: 'Brasil',
        preferredRoom: '',
        howDidYouHear: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [guestsRes, statsRes] = await Promise.all([
                api.get('/guests'),
                api.get('/guests/stats'),
            ]);
            setGuests(guestsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredGuests = guests.filter((guest) => {
        const matchesSearch =
            !search ||
            guest.name.toLowerCase().includes(search.toLowerCase()) ||
            guest.email?.toLowerCase().includes(search.toLowerCase()) ||
            guest.phone.includes(search) ||
            guest.document.includes(search);

        const matchesFilter =
            filter === 'TODOS' || guest.classification === filter;

        return matchesSearch && matchesFilter;
    });

    const openDetailModal = async (guest: Guest) => {
        try {
            const response = await api.get(`/guests/${guest.id}`);
            setSelectedGuest(response.data);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    };

    const openEditModal = (guest?: Guest) => {
        if (guest) {
            setSelectedGuest(guest);
            setFormData({
                name: guest.name,
                email: guest.email || '',
                phone: guest.phone,
                document: guest.document,
                documentType: guest.documentType,
                birthDate: guest.birthDate ? guest.birthDate.split('T')[0] : '',
                address: guest.address || '',
                city: guest.city || '',
                state: guest.state || '',
                country: guest.country || 'Brasil',
                preferredRoom: guest.preferredRoom || '',
                howDidYouHear: guest.howDidYouHear || '',
            });
        } else {
            setSelectedGuest(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                document: '',
                documentType: 'CPF',
                birthDate: '',
                address: '',
                city: '',
                state: '',
                country: 'Brasil',
                preferredRoom: '',
                howDidYouHear: '',
            });
        }
        setIsEditModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
                email: formData.email || null,
            };

            if (selectedGuest) {
                await api.put(`/guests/${selectedGuest.id}`, data);
            } else {
                await api.post('/guests', data);
            }
            setIsEditModalOpen(false);
            loadData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Erro ao salvar cliente');
        }
    };

    const handleAddNote = async () => {
        if (!selectedGuest || !newNote.trim()) return;
        try {
            await api.post(`/guests/${selectedGuest.id}/notes`, { note: newNote });
            setNewNote('');
            setIsNoteModalOpen(false);
            // Recarregar detalhes
            const response = await api.get(`/guests/${selectedGuest.id}`);
            setSelectedGuest(response.data);
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
        }
    };

    const handleAddTag = async () => {
        if (!selectedGuest || !newTag.trim()) return;
        try {
            await api.post(`/guests/${selectedGuest.id}/tags`, { tag: newTag });
            setNewTag('');
            setIsTagModalOpen(false);
            const response = await api.get(`/guests/${selectedGuest.id}`);
            setSelectedGuest(response.data);
            loadData();
        } catch (error) {
            console.error('Erro ao adicionar tag:', error);
        }
    };

    const handleRemoveTag = async (tag: string) => {
        if (!selectedGuest) return;
        try {
            await api.delete(`/guests/${selectedGuest.id}/tags`, { data: { tag } });
            const response = await api.get(`/guests/${selectedGuest.id}`);
            setSelectedGuest(response.data);
            loadData();
        } catch (error) {
            console.error('Erro ao remover tag:', error);
        }
    };

    const handleClassificationChange = async (classification: string) => {
        if (!selectedGuest) return;
        try {
            await api.patch(`/guests/${selectedGuest.id}/classification`, { classification });
            const response = await api.get(`/guests/${selectedGuest.id}`);
            setSelectedGuest(response.data);
            loadData();
        } catch (error) {
            console.error('Erro ao alterar classificação:', error);
        }
    };

    const getClassificationBadge = (classification: string) => {
        switch (classification) {
            case 'VIP':
                return (
                    <Badge variant="warning" className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        VIP
                    </Badge>
                );
            case 'REGULAR':
                return (
                    <Badge variant="info" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Regular
                    </Badge>
                );
            case 'NOVO':
                return (
                    <Badge variant="success" className="flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        Novo
                    </Badge>
                );
            default:
                return <Badge>{classification}</Badge>;
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie os hóspedes da pousada</p>
                </div>
                <Button onClick={() => openEditModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">VIP</p>
                                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats?.vips || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
                                <Star className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-cyan-600 dark:text-cyan-400">Regulares</p>
                                <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats?.regulars || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400">Novos</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.novos || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome, email, telefone ou documento..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(['TODOS', 'VIP', 'REGULAR', 'NOVO'] as FilterClassification[]).map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter(status)}
                        >
                            {status === 'TODOS' ? 'Todos' : status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Top Spenders Alert */}
            {stats?.topSpenders && stats.topSpenders.length > 0 && (
                <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Top 5 Clientes por Valor Gasto
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {stats.topSpenders.map((guest, index) => (
                                <div
                                    key={guest.id}
                                    className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-sm"
                                >
                                    <span className="text-amber-600 font-bold">#{index + 1}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{guest.name}</span>
                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                        {formatCurrency(guest.totalSpent)}
                                    </span>
                                    <span className="text-xs text-gray-500">({guest.totalStays} estadias)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Guests List */}
            {filteredGuests.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhum cliente encontrado</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredGuests.map((guest) => (
                        <Card key={guest.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Guest Info */}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${guest.classification === 'VIP' ? 'bg-amber-500' :
                                                guest.classification === 'REGULAR' ? 'bg-blue-500' :
                                                    'bg-green-500'
                                            }`}>
                                            {guest.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{guest.name}</h3>
                                                {getClassificationBadge(guest.classification)}
                                            </div>
                                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {guest.documentType}: {guest.document}
                                                </span>
                                                {guest.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {guest.phone}
                                                    </span>
                                                )}
                                                {guest.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {guest.email}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Tags */}
                                            {guest.tags && guest.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {guest.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Estadias</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{guest.totalStays}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Gasto</p>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(guest.totalSpent)}
                                            </p>
                                        </div>
                                        {guest.lastVisit && (
                                            <div className="text-center hidden md:block">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Última Visita</p>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {formatDate(guest.lastVisit)}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDetailModal(guest)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(guest)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedGuest(expandedGuest === guest.id ? null : guest.id)}
                                            >
                                                {expandedGuest === guest.id ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded - Recent Reservations */}
                                {expandedGuest === guest.id && guest.reservations && guest.reservations.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Últimas Reservas
                                        </h4>
                                        <div className="space-y-2">
                                            {guest.reservations.slice(0, 5).map((res: Reservation) => (
                                                <div
                                                    key={res.id}
                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Home className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-900 dark:text-white">
                                                            Quarto {res.room?.number}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                res.status === 'FINALIZADA' ? 'success' :
                                                                    res.status === 'CONFIRMADA' ? 'info' :
                                                                        res.status === 'CANCELADA' ? 'danger' : 'warning'
                                                            }
                                                        >
                                                            {res.status}
                                                        </Badge>
                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                                            {formatCurrency(res.totalValue)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedGuest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedGuest.classification === 'VIP' ? 'bg-amber-500' :
                                        selectedGuest.classification === 'REGULAR' ? 'bg-blue-500' :
                                            'bg-green-500'
                                    }`}>
                                    {selectedGuest.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedGuest.name}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Cliente desde {formatDate(selectedGuest.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsDetailModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Classification & Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Classificação</p>
                                    <div className="mt-1">{getClassificationBadge(selectedGuest.classification)}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Estadias</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedGuest.totalStays}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Gasto</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(selectedGuest.totalSpent)}
                                    </p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Informações de Contato</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span>{selectedGuest.documentType}: {selectedGuest.document}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{selectedGuest.phone}</span>
                                    </div>
                                    {selectedGuest.email && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{selectedGuest.email}</span>
                                        </div>
                                    )}
                                    {selectedGuest.city && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{selectedGuest.city}{selectedGuest.state ? `, ${selectedGuest.state}` : ''}</span>
                                        </div>
                                    )}
                                    {selectedGuest.birthDate && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>Nascimento: {formatDate(selectedGuest.birthDate)}</span>
                                        </div>
                                    )}
                                    {selectedGuest.lastVisit && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>Última visita: {formatDate(selectedGuest.lastVisit)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</h3>
                                    <Button size="sm" variant="ghost" onClick={() => setIsTagModalOpen(true)}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Adicionar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGuest.tags && selectedGuest.tags.length > 0 ? (
                                        selectedGuest.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tag</span>
                                    )}
                                </div>
                            </div>

                            {/* Classification Buttons */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alterar Classificação</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={selectedGuest.classification === 'NOVO' ? 'primary' : 'secondary'}
                                        onClick={() => handleClassificationChange('NOVO')}
                                    >
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        Novo
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={selectedGuest.classification === 'REGULAR' ? 'primary' : 'secondary'}
                                        onClick={() => handleClassificationChange('REGULAR')}
                                    >
                                        <Star className="w-4 h-4 mr-1" />
                                        Regular
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={selectedGuest.classification === 'VIP' ? 'primary' : 'secondary'}
                                        onClick={() => handleClassificationChange('VIP')}
                                    >
                                        <Crown className="w-4 h-4 mr-1" />
                                        VIP
                                    </Button>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Observações</h3>
                                    <Button size="sm" variant="ghost" onClick={() => setIsNoteModalOpen(true)}>
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        Adicionar Nota
                                    </Button>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap min-h-[80px]">
                                    {selectedGuest.notes || 'Nenhuma observação registrada.'}
                                </div>
                            </div>

                            {/* Reservation History */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Histórico de Reservas ({selectedGuest.reservations?.length || 0})
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {selectedGuest.reservations && selectedGuest.reservations.length > 0 ? (
                                        selectedGuest.reservations.map((res: Reservation) => (
                                            <div
                                                key={res.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Home className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Quarto {res.room?.number} - {res.room?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            res.status === 'FINALIZADA' ? 'success' :
                                                                res.status === 'CONFIRMADA' ? 'info' :
                                                                    res.status === 'CANCELADA' ? 'danger' : 'warning'
                                                        }
                                                    >
                                                        {res.status}
                                                    </Badge>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                                        {formatCurrency(res.totalValue)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                            Nenhuma reserva registrada
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)} className="flex-1">
                                Fechar
                            </Button>
                            <Button onClick={() => { setIsDetailModalOpen(false); openEditModal(selectedGuest); }} className="flex-1">
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg my-8">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedGuest ? 'Editar Cliente' : 'Novo Cliente'}
                            </h2>
                            <button type="button" onClick={() => setIsEditModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            <Input
                                label="Nome Completo *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tipo Documento
                                    </label>
                                    <select
                                        value={formData.documentType}
                                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="RG">RG</option>
                                        <option value="PASSAPORTE">Passaporte</option>
                                        <option value="CNH">CNH</option>
                                    </select>
                                </div>
                                <Input
                                    label="Documento *"
                                    value={formData.document}
                                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Telefone *"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                                <Input
                                    label="E-mail"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Data de Nascimento"
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            />

                            <Input
                                label="Endereço"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Cidade"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                                <Input
                                    label="Estado"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>

                            <Input
                                label="País"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />

                            <Input
                                label="Quarto Preferido"
                                value={formData.preferredRoom}
                                onChange={(e) => setFormData({ ...formData, preferredRoom: e.target.value })}
                                placeholder="Ex: 101, Vista Mar"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Como conheceu a pousada?
                                </label>
                                <select
                                    value={formData.howDidYouHear}
                                    onChange={(e) => setFormData({ ...formData, howDidYouHear: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Google">Google</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Indicação">Indicação de amigo</option>
                                    <option value="Booking">Booking.com</option>
                                    <option value="Airbnb">Airbnb</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {selectedGuest ? 'Salvar' : 'Criar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Note Modal */}
            {isNoteModalOpen && selectedGuest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar Observação</h2>
                            <button type="button" onClick={() => setIsNoteModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Digite sua observação..."
                                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white min-h-[120px]"
                            />
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button onClick={handleAddNote} className="flex-1">
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Tag Modal */}
            {isTagModalOpen && selectedGuest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar Tag</h2>
                            <button type="button" onClick={() => setIsTagModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <Input
                                label="Tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Ex: VIP, Vegano, Alérgico..."
                            />
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Sugestões:</span>
                                {['VIP', 'Vegano', 'Vegetariano', 'Alérgico', 'Pet Friendly', 'Aniversário', 'Lua de Mel', 'Prefere Silêncio', 'Vista Mar'].map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setNewTag(tag)}
                                        className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setIsTagModalOpen(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button onClick={handleAddTag} className="flex-1">
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
