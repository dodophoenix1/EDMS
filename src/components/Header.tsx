'use client';

import React from 'react';
import Image from 'next/image';
import { Search, ShieldCheck, PlusCircle, Settings, History, LogOut, Lock, Sun, Moon } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface HeaderProps {
  viewMode: 'public' | 'admin';
  isAdminAuthenticated: boolean;
  onAdminClick: () => void;
  onPublicClick: () => void;
  onAdminLogout: () => void;
  adminTab: 'documents' | 'audit_logs';
  onAdminTabChange: (tab: 'documents' | 'audit_logs') => void;
  currentRole: UserRole;
  onOpenUpload: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  isAdminAuthenticated,
  onAdminClick,
  onPublicClick,
  onAdminLogout,
  adminTab,
  onAdminTabChange,
  currentRole,
  onOpenUpload,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 transition-colors backdrop-blur-xl border-b ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-950/90 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Fang Wittayayon School Crest (Pure White Background) */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500 shadow-sm p-1 bg-white flex-shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="ตราโรงเรียนฝางวิทยายน"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-base font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  โรงเรียนฝางวิทยายน{' '}
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-emerald-400 bg-emerald-950 border-emerald-800'
                  }`}>EDMS</span>
                </h1>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ระบบสารบัญและคลังหนังสือราชการอิเล็กทรอนิกส์
              </p>
            </div>
          </div>

          {/* Center Mode Switcher */}
          <div className={`flex items-center space-x-1 p-1.5 rounded-xl border shadow-inner ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              onClick={onPublicClick}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'public'
                  ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>🔍 ค้นหาหนังสือ</span>
            </button>

            <button
              onClick={onAdminClick}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {isAdminAuthenticated ? (
                <>
                  <Settings className="w-3.5 h-3.5" />
                  <span>⚙️ จัดการสารบัญ</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚙️ ระบบสารบัญ</span>
                </>
              )}
            </button>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-medium ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title={isLight ? 'เปลี่ยนเป็น Dark Mode' : 'เปลี่ยนเป็น Light Mode'}
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden md:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Light</span>
                </>
              )}
            </button>

            {viewMode === 'admin' && isAdminAuthenticated && (
              <>
                {/* Admin Tab Switcher */}
                <div className={`hidden sm:flex items-center space-x-1 p-1 rounded-lg border text-xs ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <button
                    onClick={() => onAdminTabChange('documents')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      adminTab === 'documents'
                        ? isLight
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'bg-slate-800 text-white font-medium'
                        : isLight
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    คลังเอกสาร
                  </button>
                  <button
                    onClick={() => onAdminTabChange('audit_logs')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                      adminTab === 'audit_logs'
                        ? isLight
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'bg-slate-800 text-white font-medium'
                        : isLight
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    <History className="w-3 h-3" />
                    <span>Audit Logs</span>
                  </button>
                </div>

                {/* Upload Button */}
                {currentRole !== 'teacher' && (
                  <button
                    onClick={onOpenUpload}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">ลงทะเบียนหนังสือใหม่</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={onAdminLogout}
                  className={`p-2 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-rose-50 border-slate-200 text-slate-600 hover:text-rose-600'
                      : 'bg-slate-800 hover:bg-rose-950 border-slate-700 text-slate-400 hover:text-rose-300'
                  }`}
                  title="ออกจากระบบสารบัญ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {viewMode === 'public' && (
              <div className={`flex items-center space-x-1.5 text-xs border px-3 py-1.5 rounded-xl font-mono ${
                isLight
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">โรงเรียนฝางวิทยายน</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
