"use client";

import React, { useState, useEffect } from 'react';
import { Search, Home, User, ShieldCheck, MapPin, Building, Bookmark, History, CreditCard, HeadphonesIcon, Menu } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'CUSTOMER');
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    };
    checkUser();
  }, []);

  const menuItems = [
    { label: 'Cari Kos', icon: <Search className="text-blue-500" size={28} />, href: '/search' },
    { label: 'Kos Sekitar', icon: <MapPin className="text-teal-500" size={28} />, href: '/search?nearby=true' },
    { label: 'Kos Saya', icon: <Building className="text-indigo-500" size={28} />, href: '/dashboard/tenant' },
    { label: 'Favorit', icon: <Bookmark className="text-purple-500" size={28} />, href: '/dashboard/tenant' },
    { label: 'Transaksi', icon: <CreditCard className="text-emerald-500" size={28} />, href: '/dashboard/tenant' },
    { label: 'Bantuan', icon: <HeadphonesIcon className="text-orange-500" size={28} />, href: '#' },
  ];

  const cities = ['Bandung', 'Jakarta Pusat', 'Yogyakarta', 'Surabaya', 'Malang', 'Semarang', 'Bali'];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 font-sans overflow-x-hidden">
      {/* Desktop Top Navbar (Hidden on Mobile) */}
      <nav className="hidden md:flex bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] px-8 py-4 items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black flex items-center gap-1.5 text-blue-600">
            KosKu <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
          </Link>
          
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-sm font-medium w-64 hover:bg-slate-200 transition cursor-text">
              <Search size={16} />
              <input type="text" placeholder="Cari kos di Jakarta..." className="bg-transparent outline-none w-full placeholder-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-bold text-slate-700">
          <Link href="/search" className="hover:text-blue-600 transition">Sewa Kos</Link>
          <Link href="/dashboard/owner" className="hover:text-blue-600 transition">Mitra KosKu</Link>
          <Link href="#" className="hover:text-blue-600 transition">Bantuan</Link>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            {isAuthenticated ? (
              <Link href={role === 'TENANT_ADMIN' || role === 'SUPERADMIN' ? '/dashboard/owner' : '/dashboard/tenant'}>
                <button className="px-5 py-2 rounded-full text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition flex items-center gap-2">
                  <User size={16} strokeWidth={3} /> Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-5 py-2 text-blue-600 border-2 border-transparent hover:bg-blue-50 transition rounded-full">Login</button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md shadow-blue-500/20">Register</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Blue Header Section (Hidden on Desktop) */}
      <div className="md:hidden bg-blue-600 text-white pt-6 pb-28 px-5 rounded-b-[40px] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-10 right-0 opacity-10">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M45.5 -25.5C124.5 -55.5 187.5 10 216 67.5C244.5 125 187.5 198 123 214C58.5 230 -25.5 181 -61.5 116.5C-97.5 52 -33.5 4.5 45.5 -25.5Z" fill="white"/>
          </svg>
        </div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-1.5">
            KosKu <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
          </Link>
          <div className="flex gap-4">
             {isAuthenticated ? (
               <Link href={role === 'TENANT_ADMIN' || role === 'SUPERADMIN' ? '/dashboard/owner' : '/dashboard/tenant'} className="text-sm font-semibold tracking-wide flex items-center gap-1">
                 <User size={16} /> AKUN
               </Link>
             ) : (
               <Link href="/login" className="text-sm font-semibold tracking-wide">
                 MASUK
               </Link>
             )}
          </div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-[70%]">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2 py-1 rounded-md mb-3 border border-white/30 backdrop-blur-sm">
              <ShieldCheck size={14} /> Terverifikasi
            </div>
            <h2 className="text-[22px] font-bold leading-snug mb-2">
              Pilihan Kos Terbaik <br/> di Sekitar Kampus
            </h2>
            <p className="text-sm opacity-90 mb-5 font-medium">Mulai dari Rp 500.000 / bulan</p>
            <div className="text-xs border border-white/30 rounded-full px-2.5 py-1 inline-block">1/3</div>
          </div>
        </div>
        
        <div className="absolute bottom-6 right-5 text-xs font-medium bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-black/30 transition hidden">
          {/* Promo button removed */}
        </div>
      </div>

      {/* Main Menu Grid Section (Responsive Overlap) */}
      <div className="px-4 -mt-14 relative z-20 md:mt-10 md:max-w-7xl md:mx-auto">
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] md:bg-transparent md:border-none md:shadow-none md:p-0">
          <h3 className="text-lg md:text-2xl font-bold text-slate-800 mb-5 md:mb-8 text-center md:text-left">Hey kamu, mau ke mana?</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {menuItems.map((item, idx) => (
              <Link href={item.href} key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] active:scale-95 transition-transform hover:border-blue-100 hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.1)]">
                 {item.icon}
                 <span className="text-[11px] md:text-sm font-semibold text-slate-700 text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Kos Section */}
      <div className="px-4 mt-8 md:mt-16 md:max-w-7xl md:mx-auto">
        <h2 className="text-lg md:text-[22px] font-bold text-slate-800 mb-4">Rekomendasi Kos Populer</h2>
        
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {cities.map((city, idx) => (
            <button key={idx} className={`snap-start whitespace-nowrap px-4 py-1.5 md:py-2 md:px-5 rounded-full border text-xs md:text-sm font-semibold transition ${idx === 0 ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}>
              {city}
            </button>
          ))}
        </div>

        {/* Property Horizontal List */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 hide-scrollbar snap-x">
          {[1, 2, 3, 4, 5, 6].map((_, idx) => (
            <div key={idx} className="min-w-[220px] md:min-w-[280px] bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden snap-start group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="h-32 md:h-40 bg-slate-200 relative overflow-hidden">
                {/* Simulated Image Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-teal-200 group-hover:scale-105 transition-transform duration-500"></div>
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">Sisa 1 kamar</div>
              </div>
              <div className="p-3 md:p-4">
                <h4 className="font-bold text-sm md:text-base text-slate-800 mb-1 line-clamp-1">Kos Andalan Eksekutif {idx+1}</h4>
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mb-3">
                  <MapPin size={12} className="text-slate-400" />
                  <span>Cidadap, Bandung</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs font-bold text-yellow-500">4.7/5</span>
                  <span className="text-[10px] text-slate-400">(2,857)</span>
                </div>
                <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 line-through">Rp 1.500.000</p>
                    <p className="text-sm md:text-base font-black text-orange-600">Rp 1.200.000</p>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 mb-0.5">/ bln</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
