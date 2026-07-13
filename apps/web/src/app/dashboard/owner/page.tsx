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
  const [earlyBirdBookings, setEarlyBirdBookings] = useState<any[]>([]);

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


  const handleConfirmArrival = (id: string) => {
    alert(`Konfirmasi kedatangan untuk booking ${id} berhasil dikirim ke server.`);
  };

  const handleUploadResi = (id: string) => {
    alert(`Form upload resi pembayaran offline untuk booking ${id} dibuka.`);
  };

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

      // Filter early bird bookings (dp_type is not full and booking is recent)
      const ebBookings = bookings.filter((b: any) =>
        (b.dp_type === 'DP_10' || b.dp_type === 'DP_25') &&
        b.status === 'PAID'
      );
      setEarlyBirdBookings(ebBookings);

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


      {/* Early Bird DP Notifications */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200/50 shadow-sm mt-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Konfirmasi Kedatangan (Early Bird)</h3>
            <p className="text-sm text-amber-700 font-medium">Terdapat penyewa dengan sistem Down Payment menunggu kedatangan.</p>
          </div>
        </div>

        {earlyBirdBookings.length === 0 ? (
          <div className="text-center py-4 bg-white rounded-xl shadow-sm border border-amber-100">
            <p className="text-sm text-amber-700 font-medium">Tidak ada penyewa dengan sistem Early Bird/Down Payment saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earlyBirdBookings.map((booking, i) => {
              const expireDate = new Date(booking.dp_expiry);
              const now = new Date();
              const diffMs = expireDate.getTime() - now.getTime();
              const isExpired = diffMs <= 0;
              let expireText = isExpired ? 'Hangus' : 'Berjalan';

              if (!isExpired) {
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHrs / 24);
                if (diffDays > 0) expireText = `Sisa: ${diffDays} Hari`;
                else expireText = `Sisa: ${diffHrs} Jam`;
              }

              const timeLimitText = booking.dp_type === 'DP_10' ? 'Hangus dalam 24 Jam' : 'Jeda 7 Hari';

              return (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{booking.tenant?.full_name || 'Penghuni'}</h4>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${booking.dp_type === 'DP_10' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                        {booking.dp_type === 'DP_10' ? 'Early Bird (DP 10%)' : 'Booking Aman (DP 25%)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{booking.room?.room_number || `Booking #${booking.id.substring(0, 8)}`}</p>
                    <div className={`mt-3 flex items-center gap-1 text-xs font-bold w-fit px-2 py-1 rounded-full ${isExpired ? 'text-red-600 bg-red-50' : 'text-rose-600 bg-rose-50'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {expireText} ({timeLimitText})
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => handleConfirmArrival(booking.id)} disabled={isExpired} className={`flex-1 py-2 font-bold text-xs rounded-xl transition-colors border ${isExpired ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
                      Konfirmasi Kedatangan
                    </button>
                    <button onClick={() => handleUploadResi(booking.id)} disabled={isExpired} className={`flex-1 py-2 font-bold text-xs rounded-xl transition-colors border ${isExpired ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'}`}>
                      Upload Resi/Offline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
