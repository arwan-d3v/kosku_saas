"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Trash2, Building, MapPin, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Slide-over state
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{name: string, address: string, description: string, facilities: string[], images: string[]}>({ name: '', address: '', description: '', facilities: [], images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', description: '', facilities: [], images: [] });
    setIsSlideOverOpen(true);
  };

  const openEditForm = (property: any) => {
    setEditingId(property.id);
    setFormData({ 
      name: property.name, 
      address: property.address, 
      description: property.description || '', 
      facilities: property.facilities || [],
      images: property.images || []
    });
    setIsSlideOverOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus properti ini? Semua kamar terkait akan terhapus.")) return;
    try {
      toast.loading('Menghapus properti...', { id: 'delete-toast' });
      await fetchWithAuth(`/properties/${id}`, { method: 'DELETE' });
      toast.success('Properti berhasil dihapus!', { id: 'delete-toast' });
      fetchProperties();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus properti.", { id: 'delete-toast' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

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
      
      const response = await fetch(`${API_BASE_URL}/properties/${editingId}/images`, {
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
      fetchProperties(); // Refresh to update list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      toast.loading(editingId ? 'Memperbarui properti...' : 'Menyimpan properti baru...', { id: 'submit-toast' });
      if (editingId) {
        await fetchWithAuth(`/properties/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchWithAuth('/properties', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      toast.success('Properti berhasil disimpan!', { id: 'submit-toast' });
      setIsSlideOverOpen(false);
      fetchProperties();
    } catch (error: any) {
      console.error('Failed to save property:', error);
      toast.error(error.message || 'Gagal menyimpan kosan. Silakan coba lagi.', { id: 'submit-toast' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-800">Daftar Properti Kosan</h3>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Kelola semua properti dan gedung kos Anda.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddForm}
            className="bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Tambah Kosan
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
               Memuat data...
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              Belum ada properti kosan. Klik "Tambah Kosan" untuk mulai.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 px-4">Info Properti</th>
                  <th className="pb-4 px-4">Alamat</th>
                  <th className="pb-4 px-4 text-center">Total Kamar</th>
                  <th className="pb-4 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        {prop.images && prop.images.length > 0 ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                            <img src={prop.images[0]} alt="Prop" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                             <Building size={20} />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 block">{prop.name}</span>
                          {prop.facilities && prop.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {prop.facilities.slice(0, 3).map((f: string) => (
                                <span key={f} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 font-medium rounded border border-indigo-100/50">
                                  {f}
                                </span>
                              ))}
                              {prop.facilities.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-500 font-medium rounded border border-slate-200">
                                  +{prop.facilities.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 font-medium text-slate-500 max-w-[200px] truncate text-sm flex items-center gap-2 mt-2">
                      <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                      {prop.address}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        {prop.rooms ? prop.rooms.length : 0} Kamar
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/owner/properties/${prop.id}`}>
                           <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition">
                             Kamar
                           </button>
                        </Link>
                        <button onClick={() => openEditForm(prop)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(prop.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over Panel for Add/Edit Property */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSlideOverOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800">
                  {editingId ? 'Edit Properti' : 'Tambah Properti Baru'}
                </h2>
                <button 
                  onClick={() => setIsSlideOverOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {editingId && (
                  <div className="mb-6">
                    <label className="block text-slate-600 font-bold text-sm mb-3">Foto Properti (Opsional)</label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200">
                          <img src={img} alt="Property" className="w-full h-full object-cover" />
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
                    <p className="text-xs text-slate-400 mt-2">Maks. 5MB, format JPG/PNG/WEBP.</p>
                  </div>
                )}

                <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">Nama Kosan</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Contoh: Kosan Mawar Eksklusif"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">Alamat Lengkap</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Masukkan alamat lengkap dengan RT/RW..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 resize-none placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-3">Fasilitas Unggulan</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['AC', 'Kamar Mandi Dalam', 'Dapur Umum', 'Dapur Pribadi', 'Air PDAM', 'Listrik Token', 'Listrik Termasuk', 'WiFi Gratis', 'Parkir Motor', 'Parkir Mobil', 'Akses 24 Jam', 'CCTV'].map(facility => (
                        <label key={facility} className="flex items-start gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={formData.facilities.includes(facility)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, facilities: [...formData.facilities, facility] });
                              } else {
                                setFormData({ ...formData, facilities: formData.facilities.filter(f => f !== facility) });
                              }
                            }}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">Deskripsi Lengkap (Opsional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Ceritakan mengapa kosan Anda menarik..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 resize-none placeholder-slate-400"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 pb-24 md:pb-6 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-3">
                   <button
                     type="button"
                     onClick={() => setIsSlideOverOpen(false)}
                     className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition"
                   >
                     Batal
                   </button>
                   <button
                     form="property-form"
                     type="submit"
                     disabled={submitting}
                     className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50"
                   >
                     {submitting ? 'Menyimpan...' : 'Simpan'}
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
