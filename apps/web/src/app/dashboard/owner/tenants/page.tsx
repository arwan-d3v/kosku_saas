"use client";

import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertCircle, CheckCircle2, MessageCircle, MapPin, Building } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

export default function TenantManagementPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/bookings');
      // Sort bookings by creation date or status (e.g. pending first)
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-600 flex items-center gap-1 w-max"><CheckCircle2 size={12} /> AKTIF</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-600 flex items-center gap-1 w-max"><AlertCircle size={12} /> BELUM LUNAS</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-600 w-max">BATAL</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 w-max">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="text-blue-600" /> Manajemen Penghuni
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Pantau status penyewa, tagihan, dan batas waktu sewa.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-lg text-slate-800">Semua</button>
             <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Aktif</button>
             <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Belum Lunas</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
               Memuat data penghuni...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              Belum ada penyewa atau booking yang masuk.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 px-4">Informasi Penyewa</th>
                  <th className="pb-4 px-4">Properti & Kamar</th>
                  <th className="pb-4 px-4">Masa Sewa</th>
                  <th className="pb-4 px-4">Status & Tagihan</th>
                  <th className="pb-4 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.customer_id}`} alt="avatar" />
                        </div>
                        <div>
                           {/* Assuming customer has email, if not fallback to ID slice */}
                           <p className="font-bold text-slate-800 text-sm">{booking.customer?.email?.split('@')[0] || `User ${booking.customer_id.substring(0,5)}`}</p>
                           <p className="text-[10px] text-slate-400 font-mono">{booking.customer_id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                       <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-700 text-sm flex items-center gap-1"><Building size={14} className="text-indigo-500"/> {booking.rooms?.properties?.name}</span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><MapPin size={12} className="text-slate-400"/> Kamar {booking.rooms?.room_number}</span>
                       </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-600 font-semibold flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> {new Date(booking.start_date).toLocaleDateString('id-ID')}</span>
                        {booking.end_date && (
                          <span className="text-slate-400">s/d {new Date(booking.end_date).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs font-black text-slate-700">{formatCurrency(booking.total_price)}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp Button logic could go here */}
                        <button className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-white transition flex items-center gap-1.5">
                          <MessageCircle size={14} /> Tagih
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
