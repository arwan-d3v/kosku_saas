"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Wifi, Wind, Search, ArrowLeft, Droplet, Zap, Key, Video, Bike, CarFront, Bath, Utensils, Filter, X, ChevronDown, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialDpOnly = searchParams.get('dp_only') === 'true';

  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [dpOnly, setDpOnly] = useState(initialDpOnly);
  const [sortBy, setSortBy] = useState('recommendation'); // recommendation, price_asc, price_desc
  
  // Mobile UI State
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/public/properties`);
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = [...properties];

    // 1. Text Search (Alamat/Nama)
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. City
    if (selectedCity !== 'Semua') {
      result = result.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // 3. DP Filter
    if (dpOnly) {
      result = result.filter(p => {
        return p.rooms?.some((r: any) => r.dp_10_enabled || r.dp_25_enabled || r.allow_custom_dp);
      });
    }

    // 4. Facilities
    if (selectedFacilities.length > 0) {
      result = result.filter(p => {
        if (!p.facilities) return false;
        return selectedFacilities.every(f => p.facilities.includes(f));
      });
    }

    // 5. Price Range
    result = result.filter(p => {
      if (!p.rooms || p.rooms.length === 0) return false;
      const minPrice = Math.min(...p.rooms.map((r: any) => Number(r.price_per_month)));
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // 6. Sorting
    const calculateScore = (prop: any) => {
      const availableRooms = prop.rooms ? prop.rooms.filter((r: any) => r.is_available).length : 0;
      const facilitiesScore = prop.facilities ? prop.facilities.length * 10 : 0;
      const availabilityScore = availableRooms > 0 ? (availableRooms * 5) + 100 : 0;
      return facilitiesScore + availabilityScore;
    };

    result.sort((a, b) => {
      if (sortBy === 'recommendation') {
        return calculateScore(b) - calculateScore(a);
      } else if (sortBy === 'price_asc') {
        return getLowestPrice(a) - getLowestPrice(b);
      } else if (sortBy === 'price_desc') {
        return getLowestPrice(b) - getLowestPrice(a);
      }
      return 0;
    });

    setFilteredProperties(result);
  }, [searchQuery, selectedCity, dpOnly, selectedFacilities, priceRange, sortBy, properties]);

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

  const hasDP = (property: any) => {
    return property.rooms?.some((r: any) => r.dp_10_enabled || r.dp_25_enabled || r.allow_custom_dp);
  };

  const cities = ['Semua', ...Array.from(new Set(properties.map(p => p.city).filter(Boolean)))];
  const allFacilities = Array.from(new Set(properties.flatMap(p => p.facilities || []))).filter(Boolean) as string[];

  const toggleFacility = (f: string) => {
    setSelectedFacilities(prev => 
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('Semua');
    setPriceRange([0, 10000000]);
    setSelectedFacilities([]);
    setDpOnly(false);
    setSortBy('recommendation');
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-black text-slate-800 mb-3">Tipe Pembayaran</h3>
        <label className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors">
          <input 
            type="checkbox" 
            checked={dpOnly}
            onChange={(e) => setDpOnly(e.target.checked)}
            className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-indigo-900">Bisa Bayar DP 🔥</span>
            <span className="text-[10px] text-indigo-600">Amankan kamar sebelum kehabisan</span>
          </div>
        </label>
      </div>

      <div>
        <h3 className="font-black text-slate-800 mb-3">Rentang Harga (per bulan)</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold mb-1 block">Minimal</label>
              <input 
                type="number" 
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full bg-slate-100 border-none rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-200"
              />
            </div>
            <span className="text-slate-400 font-bold pt-4">-</span>
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold mb-1 block">Maksimal</label>
              <input 
                type="number" 
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full bg-slate-100 border-none rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-800">Fasilitas</h3>
          {selectedFacilities.length > 0 && (
            <button onClick={() => setSelectedFacilities([])} className="text-[10px] font-bold text-red-500 hover:underline">Reset</button>
          )}
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {allFacilities.map(f => (
            <label key={f} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFacilities.includes(f) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                {selectedFacilities.includes(f) && <CheckCircle size={14} />}
              </div>
              <span className={`text-sm ${selectedFacilities.includes(f) ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{f}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-28">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-indigo-600 font-bold mb-2 hover:underline">
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Cari Kamar Kos</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Ditemukan {filteredProperties.length} properti sesuai kriteria</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lokasi, alamat, nama..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all shadow-sm font-medium text-slate-700 placeholder-slate-400 text-sm"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center justify-center bg-indigo-500 text-white p-3 rounded-2xl shadow-md"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold border transition-all ${
                selectedCity === city
                  ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar Filter */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Filter size={18} className="text-indigo-500" /> Filter
                </h2>
                <button onClick={resetFilters} className="text-xs font-bold text-indigo-500 hover:underline">Reset Semua</button>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Properties Grid Area */}
          <div className="flex-1">
            <div className="flex justify-end mb-4">
              <div className="relative inline-block">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold text-sm py-2 pl-4 pr-10 rounded-xl outline-none focus:ring-2 ring-indigo-200 shadow-sm cursor-pointer"
                >
                  <option value="recommendation">Rekomendasi Utama</option>
                  <option value="price_asc">Harga: Rendah ke Tinggi</option>
                  <option value="price_desc">Harga: Tinggi ke Rendah</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 font-bold text-slate-400 text-lg">Memuat properti kosan...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20 font-bold text-slate-400 text-lg">Kosan tidak ditemukan. Coba pencarian atau filter lain!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => {
                  const lowestPrice = getLowestPrice(prop);
                  const availableCount = getAvailableRoomsCount(prop);
                  const mainImage = prop.images && prop.images.length > 0 
                    ? prop.images[0] 
                    : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400';
                  
                  const isDpAvailable = hasDP(prop);

                  return (
                    <Link href={`/properties/${prop.id}`} key={prop.id} className="block group">
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-3xl overflow-hidden flex flex-col h-full transition-all border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-indigo-100"
                      >
                        {/* Image Header */}
                        <div className="h-52 w-full relative overflow-hidden bg-slate-100">
                          <img
                            src={mainImage}
                            alt={prop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black shadow-sm backdrop-blur-md ${availableCount > 0 ? 'text-emerald-700 bg-emerald-50/90 border border-emerald-200' : 'text-rose-700 bg-rose-50/90 border border-rose-200'}`}>
                              {availableCount > 0 ? `${availableCount} Kamar Tersedia` : 'Penuh'}
                            </span>
                          </div>
                          {isDpAvailable && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                                Bisa DP
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                              <MapPin size={12} /> {prop.city || 'Lokal'}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star size={12} fill="currentColor" />
                              <span className="text-[10px] font-bold text-amber-700">4.8</span>
                            </div>
                          </div>
                          
                          <h3 className="text-base font-black text-slate-800 mb-4 line-clamp-1 group-hover:text-indigo-600 transition-colors">{prop.name}</h3>

                          <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
                            {prop.facilities && prop.facilities.slice(0, 4).map((f: string) => (
                              <div key={f} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group/fac relative border border-slate-100">
                                {getFacilityIcon(f, 14)}
                                <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/fac:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {f}
                                </div>
                              </div>
                            ))}
                            {prop.facilities && prop.facilities.length > 4 && (
                              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">
                                +{prop.facilities.length - 4}
                              </div>
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mulai dari</span>
                              <p className="text-sm font-black text-slate-800">
                                {formatRupiah(lowestPrice)}
                                <span className="text-[10px] font-normal text-slate-400">/bln</span>
                              </p>
                            </div>
                            
                            <button
                              className={`rounded-xl text-xs font-bold px-4 py-2 transition-all ${availableCount > 0 ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                              {availableCount > 0 ? 'Lihat Detail' : 'Habis'}
                            </button>
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
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 md:hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Filter size={18} className="text-indigo-500" /> Filter Pencarian
                </h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <FilterPanel />
              </div>

              <div className="p-4 border-t border-slate-100 bg-white flex gap-3 sticky bottom-0">
                <button 
                  onClick={resetFilters}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-[2] py-3.5 bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-200"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-indigo-500">Memuat Pencarian...</div>}>
      <SearchContent />
    </Suspense>
  );
}
