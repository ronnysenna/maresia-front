'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    Building2,
    Phone,
    Mail,
    MapPin,
    Users,
    Plus,
    Pencil,
    Trash2,
    X,
    Key,
    Shield,
    Save
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'GERENTE' | 'RECEPCAO' | 'LIMPEZA';
    active: boolean;
    createdAt: string;
}

interface PousadaData {
    nome: string;
    cnpj: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
    whatsapp: string;
    email: string;
    site: string;
}

// Dados padrão da pousada
const defaultPousadaData: PousadaData = {
    nome: 'Pousada Maresia',
    cnpj: '12.345.678/0001-90',
    endereco: 'Av. Beira Mar, 1234',
    bairro: 'Praia do Futuro',
    cidade: 'Fortaleza',
    estado: 'CE',
    cep: '60180-000',
    telefone: '(85) 3456-7890',
    whatsapp: '(85) 99999-8888',
    email: 'contato@pousadamaresia.com.br',
    site: 'www.pousadamaresia.com.br',
};

export default function ConfiguracoesPage() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isPousadaModalOpen, setIsPousadaModalOpen] = useState(false);
    const [isChangeMyPasswordModalOpen, setIsChangeMyPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RECEPCAO' as User['role'],
    });
    const [newPassword, setNewPassword] = useState('');
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Estado para dados da pousada
    const [pousadaData, setPousadaData] = useState<PousadaData>(defaultPousadaData);
    const [pousadaFormData, setPousadaFormData] = useState<PousadaData>(defaultPousadaData);

    const isAdmin = currentUser?.role === 'ADMIN';

    useEffect(() => {
        loadSettings();

        if (isAdmin) {
            loadUsers();
        } else {
            setIsLoading(false);
        }
    }, [isAdmin]);

    const loadSettings = async () => {
        try {
            const response = await api.get('/settings');
            setPousadaData(response.data);
            setPousadaFormData(response.data);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'RECEPCAO',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                });
            } else {
                await api.post('/users', formData);
            }
            closeModal();
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao salvar usuário');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja desativar este usuário?')) return;
        try {
            await api.delete(`/users/${id}`);
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao desativar usuário');
        }
    };

    const openResetPasswordModal = (user: User) => {
        setSelectedUserForReset(user);
        setNewPassword('');
        setIsResetPasswordModalOpen(true);
    };

    const closeResetPasswordModal = () => {
        setIsResetPasswordModalOpen(false);
        setSelectedUserForReset(null);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForReset || !newPassword) return;

        try {
            await api.patch(`/users/${selectedUserForReset.id}/password`, {
                password: newPassword,
            });
            alert('Senha alterada com sucesso!');
            closeResetPasswordModal();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao resetar senha');
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge variant="danger">Admin</Badge>;
            case 'GERENTE':
                return <Badge variant="warning">Gerente</Badge>;
            case 'RECEPCAO':
                return <Badge variant="info">Recepção</Badge>;
            case 'LIMPEZA':
                return <Badge variant="default">Limpeza</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    const openPousadaModal = () => {
        setIsPousadaModalOpen(true);
    };

    const closePousadaModal = () => {
        setIsPousadaModalOpen(false);
    };

    const handlePousadaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.put('/settings', pousadaFormData);
            setPousadaData(response.data);
            closePousadaModal();
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert('Erro ao salvar configurações');
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-gray-500 dark:text-gray-400">Dados da pousada e configurações do sistema</p>
            </div>

            {/* Dados da Pousada */}
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Dados da Pousada
                            </h2>
                        </div>
                        {isAdmin && (
                            <Button onClick={openPousadaModal}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Nome</label>
                                <p className="font-medium text-gray-900 dark:text-white">{pousadaData.nome}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">CNPJ</label>
                                <p className="font-medium text-gray-900 dark:text-white">{pousadaData.cnpj}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Endereço</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{pousadaData.endereco}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {pousadaData.bairro} - {pousadaData.cidade}/{pousadaData.estado}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">CEP: {pousadaData.cep}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Telefone</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{pousadaData.telefone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-500" />
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{pousadaData.whatsapp}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">E-mail</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{pousadaData.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Site</label>
                                <p className="font-medium text-blue-600 dark:text-blue-400">{pousadaData.site}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gerenciamento de Usuários - Apenas para Admin */}
            {isAdmin && (
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Gerenciar Usuários
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Adicione, edite ou remova usuários do sistema
                                    </p>
                                </div>
                            </div>
                            <Button onClick={() => openModal()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Usuário
                            </Button>
                        </div>

                        {/* Lista de Usuários */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Nome
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Perfil
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Status
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                                        >
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-2">{getRoleBadge(user.role)}</td>
                                            <td className="py-3 px-2">
                                                <Badge variant={user.active ? 'success' : 'default'}>
                                                    {user.active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openResetPasswordModal(user)}
                                                        title="Resetar Senha"
                                                    >
                                                        <Key className="w-4 h-4 text-yellow-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openModal(user)}
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    {user.id !== currentUser?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(user.id)}
                                                            title="Desativar"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Informações do Usuário Logado */}
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Meu Perfil
                            </h2>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setIsChangeMyPasswordModalOpen(true)}
                        >
                            <Key className="w-4 h-4 mr-2" />
                            Alterar Minha Senha
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {currentUser?.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                {currentUser?.name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                            <div className="mt-1">{getRoleBadge(currentUser?.role || '')}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Criar/Editar Usuário */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <button type="button" onClick={closeModal}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <Input
                                label="Nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            {!editingUser && (
                                <Input
                                    label="Senha"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                />
                            )}
                            <div>
                                <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Perfil
                                </label>
                                <select
                                    id="user-role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="ADMIN">Administrador</option>
                                    <option value="GERENTE">Gerente</option>
                                    <option value="RECEPCAO">Recepção</option>
                                    <option value="LIMPEZA">Limpeza</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {editingUser ? 'Salvar' : 'Criar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Resetar Senha */}
            {isResetPasswordModalOpen && selectedUserForReset && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Resetar Senha
                            </h2>
                            <button type="button" onClick={closeResetPasswordModal}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="p-4 space-y-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Você está alterando a senha do usuário:
                                </p>
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mt-1">
                                    {selectedUserForReset.name} ({selectedUserForReset.email})
                                </p>
                            </div>

                            <Input
                                label="Nova Senha"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Mínimo 6 caracteres"
                            />

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={closeResetPasswordModal} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    <Key className="w-4 h-4 mr-2" />
                                    Alterar Senha
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Editar Dados da Pousada */}
            {isPousadaModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Editar Dados da Pousada
                            </h2>
                            <button type="button" onClick={closePousadaModal}>
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handlePousadaSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Nome"
                                        value={pousadaFormData.nome}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, nome: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="CNPJ"
                                        value={pousadaFormData.cnpj}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, cnpj: e.target.value })}
                                        required
                                    />
                                </div>
                                <Input
                                    label="Endereço"
                                    value={pousadaFormData.endereco}
                                    onChange={(e) => setPousadaFormData({ ...pousadaFormData, endereco: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Bairro"
                                        value={pousadaFormData.bairro}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, bairro: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Cidade"
                                        value={pousadaFormData.cidade}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, cidade: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Estado"
                                        value={pousadaFormData.estado}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, estado: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="CEP"
                                        value={pousadaFormData.cep}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, cep: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Telefone"
                                        value={pousadaFormData.telefone}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, telefone: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="WhatsApp"
                                        value={pousadaFormData.whatsapp}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, whatsapp: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="E-mail"
                                        type="email"
                                        value={pousadaFormData.email}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, email: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Site"
                                        value={pousadaFormData.site}
                                        onChange={(e) => setPousadaFormData({ ...pousadaFormData, site: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-slate-700 shrink-0">
                                <Button type="button" variant="secondary" onClick={closePousadaModal} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Alterar Minha Senha */}
            {isChangeMyPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Alterar Minha Senha
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangeMyPasswordModalOpen(false);
                                    setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
                                    alert('As senhas não coincidem');
                                    return;
                                }
                                if (changePasswordData.newPassword.length < 6) {
                                    alert('A nova senha deve ter pelo menos 6 caracteres');
                                    return;
                                }
                                try {
                                    await api.patch('/auth/change-password', {
                                        currentPassword: changePasswordData.currentPassword,
                                        newPassword: changePasswordData.newPassword,
                                    });
                                    alert('Senha alterada com sucesso!');
                                    setIsChangeMyPasswordModalOpen(false);
                                    setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                } catch (error: unknown) {
                                    const err = error as { response?: { data?: { message?: string } } };
                                    alert(err.response?.data?.message || 'Erro ao alterar senha');
                                }
                            }}
                            className="p-4 space-y-4"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Por segurança, informe sua senha atual antes de definir uma nova senha.
                                </p>
                            </div>

                            <Input
                                label="Senha Atual"
                                type="password"
                                value={changePasswordData.currentPassword}
                                onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                required
                                placeholder="Digite sua senha atual"
                            />

                            <Input
                                label="Nova Senha"
                                type="password"
                                value={changePasswordData.newPassword}
                                onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                required
                                placeholder="Mínimo 6 caracteres"
                            />

                            <Input
                                label="Confirmar Nova Senha"
                                type="password"
                                value={changePasswordData.confirmPassword}
                                onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                                required
                                placeholder="Repita a nova senha"
                            />

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsChangeMyPasswordModalOpen(false);
                                        setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    <Key className="w-4 h-4 mr-2" />
                                    Alterar Senha
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
