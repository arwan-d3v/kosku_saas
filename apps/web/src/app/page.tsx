"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Home, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100 overflow-hidden">
      {/* Liquid Glass Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
        <div className="liquid-glass rounded-full px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            KosanKita
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-700">
            <Link href="#" className="hover:text-indigo-600 transition-colors">Cari Kos</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Tentang Kami</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Bantuan</Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="hover:text-indigo-600 font-bold transition-colors text-slate-700 text-sm px-2">
              Masuk
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="clay-button bg-indigo-500 text-white !px-4 !py-2 text-sm"
              >
                Daftar
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 leading-tight mb-6">
            Cari Kos Idaman,<br />
            <span className="text-indigo-600">Tanpa Drama!</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mb-10 font-medium">
            Sistem manajemen kos paling sat-set untuk Gen Z. Booking, bayar, dan lapor kerusakan cukup dari satu aplikasi.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/search">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="clay-button bg-indigo-500 text-white text-lg flex items-center gap-2"
              >
                <Search size={20} />
                Temukan Kamar
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="clay-button bg-white text-indigo-500 text-lg flex items-center gap-2"
            >
              <Home size={20} />
              Daftarkan Properti
            </motion.button>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {[
            { icon: <ShieldCheck className="text-mint-500" />, title: "Aman & Terpercaya", desc: "Verifikasi pemilik kos 100% transparan." },
            { icon: <Search className="text-indigo-500" />, title: "Pencarian Pintar", desc: "Filter sesuai budget dan fasilitas kamu." },
            { icon: <User className="text-lavender-500" />, title: "Manajemen Mudah", desc: "Bayar tagihan otomatis gak pakai ribet." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="clay-card p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
