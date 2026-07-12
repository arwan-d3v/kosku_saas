"use client";

import React, { useState, useEffect, use, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, MapPin, Pencil, Trash2, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const ROOM_FACILITIES = [
  'Kamar Mandi Dalam', 'Jendela Luar', 'AC', 'Kipas Angin',
  'TV', 'Kasur', 'Lemari', 'Meja Belajar', 'WiFi Khusus', 'Water Heater'
];

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = use(params);
  
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    room_number: '', 
    price_per_month: '', 
    status: true,
    facilities: [] as string[],
    images: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('Gagal mengambil data properti');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setEditingRoomId(null);
    setFormData({ room_number: '', price_per_month: '', status: true, facilities: [], images: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (room: any) => {
    setEditMode(true);
    setEditingRoomId(room.id);
    setFormData({
      room_number: room.room_number,
      price_per_month: room.price_per_month.toString(),
      status: room.is_available,
      facilities: room.facilities || [],
      images: room.images || []
    });
    setIsModalOpen(true);
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...prev.facilities, facility] };
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingRoomId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran maksimal foto 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadData = new FormData();
      uploadData.append('file', file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/rooms/${editingRoomId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: uploadData
      });

      if (!response.ok) throw new Error('Gagal upload gambar');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success('Gambar berhasil diunggah!');
      fetchData(); // Refresh to update list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddOrEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      toast.loading(editMode ? 'Menyimpan perubahan...' : 'Menambahkan kamar...', { id: 'room-submit' });
      
      const payload = {
        room_number: formData.room_number,
        price_per_month: parseInt(formData.price_per_month.replace(/\D/g, '') || '0', 10),
        status: formData.status,
        facilities: formData.facilities,
        images: formData.images
      };

      if (editMode && editingRoomId) {
        await fetchWithAuth(`/properties/${propertyId}/rooms/${editingRoomId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Kamar berhasil diperbarui!', { id: 'room-submit' });
      } else {
        await fetchWithAuth(`/properties/${propertyId}/rooms`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Kamar baru berhasil ditambahkan! Silakan edit untuk menambah foto.', { id: 'room-submit' });
      }
      
      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Failed to save room:', error);
      toast.error(`Gagal menyimpan kamar: ${error.message}`, { id: 'room-submit' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Anda yakin ingin menghapus kamar ini secara permanen?')) {
      try {
        setDeletingId(roomId);
        toast.loading('Menghapus kamar...', { id: 'delete-room' });
        await fetchWithAuth(`/properties/${propertyId}/rooms/${roomId}`, {
          method: 'DELETE',
        });
        toast.success('Kamar berhasil dihapus', { id: 'delete-room' });
        fetchData();
      } catch (error: any) {
        toast.error(`Gagal menghapus kamar: ${error.message}`, { id: 'delete-room' });
      } finally {
        setDeletingId(null);
      }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-black text-slate-800">Daftar Kamar</h3>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
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
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden pb-4">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-4 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {room.images && room.images.length > 0 ? (
                           <img src={room.images[0]} alt="Kamar" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                        ) : (
                           <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                             <Camera size={18} />
                           </div>
                        )}
                        <div>
                          <h4 className="font-black text-slate-800 text-lg">{room.room_number}</h4>
                          <span className={`inline-block px-2.5 py-0.5 mt-0.5 rounded-md text-[10px] font-bold ${room.is_available ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                            {room.is_available ? 'Tersedia' : 'Terisi'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{formatRupiah(room.price_per_month)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">/ bulan</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Fasilitas</p>
                      {room.facilities && room.facilities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.map((f: string) => (
                            <span key={f} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-medium text-slate-600">
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-slate-400 text-xs">-</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/50">
                      <button 
                        onClick={() => openEditModal(room)}
                        className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={deletingId === room.id}
                        className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:text-rose-600 hover:border-rose-200 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="w-full text-left border-separate border-spacing-y-4 hidden md:table">
                <thead>
                  <tr className="text-slate-400 font-bold text-sm uppercase tracking-wider">
                    <th className="pb-2 px-4 whitespace-nowrap">No. Kamar</th>
                    <th className="pb-2 px-4 whitespace-nowrap">Harga (Bulan)</th>
                    <th className="pb-2 px-4 whitespace-nowrap">Status</th>
                    <th className="pb-2 px-4 whitespace-nowrap">Fasilitas</th>
                    <th className="pb-2 px-4 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-2xl group">
                      <td className="py-4 px-4 font-black text-slate-700 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          {room.images && room.images.length > 0 ? (
                             <img src={room.images[0]} alt="Kamar" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                             <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                               <Camera size={16} />
                             </div>
                          )}
                          {room.room_number}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-indigo-600 whitespace-nowrap">{formatRupiah(room.price_per_month)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.is_available ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                          {room.is_available ? 'Tersedia' : 'Terisi'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500 font-medium">
                        {room.facilities && room.facilities.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {room.facilities.map((f: string) => (
                              <span key={f} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                                {f}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right rounded-r-2xl">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(room)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Kamar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            disabled={deletingId === room.id}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                            title="Hapus Kamar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Room Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="clay-card w-full max-w-lg p-6 md:p-8 relative my-8"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-slate-800 mb-6">{editMode ? 'Edit Kamar' : 'Tambah Kamar Baru'}</h2>
              
              {editMode && (
                <div className="mb-6">
                  <label className="block text-slate-600 font-bold text-sm mb-3">Foto Kamar (Opsional)</label>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200">
                        <img src={img} alt="Room" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                      {uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                      <span className="text-[10px] font-bold mt-1">Tambah Foto</span>
                    </button>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleAddOrEditRoom} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-600 font-bold text-sm mb-2">Nomor Kamar</label>
                    <input
                      type="text"
                      required
                      value={formData.room_number}
                      onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                      placeholder="Contoh: A-01"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700 uppercase"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-600 font-bold text-sm mb-2">Harga / Bulan (Rp)</label>
                    <input
                      type="text"
                      required
                      value={formData.price_per_month}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const formatted = val ? new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                        setFormData({...formData, price_per_month: formatted});
                      }}
                      placeholder="1.500.000"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-black text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-3">Fasilitas Khusus Kamar</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_FACILITIES.map((facility) => (
                      <label key={facility} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-600">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Status Ketersediaan</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 transition-colors">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={formData.status === true}
                        onChange={() => setFormData({...formData, status: true})}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-emerald-700 text-sm">Kamar Tersedia</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 transition-colors">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={formData.status === false}
                        onChange={() => setFormData({...formData, status: false})}
                        className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-bold text-rose-700 text-sm">Penuh / Terisi</span>
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
                  {submitting ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Simpan Kamar Baru')}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
