"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TopNavbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'CUSTOMER');
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'CUSTOMER');
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] px-5 md:px-8 py-4 items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl md:text-2xl font-black flex items-center gap-1.5 text-blue-600">
          KosKosanKu <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
        </Link>
        
        {/* Desktop Search */}
        <div className="hidden md:block relative group">
          <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-sm font-medium w-64 hover:bg-slate-200 transition cursor-text">
            <Search size={16} />
            <input type="text" placeholder="Cari kos di Jakarta..." className="bg-transparent outline-none w-full placeholder-slate-400" />
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
        <Link href="/search" className="hover:text-blue-600 transition">Sewa Kos</Link>
        <Link href="/dashboard/owner" className="hover:text-blue-600 transition">Mitra KosKosanKu</Link>
        <Link href="#" className="hover:text-blue-600 transition">Bantuan</Link>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          {isAuthenticated ? (
            <Link href={role === 'TENANT_ADMIN' || role === 'SUPERADMIN' ? '/dashboard/owner' : '/dashboard/tenant'}>
              <button className="px-5 py-2 rounded-full text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition flex items-center gap-2">
                <User size={16} strokeWidth={3} /> Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="px-5 py-2 text-blue-600 border-2 border-transparent hover:bg-blue-50 transition rounded-full">Masuk</button>
              </Link>
              <Link href="/register">
                <button className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md shadow-blue-500/20">Daftar</button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Actions */}
      <div className="flex md:hidden items-center gap-3">
        {isAuthenticated ? (
          <Link href={role === 'TENANT_ADMIN' || role === 'SUPERADMIN' ? '/dashboard/owner' : '/dashboard/tenant'}>
             <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
               <User size={18} />
             </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold">
            <Link href="/login" className="text-blue-600 px-3 py-1.5">Masuk</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-sm">Daftar</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
