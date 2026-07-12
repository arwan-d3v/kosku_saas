"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api-client';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/properties');
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await fetchWithAuth('/properties', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: '', address: '', description: '' });
      fetchProperties(); // Refresh data
    } catch (error) {
      console.error('Failed to add property:', error);
      alert('Gagal menambahkan kosan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="clay-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-800">Daftar Kosan Anda</h3>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="clay-button bg-indigo-500 text-white !px-4 flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah Kosan
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-500 font-bold">Memuat data...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-bold">Belum ada properti kosan. Klik "Tambah Kosan" untuk mulai.</div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 font-bold text-sm uppercase tracking-wider">
                  <th className="pb-2 px-4">Nama Properti</th>
                  <th className="pb-2 px-4">Alamat</th>
                  <th className="pb-2 px-4">Total Kamar</th>
                  <th className="pb-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-2xl group">
                    <td className="py-4 px-4 font-bold text-slate-700 rounded-l-2xl">{prop.name}</td>
                    <td className="py-4 px-4 font-medium text-slate-500 max-w-xs truncate">{prop.address}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600">
                        {/* We will update room counts later. For now, 0. */}
                        0 Kamar
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right rounded-r-2xl">
                      <Link href={`/dashboard/owner/properties/${prop.id}`} className="clay-button bg-white text-indigo-500 !px-4 !py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">Kelola Kamar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Property Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="clay-card w-full max-w-md p-8 relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-slate-800 mb-6">Tambah Kosan Baru</h2>
              
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Nama Kosan</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Kosan Mawar"
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Alamat Lengkap</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Masukkan alamat lengkap..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Deskripsi fasilitas umum kosan..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700 resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kosan'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
