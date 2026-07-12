"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/users/me');
      setProfile(data);
      setFormData({ full_name: data.full_name || '' });
    } catch (error: any) {
      toast.error('Gagal memuat profil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await fetchWithAuth('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setProfile(updated);
      
      // Update session metadata if using Supabase client directly
      await supabase.auth.updateUser({
        data: { full_name: formData.full_name }
      });
      
      toast.success('Profil berhasil diperbarui!');
    } catch (error: any) {
      toast.error('Gagal memperbarui profil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Gagal mengunggah foto');
      }

      const updated = await response.json();
      setProfile(updated);
      
      // Update auth meta so it updates everywhere
      await supabase.auth.updateUser({
        data: { avatar_url: updated.avatar_url }
      });

      toast.success('Foto profil diperbarui!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-black text-slate-800">Pengaturan Akun</h3>
        <p className="text-slate-500 font-medium mt-1">Kelola informasi profil dan preferensi akun Anda.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <form onSubmit={handleSave}>
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg ring-1 ring-slate-200">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                      <User size={48} />
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Peran Akun</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black inline-block">
                  {profile?.role === 'TENANT_ADMIN' ? 'MITRA / PEMILIK' : profile?.role}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-slate-700 font-bold text-sm mb-2">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-sm mb-2">Email Address</label>
                <div className="relative cursor-not-allowed">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Shield size={12} /> Email dikelola oleh penyedia Autentikasi (Google).
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
