"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownTimer } from '@/components/CountdownTimer';
import { 
  Building, 
  MapPin, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  LogOut, 
  CheckCircle, 
  X, 
  ArrowRight,
  User,
  Clock
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogout } from '@/hooks/useLogout';




export default function TenantDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const handleLogout = useLogout();

  // Payment simulator states
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isDepositPayment, setIsDepositPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUserProfile(profile);

      // Fetch bookings from NestJS API
      const bookingsData = await fetchWithAuth('/bookings');
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching tenant dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handlePaymentInit = (booking: any, isDeposit = false) => {
    setSelectedBooking(booking);
    setIsDepositPayment(isDeposit);
    setShowPaymentSimulator(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedBooking) return;

    try {
      if (isDepositPayment) {
        // Update deposit using Supabase directly for simplicity in simulation
        const depositAmount = getLowestPrice(selectedBooking.rooms?.properties); // Example: deposit = 1 month rent
        await supabase
          .from('bookings')
          .update({ 
            auto_renewal_deposit: depositAmount,
            auto_renewal_enabled: true 
          })
          .eq('id', selectedBooking.id);
      } else {
        if (selectedBooking.status === 'PAID' && selectedBooking.payment_type !== 'FULL' && !selectedBooking.balance_paid) {
          await fetchWithAuth('/payment/confirm-balance', {
            method: 'POST',
            body: JSON.stringify({ bookingId: selectedBooking.id })
          });
        } else {
          await fetchWithAuth('/payment/confirm', {
            method: 'POST',
            body: JSON.stringify({ bookingId: selectedBooking.id })
          });
        }
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentSimulator(false);
        setPaymentSuccess(false);
        setSelectedBooking(null);
        setIsDepositPayment(false);
        fetchData(); // Refresh bookings
      }, 2500);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      alert('Konfirmasi gagal: ' + error.message);
    }
  };

  const getLowestPrice = (property: any) => {
    if (!property || !property.rooms || property.rooms.length === 0) return 1000000;
    return Math.min(...property.rooms.map((r: any) => Number(r.price_per_month)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
        Memuat Dashboard Anda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-8 px-6 max-w-md mx-auto md:max-w-4xl">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Dashboard Penghuni</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Halo, {userProfile?.full_name || 'Teman KosKosanKu'}!
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 clay-card flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Bookings List */}
      <div className="space-y-6">
        <h2 className="text-lg font-black text-slate-800">Sewa & Booking Saya</h2>
        
        {bookings.length === 0 ? (
          <div className="clay-card p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500">
              <Building size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-bold text-base">Belum ada sewa aktif.</p>
              <p className="text-slate-400 text-xs mt-1">Ayo cari kosan impianmu dan pesan sekarang!</p>
            </div>
            <Link href="/search" className="inline-block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="clay-button bg-indigo-500 text-white text-xs py-2 px-6 shadow-md"
              >
                Cari Properti
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => {
              const room = booking.rooms || {};
              const property = room.properties || {};
              const isPaid = booking.status === 'PAID';

              return (
                <div 
                  key={booking.id}
                  className="clay-card p-6 bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      <Building size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-base leading-tight">
                        {property.name || 'Properti Kos'} - Kamar {room.room_number || 'A-01'}
                      </h3>
                      <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {property.address || 'Alamat properti'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span>Mulai: {new Date(booking.start_date).toLocaleDateString('id-ID')}</span>
                        </div>
                        {booking.end_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span>Selesai: {new Date(booking.end_date).toLocaleDateString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-4 md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        {booking.payment_type !== 'FULL' ? (booking.payment_type === 'DP_10' ? 'Pembayaran DP 10%' : 'Pembayaran DP 25%') : 'Total Pembayaran'}
                      </span>
                      <p className="text-base font-black text-slate-800">
                        {booking.payment_type !== 'FULL' ? formatRupiah(Number(booking.dp_amount)) : formatRupiah(Number(booking.total_price))}
                      </p>
                      {booking.payment_type !== 'FULL' && (
                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                          Sisa Pelunasan: {formatRupiah(Number(booking.total_price) - Number(booking.dp_amount))}
                        </p>
                      )}
                      {((booking.payment_type !== 'FULL' && booking.balance_paid) || (booking.payment_type === 'FULL' && isPaid)) ? (
                        <div className="mt-1 flex justify-end text-[10px] text-slate-500 font-bold">
                          Dilunasi: {new Date(booking.updated_at || booking.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        booking.payment_type !== 'FULL' && booking.dp_expires_at && (
                          <div className="mt-1 flex justify-end text-xs"><CountdownTimer expiresAt={booking.dp_expires_at} /></div>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${(booking.payment_type !== 'FULL' && booking.balance_paid) || (booking.payment_type === 'FULL' && isPaid) ? 'bg-emerald-100 text-emerald-600' : isPaid ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {((booking.payment_type !== 'FULL' && booking.balance_paid) || (booking.payment_type === 'FULL' && isPaid)) ? <CheckCircle size={12} /> : isPaid ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {((booking.payment_type !== 'FULL' && booking.balance_paid) || (booking.payment_type === 'FULL' && isPaid)) ? 'Lunas' : isPaid ? 'DP Terbayar' : 'Menunggu Pembayaran'}
                      </span>

                      {!isPaid && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePaymentInit(booking)}
                          className="clay-button bg-indigo-500 text-white text-xs !px-4 !py-2 shadow-md shadow-indigo-100 flex items-center gap-1"
                        >
                          Bayar <ArrowRight size={14} />
                        </motion.button>
                      )}

                      {isPaid && booking.payment_type !== 'FULL' && !booking.balance_paid && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePaymentInit(booking)}
                          className="clay-button bg-indigo-500 text-white text-xs !px-4 !py-2 shadow-md shadow-indigo-100 flex items-center gap-1"
                        >
                          Lunasi Sekarang <ArrowRight size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Auto-Renewal / Deposit Section */}
                  {isPaid && (
                    <div className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.auto_renewal_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">Deposit Jaminan (Auto-Renewal)</p>
                          <p className="text-[10px] font-medium text-slate-500">
                            {booking.auto_renewal_enabled 
                              ? `Aktif - Saldo: ${formatRupiah(Number(booking.auto_renewal_deposit))}`
                              : 'Tidak Aktif - Isi deposit untuk perpanjangan bulan depan.'}
                          </p>
                        </div>
                      </div>
                      {!booking.auto_renewal_enabled && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePaymentInit(booking, true)}
                          className="clay-button bg-orange-500 text-white text-xs !px-4 !py-2 shadow-md shadow-orange-100 whitespace-nowrap"
                        >
                          Isi Deposit & Aktifkan
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Simulator Popup */}
      <AnimatePresence>
        {showPaymentSimulator && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-sm rounded-[2rem] bg-slate-900 border border-slate-800 p-8 text-white relative shadow-2xl overflow-hidden"
            >
              {/* Glow decoration */}
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              {!paymentSuccess ? (
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                    <CreditCard size={28} className="text-indigo-400" />
                  </div>
                  
                  <h3 className="text-xl font-black mb-2">Simulasi Midtrans Snap</h3>
                  <p className="text-slate-400 text-xs px-2 mb-6">Integrasi Pembayaran Sandbox KosKosanKu</p>
                  
                  <div className="w-full bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-8 text-left">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">ID Transaksi</span>
                    <span className="text-xs font-mono break-all text-slate-300 block mb-3">{selectedBooking.id}</span>

                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      {isDepositPayment 
                        ? 'Top Up Deposit Auto-Renewal'
                        : selectedBooking.status === 'PAID' && selectedBooking.payment_type !== 'FULL' && !selectedBooking.balance_paid ? 'Pelunasan Tagihan' : 'Total Tagihan'}
                    </span>
                    <span className="text-lg font-black text-indigo-300">
                      {isDepositPayment
                        ? formatRupiah(getLowestPrice(selectedBooking.rooms?.properties))
                        : selectedBooking.status === 'PAID' && selectedBooking.payment_type !== 'FULL' && !selectedBooking.balance_paid
                          ? formatRupiah(Number(selectedBooking.total_price) - Number(selectedBooking.dp_amount))
                          : selectedBooking.payment_type !== 'FULL' ? formatRupiah(Number(selectedBooking.dp_amount)) : formatRupiah(Number(selectedBooking.total_price))}
                    </span>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={() => {
                        setShowPaymentSimulator(false);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 font-bold text-xs transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handlePaymentConfirm}
                      className="flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center text-center py-6">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6"
                  >
                    <CheckCircle size={40} className="text-emerald-400" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-black mb-2 text-emerald-400">Pembayaran Berhasil!</h3>
                  <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed">
                    Sewa kamar Kos Anda telah terkonfirmasi.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
