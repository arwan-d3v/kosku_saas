"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Wind, Search, ArrowLeft, Droplet, Zap, Key, Video, Bike, CarFront, Bath, Utensils } from 'lucide-react';
import Link from 'next/link';

export const getFacilityIcon = (facility: string, size = 16) => {
  switch (facility) {
    case 'AC': return <Wind size={size} />;
    case 'Kamar Mandi Dalam': return <Bath size={size} />;
    case 'Dapur Umum':
    case 'Dapur Pribadi': return <Utensils size={size} />;
    case 'Air PDAM': return <Droplet size={size} />;
    case 'Listrik Token':
    case 'Listrik Termasuk': return <Zap size={size} />;
    case 'WiFi Gratis': return <Wifi size={size} />;
    case 'Parkir Motor': return <Bike size={size} />;
    case 'Parkir Mobil': return <CarFront size={size} />;
    case 'Akses 24 Jam': return <Key size={size} />;
    case 'CCTV': return <Video size={size} />;
    default: return <Star size={size} />;
  }
};

export default function SearchPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/public/properties`);
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = properties;

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCity !== 'Semua') {
      result = result.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
    }

    setFilteredProperties(result);
  }, [searchQuery, selectedCity, properties]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getLowestPrice = (property: any) => {
    if (!property.rooms || property.rooms.length === 0) return 0;
    return Math.min(...property.rooms.map((r: any) => Number(r.price_per_month)));
  };

  const getAvailableRoomsCount = (property: any) => {
    if (!property.rooms) return 0;
    return property.rooms.filter((r: any) => r.is_available).length;
  };

  // Get unique cities for filter buttons
  const cities = ['Semua', ...Array.from(new Set(properties.map(p => p.city).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-28">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-indigo-600 font-bold mb-2 hover:underline">
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Cari Kamar Kos</h1>
            <p className="text-slate-500 font-medium mt-1">Ditemukan {filteredProperties.length} properti di sekitarmu</p>
          </div>
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi atau nama kos..."
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all shadow-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${
                selectedCity === city
                  ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="text-center py-20 font-bold text-slate-400 text-lg">Memuat properti kosan...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 font-bold text-slate-400 text-lg">Kosan tidak ditemukan. Coba pencarian atau filter lain!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => {
              const lowestPrice = getLowestPrice(prop);
              const availableCount = getAvailableRoomsCount(prop);
              const mainImage = prop.images && prop.images.length > 0 
                ? prop.images[0] 
                : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400';

              return (
                <Link href={`/properties/${prop.id}`} key={prop.id} className="block">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="clay-card overflow-hidden flex flex-col h-full bg-white transition-all border border-slate-100/50 hover:shadow-xl cursor-pointer"
                  >
                    {/* Image Header */}
                    <div className="h-56 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={mainImage}
                        alt={prop.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`liquid-glass px-3 py-1 rounded-full text-xs font-black ${availableCount > 0 ? 'text-emerald-700 bg-emerald-50/80' : 'text-rose-700 bg-rose-50/80'}`}>
                          {availableCount > 0 ? `${availableCount} Kamar` : 'Penuh'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={12} /> {prop.city || 'Lokal'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-bold text-slate-700">4.8</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-800 mb-4 line-clamp-1">{prop.name}</h3>

                      <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
                        {prop.facilities && prop.facilities.slice(0, 3).map((f: string) => (
                          <div key={f} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group relative">
                            {getFacilityIcon(f, 16)}
                            <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {f}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mulai dari</span>
                          <p className="text-base font-black text-slate-800">
                            {formatRupiah(lowestPrice)}
                            <span className="text-xs font-normal text-slate-400">/bln</span>
                          </p>
                        </div>
                        
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className={`clay-button text-xs !px-4 !py-2.5 ${availableCount > 0 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                        >
                          {availableCount > 0 ? 'Pesan' : 'Penuh'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
