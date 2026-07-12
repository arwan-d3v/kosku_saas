"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, DoorOpen, Wallet } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

export default function OwnerDashboard() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/properties');
      setPropertiesCount(data.length || 0);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Properti', value: loading ? '...' : propertiesCount, icon: <Home className="text-indigo-500" />, color: 'bg-indigo-50' },
    { label: 'Kamar Kosong', value: '5', icon: <DoorOpen className="text-mint-500" />, color: 'bg-emerald-50' },
    { label: 'Pendapatan', value: 'Rp 42jt', icon: <Wallet className="text-lavender-500" />, color: 'bg-purple-50' },
  ];

  return (
    <div>
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

      <div className="clay-card p-8 text-center text-slate-500 font-medium">
        <p>Silakan navigasikan ke menu <strong>Properti Saya</strong> untuk mengelola kosan dan kamar Anda.</p>
      </div>
    </div>
  );
}
