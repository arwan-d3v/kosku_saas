"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold text-xs shadow-sm shadow-rose-100/50">
        <Clock size={12} className="animate-pulse" /> Hangus (Waktu Habis)
      </div>
    );
  }

  if (!timeLeft) {
    return <span className="text-slate-400 text-xs animate-pulse font-medium">Memuat waktu...</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-[10px] font-black text-amber-600">
        <Clock size={12} className="mb-[1px]" />
        <span>SISA WAKTU</span>
      </div>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <>
            <div className="px-2 h-7 bg-amber-50 rounded flex items-center justify-center text-amber-700 font-black text-xs border border-amber-200/50 shadow-sm shadow-amber-100">{timeLeft.days} Hari</div>
            <span className="text-slate-300 font-bold">:</span>
          </>
        )}
        <div className="w-7 h-7 bg-amber-50 rounded flex items-center justify-center text-amber-700 font-black text-xs border border-amber-200/50 shadow-sm shadow-amber-100">
          {(timeLeft.days === 0 ? (timeLeft.hours + timeLeft.days * 24) : timeLeft.hours).toString().padStart(2, '0')}
        </div>
        <span className="text-slate-300 font-bold">:</span>
        <div className="w-7 h-7 bg-amber-50 rounded flex items-center justify-center text-amber-700 font-black text-xs border border-amber-200/50 shadow-sm shadow-amber-100">{timeLeft.minutes.toString().padStart(2, '0')}</div>
        <span className="text-slate-300 font-bold">:</span>
        <div className="w-7 h-7 bg-amber-50 rounded flex items-center justify-center text-amber-700 font-black text-xs border border-amber-200/50 shadow-sm shadow-amber-100">{timeLeft.seconds.toString().padStart(2, '0')}</div>
      </div>
    </div>
  );
};
