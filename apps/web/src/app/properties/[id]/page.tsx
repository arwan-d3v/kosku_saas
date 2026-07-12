"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Wifi, 
  Wind, 
  Bed, 
  Bath, 
  Sofa,
  Coffee,
  Share2,
  Heart
} from 'lucide-react';
import Link from 'next/link';

export default function PublicPropertyDetails({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchProperty = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/public/properties/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch property');
        const data = await response.json();
        setProperty(data);
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

  // Derive data from API response
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"];
  
  // Basic derived logic
  const roomsAvailable = property.rooms ? property.rooms.filter((r: any) => r.is_available).length : 0;
  // Calculate lowest price
  const lowestPrice = property.rooms && property.rooms.length > 0 
    ? Math.min(...property.rooms.map((r: any) => Number(r.price_per_month))) 
    : 0;

  // Dummy facilities (can be mapped from db if supported)
  const facilities = [
    { name: "Super WiFi", icon: <Wifi size={20} />, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "AC Dingin", icon: <Wind size={20} />, color: "text-cyan-500", bg: "bg-cyan-50" },
    { name: "Kasur Empuk", icon: <Bed size={20} />, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-0 relative max-w-md mx-auto md:max-w-full bg-white shadow-xl shadow-slate-200/50">
      
      {/* 1. Header Image Carousel (KosView) */}
      <div className="relative w-full h-[350px] md:h-[450px]">
        {/* Floating Back Button */}
        <Link href="/" className="absolute top-6 left-4 z-10 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-slate-900 border border-white/40 shadow-sm">
          <ChevronLeft size={24} />
        </Link>

        {/* Floating Action Buttons Right */}
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

        {/* Image Indicator Badge */}
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
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            <span className="text-sm font-bold">4.8</span>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mb-4">
          <MapPin size={16} className="text-slate-400" />
          {property.address}
        </p>

        {/* KosLock Badge & Rooms Left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100/50">
            <ShieldCheck size={14} />
            KosLock™ Supported
          </div>
          {roomsAvailable <= 3 && roomsAvailable > 0 && (
            <div className="text-rose-500 text-xs font-black animate-pulse">
              🔥 Sisa {roomsAvailable} Kamar - Cepat Pesan!
            </div>
          )}
          {roomsAvailable === 0 && (
            <div className="text-rose-500 text-xs font-black">
              Kamar Penuh
            </div>
          )}
        </div>
      </div>

      <hr className="mx-6 border-slate-100 my-4" />

      {/* 3. Fasilitas (KosFas) Horizontal Scroll */}
      <div className="px-6 py-2">
        <h3 className="text-lg font-black text-slate-800 mb-4">Fasilitas Unggulan</h3>
        
        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {facilities.map((fas, idx) => (
            <motion.div 
              whileTap={{ scale: 0.95 }}
              key={idx} 
              className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${fas.bg} ${fas.color} rounded-full flex items-center justify-center mb-2`}>
                {fas.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-600 text-center px-1 leading-tight">{fas.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <hr className="mx-6 border-slate-100 my-4" />
      
      {/* Description Section (Bonus) */}
      <div className="px-6 pb-10">
        <h3 className="text-lg font-black text-slate-800 mb-3">Tentang Kosan Ini</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {property.description || "Kosan nyaman, strategis, dan aman."}
        </p>
        <button className="text-indigo-600 font-bold text-sm mt-2">Baca Selengkapnya</button>
      </div>

      {/* Extra space for desktop view to avoid overlapping with absolute bottom bar */}
      <div className="hidden md:block h-32"></div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:flex md:justify-center pointer-events-none">
        <div className="w-full max-w-md md:max-w-full bg-white/80 backdrop-blur-xl border-t border-slate-200/60 p-4 md:px-8 pb-safe pointer-events-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mulai dari</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-black text-slate-800">{formatRupiah(lowestPrice)}</span>
                <span className="text-xs font-bold text-slate-500">/Bulan</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={roomsAvailable === 0}
              className={`clay-button font-bold px-8 py-3.5 shadow-lg text-sm ${roomsAvailable === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/30'}`}
            >
              {roomsAvailable === 0 ? 'Penuh' : 'Pesan Sekarang'}
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
}
