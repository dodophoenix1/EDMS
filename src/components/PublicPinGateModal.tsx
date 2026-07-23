'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { KeyRound, ShieldAlert, Lock } from 'lucide-react';

interface PublicPinGateModalProps {
  onSuccess: () => void;
}

export const PublicPinGateModal: React.FC<PublicPinGateModalProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === '1234') {
      onSuccess();
    } else {
      setError('รหัส PIN ไม่ถูกต้อง โปรดระบุ PIN เพื่อเข้าใช้งานระบบโรงเรียนฝางวิทยายน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center text-slate-800">
        {/* Logo & School Emblem (Pure White Background) */}
        <div className="space-y-3">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-white p-2 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="ตราโรงเรียนฝางวิทยายน"
              width={90}
              height={90}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              โรงเรียนฝางวิทยายน
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ระบบสารบัญและคลังหนังสือราชการอิเล็กทรอนิกส์
            </p>
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>กรุณาระบุรหัส PIN เพื่อเข้าใช้งานระบบ</span>
            </label>
            <input
              type="password"
              autoFocus
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="กรอกรหัส PIN..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-center text-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center space-x-2 text-left">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-200 transition-all scale-100 hover:scale-[1.01]"
          >
            เข้าสู่ระบบค้นหาหนังสือ
          </button>
        </form>

        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center space-x-1 border-t border-slate-100 pt-4">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fang Wittayayon School Security Gate</span>
        </div>
      </div>
    </div>
  );
};
