"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, DoorOpen, Wallet } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

export default function OwnerDashboard() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch properties
      const properties = await fetchWithAuth('/properties');
      setPropertiesCount(properties.length || 0);

      // 2. Fetch rooms for each property to calculate available rooms
      let totalAvailableRooms = 0;
      const roomsPromises = properties.map((prop: any) => 
        fetchWithAuth(`/properties/${prop.id}/rooms`)
          .then((roomsData: any[]) => {
            const availCount = roomsData.filter((r: any) => r.is_available).length;
            totalAvailableRooms += availCount;
          })
          .catch((err) => console.error(`Failed to fetch rooms for property ${prop.id}:`, err))
      );
      await Promise.all(roomsPromises);
      setAvailableRoomsCount(totalAvailableRooms);

      // 3. Fetch bookings to calculate revenue (Sum of PAID bookings)
      const bookings = await fetchWithAuth('/bookings');
      const paidBookings = bookings.filter((b: any) => b.status === 'PAID');
      const totalRevenue = paidBookings.reduce((sum: number, b: any) => sum + Number(b.total_price), 0);
      setRevenue(totalRevenue);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const stats = [
    { 
      label: 'Total Properti', 
      value: loading ? '...' : propertiesCount, 
      icon: <Home className="text-indigo-500" />, 
      color: 'bg-indigo-50' 
    },
    { 
      label: 'Kamar Kosong', 
      value: loading ? '...' : availableRoomsCount, 
      icon: <DoorOpen className="text-mint-500" />, 
      color: 'bg-emerald-50' 
    },
    { 
      label: 'Total Pendapatan', 
      value: loading ? '...' : formatRupiah(revenue), 
      icon: <Wallet className="text-lavender-500" />, 
      color: 'bg-purple-50' 
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="clay-card p-8 flex items-center gap-6"
          >
            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="clay-card p-8 text-center text-slate-500 font-medium">
        <p>Silakan navigasikan ke menu <strong>Properti Saya</strong> untuk mengelola kosan dan kamar Anda.</p>
      </div>
    </div>
  );
}
