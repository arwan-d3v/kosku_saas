"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownTimer } from '@/components/CountdownTimer';
import { 
  Building, 
  MapPin, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  LogOut, 
  CheckCircle, 
  ArrowRight,
  Wallet,
  ShieldCheck,
  History,
  Printer
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogout } from '@/hooks/useLogout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TenantDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const handleLogout = useLogout();

  // Advanced Stats
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);

  // Payment & Deposit Modal states
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Custom Deposit states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  
  // Dummy data for Expense Chart to simulate advanced view
  const expenseData = [
    { name: 'Feb', amount: 1500000 },
    { name: 'Mar', amount: 1500000 },
    { name: 'Apr', amount: 1650000 },
    { name: 'Mei', amount: 1500000 },
    { name: 'Jun', amount: 2000000 },
    { name: 'Jul', amount: 1500000 },
  ];

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

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUserProfile(profile);

      const bookingsData = await fetchWithAuth('/bookings');
      setBookings(bookingsData);

      // Calculate Stats
      let spent = 0;
      let active = 0;
      let deposit = 0;

      bookingsData.forEach((b: any) => {
        if (b.status === 'PAID') {
          spent += Number(b.total_price);
          if (b.auto_renewal_enabled) {
            deposit += Number(b.auto_renewal_deposit);
          }
          // Assuming paid means active for simplicity, or check end_date > now
          active += 1; 
        }
      });

      setTotalSpent(spent);
      setActiveRentals(active);
      setTotalDeposit(deposit);

    } catch (error) {
      console.error('Error fetching tenant dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentInit = (booking: any) => {
    setSelectedBooking(booking);
    setShowPaymentSimulator(true);
  };

  const handleDepositInit = (booking: any) => {
    setSelectedBooking(booking);
    setDepositAmountInput('');
    setDepositError('');
    setShowDepositModal(true);
  };

  const handleDepositSubmit = () => {
    const amount = Number(depositAmountInput.replace(/\D/g, ''));
    if (amount < 500000) {
      setDepositError('Minimal nominal deposit adalah Rp 500.000');
      return;
    }
    
    setDepositError('');
    setShowDepositModal(false);
    
    // Pass custom amount to simulator implicitly via state
    setIsProcessingDeposit(true); 
    setShowPaymentSimulator(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedBooking) return;

    try {
      if (isProcessingDeposit) {
        const depositAmount = Number(depositAmountInput.replace(/\D/g, ''));
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
        setIsProcessingDeposit(false);
        fetchData();
      }, 2500);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      alert('Konfirmasi gagal: ' + error.message);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
        Memuat Dashboard Anda...
      </div>
    );
  }

  const stats = [
    { label: 'Total Pengeluaran Kos', value: formatRupiah(totalSpent), icon: <Wallet size={24} className="text-blue-600" />, trend: 'Akumulasi', color: 'bg-blue-50' },
    { label: 'Kosan Aktif', value: activeRentals, icon: <Building size={24} className="text-indigo-600" />, trend: 'Saat ini', color: 'bg-indigo-50' },
    { label: 'Total Deposit Jaminan', value: formatRupiah(totalDeposit), icon: <ShieldCheck size={24} className="text-emerald-600" />, trend: 'Aman', color: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-8 px-6 max-w-md mx-auto md:max-w-5xl">
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 hide-on-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Analytics Penyewa</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Halo, {userProfile?.full_name || 'Penghuni'}! Berikut adalah ringkasan sewa Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-colors"
          >
            <Printer size={16} /> Cetak Laporan
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Laporan Sewa KosKosanKu</h1>
        <p className="text-sm text-slate-500">Penyewa: {userProfile?.full_name || 'Penghuni'} | Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg text-xs font-bold border border-slate-100">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Chart & Booking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area: Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
             Properti Yang Disewa
          </h2>
          
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500 mb-4">
                <Building size={28} />
              </div>
              <p className="text-slate-800 font-bold text-lg mb-1">Belum ada sewa aktif.</p>
              <p className="text-slate-500 text-sm mb-6">Ayo temukan kosan impianmu dan pesan sekarang!</p>
              <Link href="/search">
                <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition">
                  Cari Kos Sekarang
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const room = booking.rooms || {};
                const property = room.properties || {};
                const isPaid = booking.status === 'PAID';

                return (
                  <div key={booking.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] print:border-slate-300 print:shadow-none print:break-inside-avoid">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Building size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-lg leading-tight">
                            {property.name || 'Properti Kos'} <span className="text-indigo-600">- Kamar {room.room_number || 'A-01'}</span>
                          </h3>
                          <p className="text-slate-500 text-xs font-medium flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {property.address || 'Alamat properti'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-left md:text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black ${isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {isPaid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {isPaid ? 'Pembayaran Selesai' : 'Menunggu Pembayaran'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Tagihan</p>
                        <p className="font-black text-slate-700">{formatRupiah(Number(booking.total_price))}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tipe Pembayaran</p>
                        <p className="font-bold text-slate-700 text-sm mt-0.5">{booking.payment_type === 'FULL' ? 'Lunas (Full)' : booking.payment_type === 'DP_10' ? 'DP 10% (Early)' : 'DP 25% (Aman)'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Periode Masuk</p>
                        <p className="font-bold text-slate-700 text-sm mt-0.5">{new Date(booking.start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        {booking.payment_type !== 'FULL' && !booking.balance_paid && isPaid ? (
                          <>
                            <p className="text-[10px] text-rose-400 font-bold uppercase mb-1">Kekurangan</p>
                            <p className="font-black text-rose-600">{formatRupiah(Number(booking.total_price) - Number(booking.dp_amount))}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Status Lunas</p>
                            <p className="font-black text-emerald-600 text-sm mt-0.5">Sudah Lunas</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions and Deposit Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      
                      {/* Deposit Status / Action */}
                      {isPaid ? (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${booking.auto_renewal_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">Deposit Jaminan</p>
                            <p className="text-[10px] font-bold text-slate-500">
                              {booking.auto_renewal_enabled 
                                ? `Aktif: ${formatRupiah(Number(booking.auto_renewal_deposit))}`
                                : 'Tidak Aktif (Isi untuk perpanjangan)'}
                            </p>
                          </div>
                          {!booking.auto_renewal_enabled && (
                            <button
                              onClick={() => handleDepositInit(booking)}
                              className="ml-auto md:ml-4 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                            >
                              Isi Deposit
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full md:w-auto text-xs font-bold text-amber-600 flex items-center gap-2">
                           Selesaikan pembayaran awal untuk mengaktifkan deposit.
                        </div>
                      )}

                      {/* Payment Actions */}
                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 hide-on-print">
                        {!isPaid && (
                          <button
                            onClick={() => handlePaymentInit(booking)}
                            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 text-sm"
                          >
                            Bayar DP <ArrowRight size={16} />
                          </button>
                        )}
                        {isPaid && booking.payment_type !== 'FULL' && !booking.balance_paid && (
                          <button
                            onClick={() => handlePaymentInit(booking)}
                            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 text-sm"
                          >
                            Lunasi Sisa Tagihan <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar area: Chart & Additional Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-6">
              <History size={18} className="text-indigo-500" /> Riwayat Pengeluaran
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `Rp${val/1000000}M`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden hide-on-print">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
             <h3 className="font-black text-lg mb-2 relative z-10">Bebas Pusing Perpanjang!</h3>
             <p className="text-indigo-100 text-sm font-medium mb-4 relative z-10 leading-relaxed">
               Gunakan fitur Deposit Jaminan agar kamar kos Anda otomatis diperpanjang setiap bulannya tanpa takut disewa orang lain.
             </p>
             <button className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl text-xs relative z-10 shadow-sm hover:shadow-md transition">
               Pelajari Selengkapnya
             </button>
          </div>
        </div>

      </div>


      {/* Custom Deposit Input Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-[2rem] bg-white border border-slate-200 p-8 shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-center text-slate-800 mb-2">Top Up Deposit Jaminan</h3>
              <p className="text-slate-500 text-xs text-center px-2 mb-6 font-medium leading-relaxed">
                Amankan perpanjangan kamar Anda. Minimal deposit yang diwajibkan adalah <span className="font-bold text-slate-700">Rp 500.000</span>.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nominal Deposit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                  <input 
                    type="text" 
                    placeholder="500.000"
                    value={depositAmountInput}
                    onChange={(e) => {
                      // Allow only numbers and format with dots
                      const val = e.target.value.replace(/\D/g, '');
                      setDepositAmountInput(new Intl.NumberFormat('id-ID').format(Number(val)));
                      if (depositError) setDepositError('');
                    }}
                    className={`w-full bg-slate-50 border ${depositError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} rounded-2xl py-3 pl-12 pr-4 font-black text-slate-700 text-lg outline-none transition focus:ring-4`}
                  />
                </div>
                {depositError && (
                  <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {depositError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-bold text-sm transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDepositSubmit}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20"
                >
                  Lanjut Bayar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Simulator Popup */}
      <AnimatePresence>
        {showPaymentSimulator && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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
                  <p className="text-slate-400 text-xs px-2 mb-6 font-medium">Integrasi Pembayaran Sandbox KosKosanKu</p>
                  
                  <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mb-8 text-left backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">ID Transaksi</span>
                    <span className="text-xs font-mono break-all text-slate-300 block mb-4">{selectedBooking.id}</span>

                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      {isProcessingDeposit 
                        ? 'Top Up Deposit Auto-Renewal'
                        : selectedBooking.status === 'PAID' && selectedBooking.payment_type !== 'FULL' && !selectedBooking.balance_paid ? 'Pelunasan Tagihan' : 'Total Tagihan Awal'}
                    </span>
                    <span className="text-2xl font-black text-indigo-300">
                      {isProcessingDeposit
                        ? formatRupiah(Number(depositAmountInput.replace(/\D/g, '')))
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
                        setIsProcessingDeposit(false);
                      }}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-bold text-sm transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handlePaymentConfirm}
                      className="flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
                    >
                      Bayar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center text-center py-8">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6"
                  >
                    <CheckCircle size={40} className="text-emerald-400" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-black mb-2 text-emerald-400">Pembayaran Berhasil!</h3>
                  <p className="text-slate-400 text-sm font-medium">
                    {isProcessingDeposit ? 'Deposit Anda telah ditambahkan.' : 'Transaksi telah terkonfirmasi.'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:m-0, .print\\:m-0 * {
            visibility: visible;
          }
          .print\\:block {
            display: block !important;
          }
          .hide-on-print {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto;
          }
          .pb-28 {
            padding-bottom: 0;
          }
          .pt-8 {
            padding-top: 0;
          }
          #root, body, html {
            background-color: white !important;
          }
          
          /* Target specific elements by structure for printing */
          .max-w-md, .max-w-5xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Make all cards visible for print */
          .bg-white, .bg-slate-50, .shadow-\\[0_2px_10px_rgba\\(0\\,0\\,0\\,0\\.04\\)\\] {
            visibility: visible !important;
          }
          
          /* Specifically show the stats and charts */
          .grid, .grid *, table, table *, .recharts-wrapper, .recharts-wrapper * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
