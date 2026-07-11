"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Coffee, Wind } from 'lucide-react';
import Link from 'next/link';

const ROOMS = [
  { id: 1, name: 'Kos Mentari Green', price: '1.200.000', city: 'Jakarta Selatan', rating: 4.8, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Pavilion Lavender', price: '2.500.000', city: 'Bandung', rating: 4.9, image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Kosan Bintang 3', price: '850.000', city: 'Yogyakarta', rating: 4.5, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400' },
];

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <Link href="/" className="text-indigo-600 font-bold mb-2 block">← Kembali</Link>
            <h1 className="text-4xl font-black text-slate-800">Cari Kamar Kos</h1>
            <p className="text-slate-500 font-medium">Ditemukan 120+ properti di sekitarmu</p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Cari lokasi atau nama kos..."
              className="clay-card !rounded-2xl px-6 py-3 w-full md:w-80 outline-none focus:ring-2 ring-indigo-300 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {ROOMS.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.03, y: -5 }}
              className="clay-card overflow-hidden flex flex-col"
            >
              <div className="h-56 w-full relative overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="liquid-glass px-3 py-1 rounded-full text-xs font-bold text-slate-800">
                    Tersedia
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{room.city}</span>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-slate-700">{room.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-4">{room.name}</h3>

                <div className="flex gap-4 mb-6">
                  <Wifi size={18} className="text-slate-400" />
                  <Coffee size={18} className="text-slate-400" />
                  <Wind size={18} className="text-slate-400" />
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-sm text-slate-400 font-medium">Mulai dari</span>
                    <p className="text-lg font-black text-slate-800">Rp {room.price}<span className="text-xs font-normal text-slate-400">/bln</span></p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="clay-button bg-indigo-500 text-white !px-5 !py-2 text-sm"
                  >
                    Booking
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
