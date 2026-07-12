"use client";

import React from 'react';
import { LayoutDashboard, Home, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard/owner' },
    { icon: <Home size={20} />, label: 'Properti Saya', href: '/dashboard/owner/properties' },
    { icon: <Users size={20} />, label: 'Penghuni', href: '/dashboard/owner/tenants' },
    { icon: <CreditCard size={20} />, label: 'Transaksi', href: '/dashboard/owner/transactions' },
    { icon: <Settings size={20} />, label: 'Pengaturan', href: '/dashboard/owner/settings' },
  ];

  const [avatar, setAvatar] = React.useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
  
  React.useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.user_metadata?.avatar_url) {
          setAvatar(session.user.user_metadata.avatar_url);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user?.user_metadata?.avatar_url) {
          setAvatar(session.user.user_metadata.avatar_url);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Liquid Glass Sidebar */}
      <aside className="w-72 fixed h-full p-6 hidden lg:block z-10">
        <div className="liquid-glass h-full rounded-4xl flex flex-col p-8 shadow-xl">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-12">
            KosanKita
          </div>

          <nav className="flex-1 space-y-4">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard/owner' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={idx} 
                  href={item.href} 
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold ${
                    isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-white/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button className="flex items-center gap-4 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-4 md:p-8 pb-24 md:pb-8 relative z-0 w-full overflow-x-hidden">
        <header className="flex justify-between items-center mb-6 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">Dashboard Pemilik</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">Selamat datang kembali!</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-inner overflow-hidden">
             <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}
