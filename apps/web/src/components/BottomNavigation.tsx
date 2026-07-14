"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, BookmarkCheck, User, LayoutDashboard, LogOut, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useLogout } from '@/hooks/useLogout';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogout = useLogout();

  useEffect(() => {
    // Check session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Get user role
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
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
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
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);



  // Render nothing if still loading auth state
  if (loading) return null;

  // Decide navigation items based on role
  let navItems = [];

  if (role === 'TENANT_ADMIN' || role === 'SUPERADMIN') {
    // Owner Nav Items
    navItems = [
      { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard/owner' },
      { label: 'Properti', icon: <Building2 size={20} />, href: '/dashboard/owner/properties' },
      { label: 'Keluar', icon: <LogOut size={20} />, onClick: handleLogout },
    ];
  } else {
    // Customer / Public Nav Items
    navItems = [
      { label: 'Beranda', icon: <Home size={20} />, href: '/' },
      { label: 'Cari Kos', icon: <Search size={20} />, href: '/search' },
      { label: 'Kos Saya', icon: <BookmarkCheck size={20} />, href: '/dashboard/tenant' },
      { 
        label: isAuthenticated ? 'Akun' : 'Masuk', 
        icon: <User size={20} />, 
        href: isAuthenticated ? (role === 'TENANT_ADMIN' || role === 'SUPERADMIN' ? '/dashboard/owner' : '/dashboard/tenant') : '/login' 
      },
    ];
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, idx) => {
          const isButton = !!item.onClick;
          const isActive = !isButton && (
            pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href!))
          );

          const content = (
            <div className="flex flex-col items-center justify-center relative cursor-pointer min-w-[64px]">
              <span className={`transition-colors duration-250 mb-1 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                {item.icon}
              </span>
              <span className={`text-[11px] font-medium ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </div>
          );

          if (isButton) {
            return (
              <button key={idx} onClick={item.onClick} className="outline-none focus:outline-none w-full">
                {content}
              </button>
            );
          }

          return (
            <Link key={idx} href={item.href!} className="outline-none w-full">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
