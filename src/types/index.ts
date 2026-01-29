export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'RECEPCAO' | 'LIMPEZA';
  active: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  type: string;
  description?: string;
  capacity: number;
  dailyRate: number;
  status: 'LIVRE' | 'RESERVADO' | 'OCUPADO' | 'LIMPEZA' | 'MANUTENCAO';
  images: string[];
  amenities: string[];
  active: boolean;
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone: string;
  document: string;
  documentType: string;
}

export interface Reservation {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalValue: number;
  notes?: string;
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA' | 'NO_SHOW' | 'FINALIZADA';
  room: Room;
  guest: Guest;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  dateTime: string;
  observations?: string;
  reservation: Reservation;
  user: { id: string; name: string };
}

export interface CheckOut {
  id: string;
  dateTime: string;
  extraCharges: number;
  observations?: string;
  reservation: Reservation;
  user: { id: string; name: string };
}

export interface Cleaning {
  id: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA';
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
  room: Room;
  user?: { id: string; name: string };
  createdAt: string;
}

export interface Maintenance {
  id: string;
  title: string;
  description?: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA';
  priority: string;
  cost?: number;
  startedAt?: string;
  finishedAt?: string;
  room: Room;
  user?: { id: string; name: string };
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'ENTRADA' | 'SAIDA';
  category: 'DIARIA' | 'EXTRA' | 'MANUTENCAO' | 'LIMPEZA' | 'COMPRA' | 'OUTRO';
  description: string;
  amount: number;
  date: string;
  reservation?: Reservation;
  createdAt: string;
}
