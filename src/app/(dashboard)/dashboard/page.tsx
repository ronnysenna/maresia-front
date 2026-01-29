'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RoomStatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { Room, Reservation } from '@/types';
import {
  BedDouble,
  CalendarDays,
  LogIn,
  LogOut,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalRooms: number;
  freeRooms: number;
  occupiedRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  pendingReservations: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [roomsRes, checkInsRes, checkOutsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/checkin/today'),
        api.get('/checkout/today'),
      ]);

      const roomsData: Room[] = roomsRes.data;
      
      setRooms(roomsData);
      setTodayReservations([...checkInsRes.data, ...checkOutsRes.data]);
      
      setStats({
        totalRooms: roomsData.length,
        freeRooms: roomsData.filter(r => r.status === 'LIVRE').length,
        occupiedRooms: roomsData.filter(r => r.status === 'OCUPADO').length,
        todayCheckIns: checkInsRes.data.length,
        todayCheckOuts: checkOutsRes.data.length,
        pendingReservations: 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral da pousada</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BedDouble className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Quartos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRooms}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Quartos Livres</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.freeRooms}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <LogIn className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-ins Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.todayCheckIns}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <LogOut className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-outs Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.todayCheckOuts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Quartos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">{room.number}</span>
                  <RoomStatusBadge status={room.status} />
                </div>
                <p className="text-sm text-gray-500">{room.type}</p>
                <p className="text-sm font-medium text-gray-700">{formatCurrency(room.dailyRate)}/dia</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      {todayReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{reservation.guest?.name}</p>
                    <p className="text-sm text-gray-500">Quarto {reservation.room?.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(reservation.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
