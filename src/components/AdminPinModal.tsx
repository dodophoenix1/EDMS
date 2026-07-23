'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, KeyRound, X, ShieldAlert } from 'lucide-react';

interface AdminPinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ onClose, onSuccess }) => {
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'admin2569') {
      onSuccess();
    } else {
      setError('รหัสผ่านไม่ถูกต้อง โปรดระบุรหัสผ่านเข้าใช้ระบบสารบัญ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Lock className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900">เข้าสู่ระบบสารบัญ (Admin Portal)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500 flex-shrink-0 bg-white p-1 shadow-sm">
            <Image
              src="/logo.png"
              alt="ตราโรงเรียนฝางวิทยายน"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900">งานสารบัญ โรงเรียนฝางวิทยายน</div>
            <div className="text-[10px] text-slate-500">สำหรับผู้ดูแลระบบและเจ้าหน้าที่สารบัญเท่านั้น</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>ระบุรหัสผ่านเข้าใช้งาน Admin Portal</span>
            </label>
            <input
              type="password"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="กรอกรหัสผ่าน..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-base font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              ยืนยันการเข้าใช้ Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
