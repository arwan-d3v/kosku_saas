"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Heart,
  Share2,
  Calendar,
  X,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchWithAuth } from '@/lib/api-client';
import { getFacilityIcon } from '../../search/page';

export default function PublicPropertyDetails({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Booking states
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  
  // Payment states
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/public/properties/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch property');
        const data = await response.json();
        setProperty(data);
        
        // Auto select first available room
        const firstAvail = data.rooms?.find((r: any) => r.is_available);
        if (firstAvail) {
          setSelectedRoomId(firstAvail.id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [params.id]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Memuat data properti...</div>;
  }

  if (!property) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Properti tidak ditemukan.</div>;
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"];
  
  const roomsAvailable = property.rooms ? property.rooms.filter((r: any) => r.is_available) : [];
  
  const selectedRoom = property.rooms?.find((r: any) => r.id === selectedRoomId);
  const lowestPrice = roomsAvailable.length > 0 
    ? Math.min(...roomsAvailable.map((r: any) => Number(r.price_per_month))) 
    : 0;

  const lowestPrice = roomsAvailable.length > 0 
    ? Math.min(...roomsAvailable.map((r: any) => Number(r.price_per_month))) 
    : 0;

  // Colors for icons dynamically assigned based on index
  const bgColors = ["bg-blue-50", "bg-cyan-50", "bg-indigo-50", "bg-emerald-50", "bg-amber-50"];
  const textColors = ["text-blue-500", "text-cyan-500", "text-indigo-500", "text-emerald-500", "text-amber-500"];

  const handleBookingInit = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Set default date as today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !startDate) return;

    try {
      setSubmittingBooking(true);
      
      // Calculate end date based on duration
      const start = new Date(startDate);
      const end = new Date(start.setMonth(start.getMonth() + durationMonths));
      const endDateStr = end.toISOString().split('T')[0];

      // 1. Create Booking in NestJS API
      const booking = await fetchWithAuth('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomId: selectedRoomId,
          startDate,
          endDate: endDateStr
        })
      });

      setCreatedBookingId(booking.id);

      // 2. Request Payment Checkout Token
      const checkoutRes = await fetchWithAuth('/payment/checkout', {
        method: 'POST',
        body: JSON.stringify({ bookingId: booking.id })
      });

      setPaymentToken(checkoutRes.token);
      setIsBookingModalOpen(false);
      setShowPaymentSimulator(true);
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert('Gagal memproses pesanan: ' + error.message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!createdBookingId) return;

    try {
      // Confirm Payment
      await fetchWithAuth('/payment/confirm', {
        method: 'POST',
        body: JSON.stringify({ bookingId: createdBookingId })
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentSimulator(false);
        router.push('/dashboard/tenant');
      }, 2500);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      alert('Konfirmasi pembayaran gagal: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-12 max-w-md mx-auto md:max-w-4xl bg-white shadow-xl shadow-slate-200/50">
      
      {/* 1. Header Image Carousel */}
      <div className="relative w-full h-[350px] md:h-[450px]">
        {/* Floating Back Button */}
        <Link href="/search" className="absolute top-6 left-4 z-10 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-slate-900 border border-white/40 shadow-sm">
          <ChevronLeft size={24} />
        </Link>

        {/* Floating Action Buttons */}
        <div className="absolute top-6 right-4 z-10 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-slate-900 border border-white/40 shadow-sm">
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-slate-900 border border-white/40 shadow-sm"
          >
            <Heart size={18} className={`transition-colors ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Main Image */}
        <img 
          src={images[0]} 
          alt="Property" 
          className="w-full h-full object-cover rounded-b-[2.5rem] shadow-sm"
        />

        <div className="absolute bottom-6 right-6 bg-slate-900/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
          1 / {images.length} Foto
        </div>
      </div>

      {/* 2. Title & Highlight Section */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
            {property.name}
          </h1>
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            <span className="text-sm font-bold">4.8</span>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mb-4">
          <MapPin size={16} className="text-slate-400" />
          {property.address}, {property.city}
        </p>

        {/* KosLock Badge & Rooms Left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100/50">
            <ShieldCheck size={14} />
            KosLock™ Supported
          </div>
          {roomsAvailable.length <= 3 && roomsAvailable.length > 0 && (
            <div className="text-rose-500 text-xs font-black animate-pulse">
              🔥 Sisa {roomsAvailable.length} Kamar - Cepat Pesan!
            </div>
          )}
          {roomsAvailable.length === 0 && (
            <div className="text-rose-500 text-xs font-black">
              Kamar Penuh
            </div>
          )}
        </div>
      </div>

      <hr className="mx-6 border-slate-100 my-4" />

      {/* Room Selection Section */}
      <div className="px-6 py-2">
        <h3 className="text-lg font-black text-slate-800 mb-3">Pilih Nomor Kamar</h3>
        {roomsAvailable.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium">Semua kamar terisi penuh.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {property.rooms?.map((room: any) => (
              <button
                key={room.id}
                disabled={!room.is_available}
                onClick={() => setSelectedRoomId(room.id)}
                className={`py-3 rounded-2xl font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                  !room.is_available 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : selectedRoomId === room.id
                    ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs uppercase tracking-wider">Kamar</span>
                <span className="text-lg font-black">{room.room_number}</span>
                <span className="text-[10px] font-medium block mt-0.5">
                  {room.is_available ? formatRupiah(Number(room.price_per_month)) : 'Penuh'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <hr className="mx-6 border-slate-100 my-4" />

      {/* 3. Fasilitas */}
      <div className="px-6 py-2">
        <h3 className="text-lg font-black text-slate-800 mb-4">Fasilitas Unggulan</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {property.facilities && property.facilities.length > 0 ? (
            property.facilities.map((fas: string, idx: number) => (
              <div 
                key={idx} 
                className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${bgColors[idx % bgColors.length]} ${textColors[idx % textColors.length]} rounded-full flex items-center justify-center mb-2`}>
                  {getFacilityIcon(fas, 20)}
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center px-1 leading-tight">{fas}</span>
              </div>
            ))
          ) : (
            <p className="text-sm font-medium text-slate-400 italic">Belum ada data fasilitas</p>
          )}
        </div>
      </div>

      <hr className="mx-6 border-slate-100 my-4" />
      
      {/* Description Section */}
      <div className="px-6 pb-10">
        <h3 className="text-lg font-black text-slate-800 mb-3">Tentang Kosan Ini</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {property.description || "Kosan nyaman, strategis, dan aman."}
        </p>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 md:flex md:justify-center pointer-events-none">
        <div className="w-full max-w-md md:max-w-4xl bg-white/85 backdrop-blur-xl border-t border-slate-200/60 p-4 md:px-8 pb-safe pointer-events-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mulai dari</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-black text-slate-800">
                  {formatRupiah(selectedRoom ? Number(selectedRoom.price_per_month) : lowestPrice)}
                </span>
                <span className="text-xs font-bold text-slate-500">/Bulan</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookingInit}
              disabled={roomsAvailable.length === 0}
              className={`clay-button font-bold px-8 py-3.5 shadow-lg text-sm pointer-events-auto ${roomsAvailable.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/30'}`}
            >
              {roomsAvailable.length === 0 ? 'Penuh' : 'Pesan Sekarang'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="clay-card w-full max-w-md p-8 relative bg-white/95"
            >
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-indigo-500" /> Atur Pesanan
              </h2>

              <form onSubmit={handleCreateBooking} className="space-y-5">
                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Nomor Kamar Dipilih</label>
                  <div className="px-4 py-3 bg-indigo-50 text-indigo-700 font-black rounded-2xl border border-indigo-100 flex justify-between items-center">
                    <span>Kamar {selectedRoom?.room_number}</span>
                    <span>{formatRupiah(Number(selectedRoom?.price_per_month))} / Bln</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Tanggal Mulai Sewa</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Durasi Sewa</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMonths(m)}
                        className={`py-2 rounded-xl font-bold border transition-all text-xs text-center ${
                          durationMonths === m
                            ? 'bg-indigo-500 text-white border-transparent'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {m} Bln
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Sewa Kamar ({durationMonths} Bulan)</span>
                    <span>{formatRupiah(Number(selectedRoom?.price_per_month) * durationMonths)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Biaya Platform (Admin)</span>
                    <span>Rp 10.000</span>
                  </div>
                  <hr className="border-slate-200/50" />
                  <div className="flex justify-between text-sm text-slate-800 font-black">
                    <span>Total Bayar</span>
                    <span>{formatRupiah((Number(selectedRoom?.price_per_month) * durationMonths) + 10000)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submittingBooking}
                  className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {submittingBooking ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Simulator Popup */}
      <AnimatePresence>
        {showPaymentSimulator && (
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
                  <p className="text-slate-400 text-xs px-2 mb-6">Integrasi Pembayaran Sandbox KosanKita</p>
                  
                  <div className="w-full bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-8 text-left">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Token Pembayaran</span>
                    <span className="text-xs font-mono break-all text-slate-300 block mb-3">{paymentToken}</span>

                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Total Tagihan</span>
                    <span className="text-lg font-black text-indigo-300">
                      {formatRupiah((Number(selectedRoom?.price_per_month) * durationMonths) + 10000)}
                    </span>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={() => setShowPaymentSimulator(false)}
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
                    Sewa kamar Kos Anda telah terkonfirmasi. Mengalihkan Anda ke Dashboard...
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
