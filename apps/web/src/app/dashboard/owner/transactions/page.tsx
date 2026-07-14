"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { CreditCard, Calendar, User, Home, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/CountdownTimer';

export default function TransactionsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/bookings');
      setBookings(data);
    } catch (error: any) {
      toast.error('Gagal memuat transaksi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    if (type === 'DP_10') return <span className="px-1.5 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded text-[9px] font-bold border border-fuchsia-200">DP 10%</span>;
    if (type === 'DP_25') return <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold border border-indigo-200">DP 25%</span>;
    if (type === 'CUSTOM_DP') return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold border border-purple-200">DP</span>;
    return <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200">FULL</span>;
  };

  return (
    <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] min-h-[500px]">
      <div className="mb-8">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">Riwayat Transaksi</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">Pantau semua pembayaran dan penyewaan kamar kos Anda.</p>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
           <div className="text-center py-20 text-slate-400 font-bold flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             Memuat transaksi...
           </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-lg">Belum ada transaksi</p>
            <p className="text-slate-400 text-sm mt-1">Transaksi penyewaan kamar akan muncul di sini.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Home size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{booking.rooms?.properties?.name}</span>
                        <span className="text-xs font-medium text-slate-500">Kamar {booking.rooms?.room_number}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Penyewa</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <User size={12} className="text-slate-400" />
                        <span className="truncate">{booking.customer?.full_name || 'Tanpa Nama'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tanggal</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(booking.start_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl mt-2 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Total Pembayaran</span>
                        {getPaymentTypeBadge(booking.payment_type)}
                      </div>
                      <span className="font-black text-slate-800 text-sm">
                        {booking.payment_type !== 'FULL' ? formatRupiah(Number(booking.dp_amount)) : formatRupiah(Number(booking.total_price))}
                      </span>
                    </div>
                    {booking.payment_type !== 'FULL' && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] font-medium text-slate-400">Status Sisa Tagihan</span>
                        {booking.balance_paid ? (
                          <span className="text-xs font-bold text-emerald-500">Lunas</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">
                            Menunggu ({formatRupiah(Number(booking.total_price) - Number(booking.dp_amount))})
                          </span>
                        )}
                      </div>
                    )}
                    {booking.payment_type !== 'FULL' && !booking.balance_paid && booking.dp_expires_at && (
                      <div className="mt-1 flex justify-end">
                        <CountdownTimer expiresAt={booking.dp_expires_at} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="w-full text-left border-separate border-spacing-y-3 hidden md:table">
              <thead>
                <tr className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="pb-3 px-4">Info Kamar</th>
                  <th className="pb-3 px-4">Penyewa</th>
                  <th className="pb-3 px-4">Tanggal Sewa</th>
                  <th className="pb-3 px-4">Total</th>
                  <th className="pb-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-2xl group">
                    <td className="py-4 px-4 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                          <Home size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{booking.rooms?.properties?.name}</span>
                          <span className="text-xs font-medium text-slate-500">Kamar {booking.rooms?.room_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="font-bold text-sm text-slate-700">{booking.customer?.full_name || 'Tanpa Nama'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(booking.start_date)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-black text-slate-800">
                            {booking.payment_type !== 'FULL' ? formatRupiah(Number(booking.dp_amount)) : formatRupiah(Number(booking.total_price))}
                          </span>
                          {getPaymentTypeBadge(booking.payment_type)}
                        </div>
                        {booking.payment_type !== 'FULL' && (
                          <span className="text-[10px] font-medium text-slate-500">
                            {booking.balance_paid ? <span className="text-emerald-500">Sisa Lunas</span> : `Sisa: ${formatRupiah(Number(booking.total_price) - Number(booking.dp_amount))}`}
                          </span>
                        )}
                        {booking.payment_type !== 'FULL' && !booking.balance_paid && booking.dp_expires_at && (
                          <div className="mt-1">
                            <CountdownTimer expiresAt={booking.dp_expires_at} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 rounded-r-2xl">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
