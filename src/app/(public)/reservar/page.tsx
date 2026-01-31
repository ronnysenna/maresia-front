'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    Waves,
    Calendar,
    Users,
    BedDouble,
    ChevronLeft,
    ChevronRight,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface Room {
    id: string;
    number: string;
    type: string;
    capacity: number;
    pricePerNight: number;
    description: string | null;
    status: string;
}

interface AvailableRoom extends Room {
    selected?: boolean;
}

const steps = [
    { id: 1, name: 'Datas' },
    { id: 2, name: 'Quarto' },
    { id: 3, name: 'Dados' },
    { id: 4, name: 'Confirmação' },
];

export default function ReservarPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <ReservarContent />
        </Suspense>
    );
}

function ReservarContent() {
    const searchParams = useSearchParams();
    const tipoParam = searchParams.get('tipo');

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Step 1: Dates
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

    // Step 2: Room selection
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
    const [loadingRooms, setLoadingRooms] = useState(false);

    // Step 3: Guest data
    const [guestData, setGuestData] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        notes: '',
    });

    // Reservation result
    const [reservation, setReservation] = useState<{ id?: string } | null>(null);

    // Calculate nights and total
    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const nights = calculateNights();
    const totalPrice = selectedRoom ? nights * selectedRoom.pricePerNight : 0;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    // Fetch available rooms when dates change
    const fetchAvailableRooms = async () => {
        if (!checkIn || !checkOut) return;

        setLoadingRooms(true);
        setError('');

        try {
            const response = await api.get('/rooms/available', {
                params: { checkIn, checkOut },
            });

            const rawRooms = (response.data || []) as Array<Partial<Room & { dailyRate?: number }>>;

            // Garantir que cada quarto tenha a propriedade `pricePerNight` usada pelo front.
            let rooms = rawRooms.map((dr) => {
                const price = typeof dr.pricePerNight === 'number'
                    ? (dr.pricePerNight as number)
                    : typeof dr.pricePerNight === 'string'
                        ? parseFloat(dr.pricePerNight)
                        : typeof dr.dailyRate === 'number'
                            ? (dr.dailyRate as number)
                            : typeof dr.dailyRate === 'string'
                                ? parseFloat(dr.dailyRate)
                                : 0;

                return {
                    id: dr.id ?? '',
                    number: dr.number ?? '',
                    type: dr.type ?? 'STANDARD',
                    capacity: dr.capacity ?? 1,
                    pricePerNight: Number.isFinite(price) ? price : 0,
                    description: dr.description ?? null,
                    status: dr.status ?? 'LIVRE',
                } as Room;
            });

            // Filter by capacity
            rooms = rooms.filter((room: Room) => room.capacity >= guests);

            // Filter by type if specified
            if (tipoParam) {
                const filteredByType = rooms.filter(
                    (room: Room) => room.type.toLowerCase() === tipoParam.toLowerCase()
                );
                if (filteredByType.length > 0) {
                    rooms = filteredByType;
                }
            }

            setAvailableRooms(rooms);
        } catch {
            setError('Erro ao buscar quartos disponíveis');
            setAvailableRooms([]);
        } finally {
            setLoadingRooms(false);
        }
    };

    // Create reservation
    const createReservation = async () => {
        if (!selectedRoom || !checkIn || !checkOut) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/reservations/public', {
                roomId: selectedRoom.id,
                guestName: guestData.name,
                guestEmail: guestData.email,
                guestPhone: guestData.phone,
                guestDocument: guestData.document,
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                guests,
                notes: guestData.notes || undefined,
            });

            setReservation(response.data);
            setSuccess(true);
            setCurrentStep(4);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Erro ao criar reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        setError('');

        if (currentStep === 1) {
            if (!checkIn || !checkOut) {
                setError('Selecione as datas de check-in e check-out');
                return;
            }
            if (nights < 1) {
                setError('A data de check-out deve ser posterior à data de check-in');
                return;
            }
            fetchAvailableRooms();
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!selectedRoom) {
                setError('Selecione um quarto');
                return;
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (!guestData.name || !guestData.email || !guestData.phone) {
                setError('Preencha todos os campos obrigatórios');
                return;
            }
            createReservation();
        }
    };

    const handlePrevStep = () => {
        setError('');
        if (currentStep > 1 && currentStep < 4) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Pousada Maresia</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link
                                href="/"
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Voltar ao site
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Faça sua Reserva
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                    Reserve seu quarto em poucos passos
                </p>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors ${currentStep >= step.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <span className={`ml-2 text-sm font-medium hidden sm:block ${currentStep >= step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {step.name}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 sm:w-20 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Step Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
                    {/* Step 1: Dates */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Escolha as datas</h2>
                                <p className="text-gray-600 dark:text-gray-400">Selecione o período da sua estadia</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Check-in
                                    </label>
                                    <input
                                        id="checkIn"
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        min={today}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Check-out
                                    </label>
                                    <input
                                        id="checkOut"
                                        type="date"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        min={checkIn || today}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Número de hóspedes
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    >
                                        -
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{guests}</span>
                                    </div>
                                    <button
                                        onClick={() => setGuests(Math.min(6, guests + 1))}
                                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {nights > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                                        {nights} {nights === 1 ? 'noite' : 'noites'} selecionada{nights > 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Room Selection */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <BedDouble className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Escolha seu quarto</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {nights} {nights === 1 ? 'noite' : 'noites'} • {guests} {guests === 1 ? 'hóspede' : 'hóspedes'}
                                </p>
                            </div>

                            {loadingRooms ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">Buscando quartos disponíveis...</p>
                                </div>
                            ) : availableRooms.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 dark:text-gray-400">Nenhum quarto disponível para as datas selecionadas.</p>
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                    >
                                        Alterar datas
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room)}
                                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedRoom?.id === room.id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedRoom?.id === room.id ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'
                                                        }`}>
                                                        <BedDouble className={`w-6 h-6 ${selectedRoom?.id === room.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            Quarto {room.number} - {room.type}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Até {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                                                        </p>
                                                        {room.description && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{room.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(room.pricePerNight)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">/noite</p>
                                                    <p className="text-sm font-medium text-gray-700 mt-1">
                                                        Total: {formatCurrency(room.pricePerNight * nights)}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedRoom?.id === room.id && (
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <div className="flex items-center justify-center gap-2 text-blue-600">
                                                        <Check className="w-5 h-5" />
                                                        <span className="font-medium">Quarto selecionado</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Guest Data */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Seus dados</h2>
                                <p className="text-gray-600">Preencha seus dados para finalizar a reserva</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nome completo *
                                    </label>
                                    <input
                                        id="guestName"
                                        type="text"
                                        value={guestData.name}
                                        onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                                        placeholder="Digite seu nome completo"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        E-mail *
                                    </label>
                                    <input
                                        id="guestEmail"
                                        type="email"
                                        value={guestData.email}
                                        onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                        placeholder="seu@email.com"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Telefone *
                                    </label>
                                    <input
                                        id="guestPhone"
                                        type="tel"
                                        value={guestData.phone}
                                        onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="guestDocument" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        CPF / Documento
                                    </label>
                                    <input
                                        id="guestDocument"
                                        type="text"
                                        value={guestData.document}
                                        onChange={(e) => setGuestData({ ...guestData, document: e.target.value })}
                                        placeholder="000.000.000-00"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="guestNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Observações
                                    </label>
                                    <textarea
                                        id="guestNotes"
                                        value={guestData.notes}
                                        onChange={(e) => setGuestData({ ...guestData, notes: e.target.value })}
                                        placeholder="Alguma solicitação especial?"
                                        rows={3}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Reservation Summary */}
                            {selectedRoom && (
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mt-6">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resumo da reserva</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Quarto:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedRoom.number} - {selectedRoom.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Check-in:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(checkIn).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Check-out:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(checkOut).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Hóspedes:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{guests}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">{nights} {nights === 1 ? 'noite' : 'noites'} x {formatCurrency(selectedRoom.pricePerNight)}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between text-lg">
                                                <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {currentStep === 4 && success && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reserva Confirmada!</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Sua reserva foi realizada com sucesso. Enviamos os detalhes para seu e-mail.
                            </p>

                            {reservation && (
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detalhes da reserva</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Código:</span>
                                            <span className="font-mono font-medium text-gray-900 dark:text-white">{reservation.id?.slice(0, 8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Status:</span>
                                            <span className="font-medium text-yellow-600">Pendente Confirmação</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Quarto:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedRoom?.number} - {selectedRoom?.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Check-in:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(checkIn).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Check-out:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(checkOut).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between text-lg">
                                                <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Nossa equipe entrará em contato em breve para confirmar sua reserva.
                            </p>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Voltar ao site
                            </Link>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {currentStep < 4 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                            <button
                                onClick={handlePrevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Voltar
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        {currentStep === 3 ? 'Finalizar Reserva' : 'Continuar'}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
