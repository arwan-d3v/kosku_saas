"use client";

import React, { useState, useEffect } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Home, DoorOpen, Wallet, ArrowUpRight, TrendingUp, Users, Printer, ShieldCheck, Activity } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function OwnerDashboard() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [earlyBirdBookings, setEarlyBirdBookings] = useState<any[]>([]);
  const [activeTenants, setActiveTenants] = useState<any[]>([]);

  // Dual-line chart data (Growth vs Rentals)
  const performanceData = [
    { name: 'Jan', revenue: 4500000, rentals: 4 },
    { name: 'Feb', revenue: 5200000, rentals: 5 },
    { name: 'Mar', revenue: 4800000, rentals: 4 },
    { name: 'Apr', revenue: 6100000, rentals: 7 },
    { name: 'Mei', revenue: 5900000, rentals: 6 },
    { name: 'Jun', revenue: 7200000, rentals: 9 },
    { name: 'Jul', revenue: 8500000, rentals: 11 },
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

  const handlePrint = () => {
    window.print();
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

      // Filter early bird bookings
      const ebBookings = bookings.filter((b: any) =>
        (b.payment_type === 'DP_10' || b.payment_type === 'DP_25') &&
        b.status === 'PAID'
      );
      setEarlyBirdBookings(ebBookings);

      // Filter active tenants
      const active = bookings.filter((b: any) => b.status === 'PAID');
      setActiveTenants(active);

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
    <div className="space-y-6 print:m-0 print:p-0">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 hide-on-print">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Ringkasan Bisnis</h1>
          <p className="text-sm text-slate-500 font-medium">Pantau performa properti Anda secara real-time</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-colors"
        >
          <Printer size={16} /> Cetak Laporan
        </button>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Laporan Analisis Properti KosKosanKu</h1>
        <p className="text-sm text-slate-500">Dicetak pada: {new Date().toLocaleDateString('id-ID')} | Periode: YTD</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] print:border-slate-300 print:shadow-none">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.color} print:bg-slate-100 rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 print:bg-transparent print:border print:border-emerald-200 px-2 py-1 rounded-lg text-xs font-bold">
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
        {/* Dual Line Chart (Revenue vs Rentals) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] lg:col-span-2 print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" /> Analitik Pertumbuhan
              </h3>
              <p className="text-xs text-slate-500">Perbandingan Pendapatan & Volume Rental</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `Rp${val/1000000}M`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatRupiah(Number(value) || 0) : value, 
                    name === 'revenue' ? 'Pendapatan' : 'Jumlah Rental'
                  ]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Pendapatan" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="rentals" name="Jumlah Rental" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] print:border-slate-300 print:shadow-none">
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="penuh" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} name="Terisi" barSize={32} />
                <Bar dataKey="kosong" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Kosong" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Tenants with Deposit Flags */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] print:border-slate-300 print:shadow-none mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Users size={18} className="text-indigo-500" /> Daftar Penghuni Aktif
        </h3>
        
        {activeTenants.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 font-medium">Belum ada penghuni aktif.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Penghuni</th>
                  <th className="px-4 py-3">Kamar</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3 rounded-r-lg">Status & Jaminan</th>
                </tr>
              </thead>
              <tbody>
                {activeTenants.map((booking, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                    <td className="px-4 py-4 font-bold text-slate-800">{booking.customer?.full_name || 'Penghuni'}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{booking.rooms?.room_number || `Booking #${booking.id.substring(0, 8)}`}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">
                      {new Date(booking.start_date).toLocaleDateString('id-ID')} - {booking.end_date ? new Date(booking.end_date).toLocaleDateString('id-ID') : 'Ongoing'}
                    </td>
                    <td className="px-4 py-4">
                      {booking.auto_renewal_enabled ? (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          <ShieldCheck size={14} /> Auto-Renewal Aktif: {formatRupiah(Number(booking.auto_renewal_deposit))}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Tidak Ada Jaminan
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:m-0, .print\\:m-0 * {
            visibility: visible;
          }
          .print\\:m-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .hide-on-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
