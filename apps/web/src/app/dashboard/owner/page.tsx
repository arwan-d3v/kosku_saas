"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  Settings,
  LogOut,
  TrendingUp,
  DoorOpen,
  Wallet
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboard() {
  const stats = [
    { label: 'Total Kamar', value: '24', icon: <Home className="text-indigo-500" />, color: 'bg-indigo-50' },
    { label: 'Kamar Kosong', value: '5', icon: <DoorOpen className="text-mint-500" />, color: 'bg-emerald-50' },
    { label: 'Pendapatan', value: 'Rp 42jt', icon: <Wallet className="text-lavender-500" />, color: 'bg-purple-50' },
  ];

  const tenants = [
    { id: 1, name: 'Budi Santoso', room: 'A-01', status: 'Lunas', date: '12 Mei 2024' },
    { id: 2, name: 'Siti Aminah', room: 'B-04', status: 'Menunggu', date: '15 Mei 2024' },
    { id: 3, name: 'Rizky Febian', room: 'A-12', status: 'Lunas', date: '10 Mei 2024' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Liquid Glass Sidebar */}
      <aside className="w-72 fixed h-full p-6 hidden lg:block">
        <div className="liquid-glass h-full rounded-4xl flex flex-col p-8 shadow-xl">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-12">
            KosanKita
          </div>

          <nav className="flex-1 space-y-4">
            {[
              { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
              { icon: <Home size={20} />, label: 'Properti Saya' },
              { icon: <Users size={20} />, label: 'Penghuni' },
              { icon: <CreditCard size={20} />, label: 'Transaksi' },
              { icon: <Settings size={20} />, label: 'Pengaturan' },
            ].map((item, idx) => (
              <Link key={idx} href="#" className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold ${item.active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-white/50'}`}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <button className="flex items-center gap-4 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Dashboard Pemilik</h2>
            <p className="text-slate-500 font-medium">Selamat datang kembali, Pak Juragan!</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-inner overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="clay-card p-8 flex items-center gap-6"
            >
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table Area */}
        <div className="clay-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">Daftar Penghuni Terbaru</h3>
            <button className="text-indigo-600 font-bold text-sm">Lihat Semua</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 font-bold text-sm uppercase tracking-wider">
                  <th className="pb-2 px-4">Nama Penghuni</th>
                  <th className="pb-2 px-4">Kamar</th>
                  <th className="pb-2 px-4">Status</th>
                  <th className="pb-2 px-4">Jatuh Tempo</th>
                  <th className="pb-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-2xl group">
                    <td className="py-4 px-4 font-bold text-slate-700 rounded-l-2xl">{tenant.name}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">{tenant.room}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tenant.status === 'Lunas' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{tenant.date}</td>
                    <td className="py-4 px-4 text-right rounded-r-2xl">
                      <button className="clay-button bg-white text-indigo-500 !px-4 !py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
