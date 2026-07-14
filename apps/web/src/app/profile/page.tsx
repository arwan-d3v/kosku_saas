"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchWithAuth } from '@/lib/api-client';
import { useLogout } from '@/hooks/useLogout';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  MapPin, 
  Image as ImageIcon,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const handleLogout = useLogout();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    phone_number: '',
    university: '',
    domicile_address: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch from our NestJS backend which might have the latest schema
      const userProfile = await fetchWithAuth('/users/me');
      
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || session.user.email || '',
        avatar_url: userProfile.avatar_url || '',
        phone_number: userProfile.phone_number || '',
        university: userProfile.university || '',
        domicile_address: userProfile.domicile_address || ''
      });
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorMsg('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
        phone_number: formData.phone_number,
        university: formData.university,
        domicile_address: formData.domicile_address
      };

      await fetchWithAuth('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setErrorMsg(error.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">Memuat profil Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-8 px-6 max-w-md mx-auto md:max-w-2xl">
      
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profil Saya</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">
          Kelola informasi pribadi dan data kontak Anda.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Section */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-300" />
              )}
            </div>
          </div>
          
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Foto Profil (Opsional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><ImageIcon size={18} /></span>
              <input 
                type="text" 
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">Masukkan link gambar (URL) untuk mengubah foto profil sementara.</p>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={18} /></span>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
            <div className="relative opacity-60 cursor-not-allowed">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></span>
              <input 
                type="email" 
                value={formData.email}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 text-sm outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Email tidak dapat diubah karena terhubung dengan autentikasi.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18} /></span>
              <input 
                type="tel" 
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Digunakan untuk notifikasi tagihan pintar (Smart Notify).</p>
          </div>
        </div>

        {/* Additional Data Section */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Universitas / Tempat Kerja (Opsional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><GraduationCap size={18} /></span>
              <input 
                type="text" 
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Contoh: Universitas Indonesia"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Domisili Asal (Opsional)</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400"><MapPin size={18} /></span>
              <textarea 
                name="domicile_address"
                value={formData.domicile_address}
                onChange={handleChange}
                rows={3}
                placeholder="Alamat asal tempat tinggal..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-bold text-sm flex items-center gap-2">
              <CheckCircle size={18} /> {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold text-sm flex items-center gap-2">
              <AlertCircle size={18} /> {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mt-8">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.25)] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <><Save size={20} /> Simpan Perubahan</>
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full bg-white hover:bg-rose-50 text-rose-500 font-bold py-4 px-6 rounded-2xl border border-rose-100 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut size={20} /> Keluar dari Akun (Logout)
          </button>
        </div>

      </form>
    </div>
  );
}
