"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user's role from public.users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          setErrorMsg('Gagal mengambil profil pengguna: ' + profileError.message);
          setLoading(false);
          return;
        }

        // Redirect based on role
        if (profile?.role === 'TENANT_ADMIN' || profile?.role === 'SUPERADMIN') {
          router.push('/dashboard/owner');
        } else {
          router.push('/search');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk.');
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
            Selamat Datang
          </h2>
          <p className="text-slate-500 font-medium mt-2">Masuk ke akun KosanKita Anda</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-2xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="Masukkan password Anda"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-300 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </motion.button>
        </form>

        <p className="text-center text-slate-500 text-sm font-medium mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-600 font-bold hover:underline">
            Daftar disini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
