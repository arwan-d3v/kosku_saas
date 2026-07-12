"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, BookmarkCheck, User, LayoutDashboard, LogOut, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
      { label: isAuthenticated ? 'Akun' : 'Masuk', icon: <User size={20} />, href: '/login' },
    ];
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-50/90 via-slate-50/40 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-2 flex items-center justify-around shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] pointer-events-auto">
        {navItems.map((item, idx) => {
          const isButton = !!item.onClick;
          const isActive = !isButton && (
            pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href!))
          );

          const content = (
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center py-2 px-3 relative cursor-pointer"
            >
              {isActive && (
                <motion.span 
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-indigo-50 border border-indigo-100/50 rounded-2xl -z-10"
                />
              )}
              <span className={`transition-colors duration-250 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </motion.div>
          );

          if (isButton) {
            return (
              <button key={idx} onClick={item.onClick} className="outline-none focus:outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={idx} href={item.href!} className="outline-none">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
