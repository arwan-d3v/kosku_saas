"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api-client';

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;
  
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ room_number: '', price_per_month: '', status: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propData, roomsData] = await Promise.all([
        fetchWithAuth(`/properties/${propertyId}`),
        fetchWithAuth(`/properties/${propertyId}/rooms`)
      ]);
      setProperty(propData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = {
        room_number: formData.room_number,
        price_per_month: parseInt(formData.price_per_month.replace(/\D/g, '') || '0', 10),
        status: formData.status
      };

      await fetchWithAuth(`/properties/${propertyId}/rooms`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      setIsModalOpen(false);
      setFormData({ room_number: '', price_per_month: '', status: true });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to add room:', error);
      alert('Gagal menambahkan kamar. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  if (loading && !property) {
    return <div className="p-8 text-center text-slate-500 font-bold">Memuat detail properti...</div>;
  }

  if (!property && !loading) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold text-slate-700">Properti tidak ditemukan</h3>
        <Link href="/dashboard/owner/properties" className="text-indigo-500 mt-4 inline-block hover:underline">Kembali ke Daftar Properti</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/owner/properties" className="w-10 h-10 clay-card flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-800">{property?.name}</h2>
          <p className="text-slate-500 font-medium flex items-center gap-1 mt-1">
            <MapPin size={16} /> {property?.address}
          </p>
        </div>
      </div>

      <div className="clay-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-800">Daftar Kamar</h3>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="clay-button bg-indigo-500 text-white !px-4 flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah Kamar
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-bold">Kosan ini belum memiliki kamar.</p>
              <p className="text-slate-400 text-sm mt-1">Klik "Tambah Kamar" untuk mulai menyewakan.</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 font-bold text-sm uppercase tracking-wider">
                  <th className="pb-2 px-4">No. Kamar</th>
                  <th className="pb-2 px-4">Harga (Bulan)</th>
                  <th className="pb-2 px-4">Status</th>
                  <th className="pb-2 px-4">Fasilitas</th>
                  <th className="pb-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-2xl group">
                    <td className="py-4 px-4 font-black text-slate-700 rounded-l-2xl">{room.room_number}</td>
                    <td className="py-4 px-4 font-bold text-indigo-600">{formatRupiah(room.price_per_month)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.is_available ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {room.is_available ? 'Tersedia' : 'Terisi'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-400">
                      {room.facilities && room.facilities.length > 0 ? room.facilities.join(', ') : '-'}
                    </td>
                    <td className="py-4 px-4 text-right rounded-r-2xl">
                      <button className="text-slate-400 hover:text-indigo-500 font-bold text-sm transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
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
              
              <h2 className="text-2xl font-black text-slate-800 mb-6">Tambah Kamar Baru</h2>
              
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Nomor Kamar</label>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                    placeholder="Contoh: A-01, B-02"
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700 uppercase"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Harga per Bulan (Rp)</label>
                  <input
                    type="text"
                    required
                    value={formData.price_per_month}
                    onChange={(e) => {
                      // Allow only numbers
                      const val = e.target.value.replace(/\D/g, '');
                      // Format as dot separated string (e.g., 1.500.000)
                      const formatted = val ? new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                      setFormData({...formData, price_per_month: formatted});
                    }}
                    placeholder="Contoh: 1.500.000"
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-black text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Status Kamar</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={formData.status === true}
                        onChange={() => setFormData({...formData, status: true})}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Tersedia</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={formData.status === false}
                        onChange={() => setFormData({...formData, status: false})}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Penuh / Terisi</span>
                    </label>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kamar'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
