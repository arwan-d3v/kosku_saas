"use client";

import React, { useState, useEffect } from 'react';
import { Search, Home, User, ShieldCheck, MapPin, Building, Bookmark, History, CreditCard, HeadphonesIcon, Menu } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

import TopNavbar from '@/components/TopNavbar';
import RunningAds from '@/components/RunningAds';

export default function LandingPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('Semua');
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/public/properties`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch properties", error);
      }
    };
    fetchProperties();
  }, []);

  const menuItems = [
    { label: 'Cari Kos', icon: <Search className="text-blue-500" size={28} />, href: '/search' },
    { label: 'Kos Sekitar', icon: <MapPin className="text-teal-500" size={28} />, href: '/search?nearby=true' },
    { label: 'Kos Saya', icon: <Building className="text-indigo-500" size={28} />, href: '/dashboard/tenant' },
    { label: 'Favorit', icon: <Bookmark className="text-purple-500" size={28} />, href: '/dashboard/tenant' },
    { label: 'Transaksi', icon: <CreditCard className="text-emerald-500" size={28} />, href: '/dashboard/tenant' },
    { label: 'Bantuan', icon: <HeadphonesIcon className="text-orange-500" size={28} />, href: '#' },
  ];

  const cities = ['Semua', ...Array.from(new Set(properties.map((p: any) => p.city).filter(Boolean)))];
  
  const calculateScore = (prop: any) => {
    const availableRooms = prop.rooms ? prop.rooms.filter((r: any) => r.is_available).length : 0;
    const facilitiesScore = prop.facilities ? prop.facilities.length * 10 : 0;
    const availabilityScore = availableRooms > 0 ? (availableRooms * 5) + 100 : 0; // +100 to prioritize available properties
    return facilitiesScore + availabilityScore;
  };

  const filteredProperties = (selectedCity === 'Semua' ? properties : properties.filter((p: any) => p.city === selectedCity))
    .sort((a, b) => calculateScore(b) - calculateScore(a));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 font-sans overflow-x-hidden">
      {/* Top Navbar Component */}
      <TopNavbar />

      {/* Running Ads / Real-time Marquee */}
      <RunningAds properties={properties} />

      {/* Hero Banner Section (Responsive) */}
      <div className="bg-blue-600 text-white pt-8 pb-28 md:pt-16 md:pb-36 px-5 md:px-12 rounded-b-[40px] md:rounded-b-[80px] relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between max-w-full">
        {/* Subtle background decoration */}
        <div className="absolute top-10 right-0 md:right-32 opacity-10 md:scale-150 transform">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M45.5 -25.5C124.5 -55.5 187.5 10 216 67.5C244.5 125 187.5 198 123 214C58.5 230 -25.5 181 -61.5 116.5C-97.5 52 -33.5 4.5 45.5 -25.5Z" fill="white"/>
          </svg>
        </div>

        <div className="relative z-10 w-full md:max-w-xl md:mx-auto md:text-center mt-2 md:mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2 py-1 rounded-md mb-3 border border-white/30 backdrop-blur-sm">
            <ShieldCheck size={14} /> Terverifikasi
          </div>
          <h2 className="text-[26px] md:text-4xl md:leading-tight font-bold leading-snug mb-3">
            Pilihan Kos Terbaik <br className="md:hidden"/> di Sekitar Kampus
          </h2>
          <p className="text-sm md:text-base opacity-90 mb-5 font-medium">Mulai dari Rp 500.000 / bulan</p>
          <div className="text-xs md:text-sm border border-white/30 rounded-full px-2.5 py-1 inline-block">1/3</div>
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
          {cities.map((city: any, idx) => (
            <button 
              key={idx} 
              onClick={() => setSelectedCity(city)}
              className={`snap-start whitespace-nowrap px-4 py-1.5 md:py-2 md:px-5 rounded-full border text-xs md:text-sm font-semibold transition ${selectedCity === city ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}>
              {city}
            </button>
          ))}
        </div>

        {/* Property Horizontal List */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 hide-scrollbar snap-x flex-nowrap w-full">
          {properties.length === 0 ? (
            [1, 2, 3].map((_, idx) => (
               <div key={`skeleton-${idx}`} className="flex-none w-[220px] md:w-[280px] bg-slate-100 animate-pulse rounded-2xl h-[240px] snap-start border border-slate-200"></div>
            ))
          ) : filteredProperties.length > 0 ? (
            filteredProperties.slice(0, 6).map((prop, idx) => {
            const hasImage = prop.images && prop.images.length > 0;
            const price = prop.rooms && prop.rooms.length > 0
                ? Math.min(...prop.rooms.map((r: any) => Number(r.price_per_month)))
                : 0;

            return (
            <div key={idx} onClick={() => router.push(`/properties/${prop.id}`)} className="flex-none w-[220px] md:w-[280px] bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden snap-start group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="h-32 md:h-40 bg-slate-200 relative overflow-hidden">
                {hasImage ? (
                  <img src={prop.images[0]} alt={prop.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-teal-200 group-hover:scale-105 transition-transform duration-500"></div>
                )}
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded">{prop.type || 'Campur'}</div>
              </div>
              <div className="p-3 md:p-4">
                <h4 className="font-bold text-sm md:text-base text-slate-800 mb-1 line-clamp-1">{prop.name}</h4>
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mb-3">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="line-clamp-1">{prop.address}</span>
                </div>
                <div className="flex items-end justify-between border-t border-slate-100 pt-3 mt-3">
                  <div>
                    <p className="text-sm md:text-base font-black text-orange-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}
                    </p>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 mb-0.5">/ bln</span>
                </div>
              </div>
            </div>
            );
            })
          ) : (
            <div className="w-full text-center py-10 text-slate-500 font-bold">Kosan tidak ditemukan di area ini.</div>
          )}
        </div>
      </div>
      
    </div>
  );
}
