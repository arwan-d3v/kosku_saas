"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { User, Mail, Lock, Shield, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'TENANT_ADMIN'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/onboarding`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mendaftar dengan Google.');
    }
  };


  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/onboarding`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk dengan Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Registrasi berhasil! Silakan cek email Anda untuk konfirmasi atau langsung masuk jika auto-confirm aktif.');
        setFullName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100 flex items-center justify-center p-6 relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
        <ArrowLeft size={18} />
        Kembali ke Beranda
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="clay-card max-w-md w-full p-10 flex flex-col shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gabung KosKosanKu
          </h2>
          <p className="text-slate-500 font-medium mt-2">Mulai kelola atau cari kosan impianmu sekarang</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-2xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-bold rounded-2xl">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
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
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold text-sm mb-2">Alamat Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold text-sm mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold text-sm mb-2">Daftar Sebagai</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`py-3 rounded-2xl font-bold transition-all text-center flex flex-col items-center gap-1 border ${
                  role === 'CUSTOMER'
                    ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-200'
                    : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                <User size={18} />
                <span className="text-xs">Pencari Kos</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('TENANT_ADMIN')}
                className={`py-3 rounded-2xl font-bold transition-all text-center flex flex-col items-center gap-1 border ${
                  role === 'TENANT_ADMIN'
                    ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-200'
                    : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                <Shield size={18} />
                <span className="text-xs">Pemilik Kos</span>
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </motion.button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">Atau lanjutkan dengan</span>
            </div>
          </div>

          <button
            onClick={handleGoogleRegister}
            type="button"
            className="w-full mt-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>
        </div>


        <p className="text-center text-slate-500 text-sm font-medium mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Masuk disini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
