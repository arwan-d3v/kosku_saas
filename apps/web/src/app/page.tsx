"use client";

import React, { useState, useEffect } from 'react';
import { Search, Home, User, ShieldCheck, MapPin, Building, Bookmark, History, CreditCard, HeadphonesIcon } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 font-sans">
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white pt-6 pb-28 px-5 rounded-b-[40px] md:rounded-b-[60px] relative overflow-hidden">
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
            <h2 className="text-[22px] md:text-3xl font-bold leading-snug mb-2">
              Pilihan Kos Terbaik <br/> di Sekitar Kampus
            </h2>
            <p className="text-sm opacity-90 mb-5 font-medium">Mulai dari Rp 500.000 / bulan</p>
            <div className="text-xs border border-white/30 rounded-full px-2.5 py-1 inline-block">1/3</div>
          </div>
        </div>
        
        <div className="absolute bottom-6 right-5 text-xs font-medium bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-black/30 transition">
          Lihat Semua Promo
        </div>
      </div>

      {/* Main Menu Grid Section */}
      <div className="px-4 -mt-14 relative z-20">
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Hey kamu, mau cari apa?</h3>
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map((item, idx) => (
              <Link href={item.href} key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] active:scale-95 transition-transform hover:border-blue-100">
                 {item.icon}
                 <span className="text-[11px] font-semibold text-slate-700 text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Spacer to allow scrolling past bottom nav */}
      <div className="h-10"></div>
    </div>
  );
}
