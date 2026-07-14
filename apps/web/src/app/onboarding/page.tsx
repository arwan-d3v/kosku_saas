"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Shield, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

type Role = 'CUSTOMER' | 'TENANT_ADMIN';

export default function OnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, phone, full_name')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      // If user already has a phone, they don't need onboarding
      if (profile?.phone) {
        if (profile.role === 'TENANT_ADMIN' || profile.role === 'SUPERADMIN') {
          router.push('/dashboard/owner');
        } else {
          router.push('/search');
        }
        return;
      }

      if (profile?.full_name) {
        setFullName(profile.full_name);
      }
      
      // Default to what's in DB or CUSTOMER
      setRole((profile?.role as Role) || 'CUSTOMER');
      setLoading(false);
      
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && role) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !role || !phone) return;
    
    setSaving(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: role, 
          phone: phone,
          full_name: fullName
        })
        .eq('id', userId);

      if (error) throw error;

      // Success, redirect
      if (role === 'TENANT_ADMIN') {
        router.push('/dashboard/owner');
      } else {
        router.push('/search');
      }
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data profil.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Menyiapkan profil Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay-card max-w-2xl w-full p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          </div>
          <span className="text-sm font-bold text-slate-500">
            Langkah {step} dari 2
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Selamat Datang di KosKosanKu!
                </h2>
                <p className="text-slate-600 text-lg">Pilih bagaimana Anda ingin menggunakan platform ini.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('CUSTOMER')}
                  className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 ${
                    role === 'CUSTOMER' 
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xl shadow-indigo-100' 
                      : 'border-white/60 bg-white/40 hover:bg-white/60 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    role === 'CUSTOMER' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <User size={28} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${role === 'CUSTOMER' ? 'text-indigo-900' : 'text-slate-800'}`}>Pencari Kos</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Saya ingin mencari, membandingkan, dan menyewa kos dengan mudah dan aman.
                  </p>
                  
                  {role === 'CUSTOMER' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-6 right-6 text-indigo-500">
                      <CheckCircle2 size={24} className="fill-indigo-100" />
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('TENANT_ADMIN')}
                  className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 ${
                    role === 'TENANT_ADMIN' 
                      ? 'border-purple-500 bg-purple-50/50 shadow-xl shadow-purple-100' 
                      : 'border-white/60 bg-white/40 hover:bg-white/60 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    role === 'TENANT_ADMIN' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Shield size={28} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${role === 'TENANT_ADMIN' ? 'text-purple-900' : 'text-slate-800'}`}>Mitra KosKosanKu</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Saya adalah pemilik kos dan ingin mengelola properti serta penyewa saya.
                  </p>

                  {role === 'TENANT_ADMIN' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-6 right-6 text-purple-500">
                      <CheckCircle2 size={24} className="fill-purple-100" />
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleNextStep}
                  disabled={!role}
                  className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-10">
                <button 
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-medium mb-4"
                >
                  <ArrowRight size={14} className="rotate-180" /> Kembali
                </button>
                <h2 className="text-3xl font-black text-slate-800 mb-2">
                  Lengkapi Profil Anda
                </h2>
                <p className="text-slate-500">Satu langkah lagi untuk memulai pengalaman Anda.</p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-2xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-800 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-sm mb-2">Nomor WhatsApp / HP</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Misal: 08123456789"
                      className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-800 text-lg"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {role === 'CUSTOMER' 
                      ? '*Diperlukan agar pemilik kos dapat menghubungi Anda.' 
                      : '*Diperlukan agar calon penyewa dapat menghubungi Anda.'}
                  </p>
                </div>

                <div className="pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving || !phone || !fullName}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                  >
                    {saving ? (
                      <><Loader2 size={20} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      'Selesai & Mulai'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
