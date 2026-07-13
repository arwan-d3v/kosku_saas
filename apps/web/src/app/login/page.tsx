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


  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/search`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk dengan Google.');
    }
  };


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
            onClick={handleGoogleLogin}
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
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-600 font-bold hover:underline">
            Daftar disini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
