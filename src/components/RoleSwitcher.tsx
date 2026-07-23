'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import { ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  currentUserName: string;
  onRoleChange: (role: UserRole, name: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  currentUserName,
  onRoleChange,
}) => {
  const roles: { role: UserRole; name: string; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    {
      role: 'super_admin',
      name: 'นายสมชาย ใจดี (ผู้อำนวยการโรงเรียน)',
      label: 'Super Admin (ผอ./แอดมิน)',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      desc: 'สิทธิ์สูงสุด: ดูได้ทุกชั้นความลับ, เพิ่ม, แก้ไข, ลบเอกสาร, ดู Audit Log',
      color: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
    },
    {
      role: 'registrar',
      name: 'นางสาวสุดา สารบรรณ (เจ้าหน้าที่สารบัญ)',
      label: 'Registrar (งานสารบัญ)',
      icon: <UserCheck className="w-4 h-4 text-sky-400" />,
      desc: 'สิทธิ์สารบัญ: อัปโหลดเอกสาร, ออกเลขรับ-ส่งอัตโนมัติ, จัดการเอกสาร',
      color: 'bg-sky-950/80 border-sky-500/50 text-sky-300',
    },
    {
      role: 'teacher',
      name: 'นายวิชัย สอนดี (ครูผู้สอน)',
      label: 'Teacher (ครูผู้สอน)',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      desc: 'สิทธิ์จำกัด (RLS Enforced): ดูได้เฉพาะเอกสารสาธารณะ (ห้ามเห็นเอกสารลับ/ประเมิน/เงินเดือน)',
      color: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h3 className="text-sm font-semibold text-slate-200">จำลองสิทธิ์การใช้งาน (Supabase RLS & RBAC Demo)</h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          ผู้ใช้งานปัจจุบัน: <strong className="text-emerald-400">{currentUserName}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((r) => {
          const isSelected = currentRole === r.role;
          return (
            <button
              key={r.role}
              onClick={() => onRoleChange(r.role, r.name)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? `${r.color} ring-2 ring-emerald-500/50 shadow-lg scale-[1.02]`
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center space-x-2 font-medium text-sm">
                  {r.icon}
                  <span>{r.label}</span>
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-snug">{r.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
