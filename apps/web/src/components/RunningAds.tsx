"use client";

import React from 'react';
import { Sparkles, MapPin, CheckCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RunningAds({ properties }: { properties: any[] }) {
  const router = useRouter();

  if (!properties || properties.length === 0) return null;

  // Extract highlights from top properties
  const highlights = properties.slice(0, 8).map(prop => {
    const minPrice = prop.rooms && prop.rooms.length > 0
        ? Math.min(...prop.rooms.map((r: any) => Number(r.price_per_month)))
        : null;
    const priceText = minPrice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(minPrice) : '';
    
    return {
      id: prop.id,
      name: prop.name,
      city: prop.city,
      price: priceText,
      facilities: prop.facilities?.slice(0, 2) || []
    };
  });

  const dpPromo = {
    id: 'dp-promo',
    isPromo: true,
    text: "🔥 Bisa DP mulai 10% agar tidak kehabisan kamar! Klik di sini 👉",
  };

  // Duplicate list to create a seamless infinite scrolling effect
  const scrollingItems = [dpPromo, ...highlights, dpPromo, ...highlights, dpPromo, ...highlights];

  return (
    <div className="w-full bg-slate-900 text-white py-2.5 overflow-hidden flex items-center relative border-b border-indigo-500/30">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex items-center absolute left-0 z-20 bg-slate-900 px-3 py-1 border-r border-slate-700 h-full shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
        <TrendingUp size={16} className="text-yellow-400 mr-1.5" />
        <span className="text-xs font-black tracking-widest uppercase text-white hidden md:block">Rekomendasi</span>
        <span className="text-xs font-black tracking-widest uppercase text-white md:hidden">Hot</span>
      </div>

      <div className="flex whitespace-nowrap animate-marquee ml-24 md:ml-36 hover:[animation-play-state:paused]">
        {scrollingItems.map((item: any, idx) => {
          if (item.isPromo) {
            return (
              <div 
                key={`promo-${idx}`} 
                onClick={() => router.push('/search?dp_only=true')}
                className="flex items-center gap-2 px-8 py-1 mx-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full cursor-pointer hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all scale-95 md:scale-100"
              >
                <span className="font-black text-white text-xs md:text-sm tracking-wide">{item.text}</span>
              </div>
            );
          }

          return (
            <div 
              key={`${item.id}-${idx}`} 
              onClick={() => router.push(`/properties/${item.id}`)}
              className="flex items-center gap-3 px-6 text-[11px] md:text-sm cursor-pointer hover:bg-white/5 py-1 rounded-full transition-colors"
            >
              <Sparkles size={14} className="text-indigo-400 flex-shrink-0" />
              <span className="font-bold text-white">{item.name}</span>
              <span className="text-slate-400 hidden sm:inline">di</span>
              <span className="font-medium flex items-center gap-1 text-teal-300">
                <MapPin size={12} /> {item.city}
              </span>
              {item.price && (
                <span className="bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold ml-1">
                  {item.price}/bln
                </span>
              )}
              {item.facilities.length > 0 && (
                <div className="flex items-center gap-2 ml-2 border-l border-slate-700 pl-4 hidden md:flex">
                  {item.facilities.map((f: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 text-slate-300">
                      <CheckCircle size={10} className="text-emerald-400" /> {f}
                    </span>
                  ))}
                </div>
              )}
              <span className="mx-4 text-slate-700">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
