"use client";

import React, { useState, useEffect } from 'react';
import { Home, DoorOpen, Wallet, ArrowUpRight, TrendingUp, Users } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function OwnerDashboard() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data for charts to demonstrate professional look
  const revenueData = [
    { name: 'Jan', total: 4500000 },
    { name: 'Feb', total: 5200000 },
    { name: 'Mar', total: 4800000 },
    { name: 'Apr', total: 6100000 },
    { name: 'Mei', total: 5900000 },
    { name: 'Jun', total: 7200000 },
  ];

  const occupancyData = [
    { name: 'Kosan A', penuh: 8, kosong: 2 },
    { name: 'Kosan B', penuh: 15, kosong: 5 },
    { name: 'Kosan C', penuh: 5, kosong: 0 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const properties = await fetchWithAuth('/properties');
      setPropertiesCount(properties.length || 0);

      let totalAvail = 0;
      let totalR = 0;
      const roomsPromises = properties.map((prop: any) => 
        fetchWithAuth(`/properties/${prop.id}/rooms`)
          .then((roomsData: any[]) => {
            totalR += roomsData.length;
            totalAvail += roomsData.filter((r: any) => r.is_available).length;
          })
          .catch((err) => console.error(err))
      );
      await Promise.all(roomsPromises);
      setAvailableRoomsCount(totalAvail);
      setTotalRooms(totalR);

      const bookings = await fetchWithAuth('/bookings');
      const paidBookings = bookings.filter((b: any) => b.status === 'PAID');
      const totalRev = paidBookings.reduce((sum: number, b: any) => sum + Number(b.total_price), 0);
      setRevenue(totalRev);

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
    { label: 'Pendapatan Bulan Ini', value: loading ? '...' : formatRupiah(revenue), icon: <Wallet size={24} className="text-blue-600" />, trend: '+12.5%', color: 'bg-blue-50' },
    { label: 'Total Properti', value: loading ? '...' : propertiesCount, icon: <Home size={24} className="text-indigo-600" />, trend: '+2', color: 'bg-indigo-50' },
    { label: 'Kamar Terisi', value: loading ? '...' : (totalRooms - availableRoomsCount), icon: <Users size={24} className="text-emerald-600" />, trend: '85%', color: 'bg-emerald-50' },
    { label: 'Kamar Kosong', value: loading ? '...' : availableRoomsCount, icon: <DoorOpen size={24} className="text-orange-600" />, trend: '15%', color: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                <TrendingUp size={14} />
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tren Pendapatan</h3>
              <p className="text-xs text-slate-500">6 Bulan Terakhir</p>
            </div>
            <button className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">Laporan Lengkap</button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `Rp${val/1000000}M`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Pendapatan']}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Tingkat Okupansi</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="penuh" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} name="Terisi" barSize={32} />
                <Bar dataKey="kosong" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Kosong" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          {[
            { title: 'Pembayaran Diterima', desc: 'Budi Santoso membayar sewa Kamar 3A', time: '2 jam yang lalu', icon: <Wallet size={16} className="text-emerald-600"/>, bg: 'bg-emerald-50' },
            { title: 'Booking Baru', desc: 'Siti Aminah memesan Kamar 2B (Kosan Andalan)', time: '5 jam yang lalu', icon: <DoorOpen size={16} className="text-blue-600"/>, bg: 'bg-blue-50' },
            { title: 'Laporan Kerusakan', desc: 'AC Kamar 1C bocor (Dilaporkan oleh Andi)', time: '1 hari yang lalu', icon: <ArrowUpRight size={16} className="text-red-600"/>, bg: 'bg-red-50' },
          ].map((act, i) => (
            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition cursor-pointer">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${act.bg}`}>
                {act.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">{act.title}</h4>
                <p className="text-xs text-slate-500">{act.desc}</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
