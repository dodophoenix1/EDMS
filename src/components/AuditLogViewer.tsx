'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '@/lib/types';
import { getAuditLogs } from '@/lib/audit';
import { History, ShieldCheck, Lock, Terminal, RefreshCw } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const reloadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    reloadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">CREATE</span>;
      case 'VIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">VIEW</span>;
      case 'DOWNLOAD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">DOWNLOAD</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">DELETE</span>;
      case 'SEARCH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">SEARCH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-100">Immutable Security Audit Logs</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Insert-Only / Read-Only (RLS Protected)
              </span>
            </div>
            <p className="text-xs text-slate-400">บันทึกประวัติการเข้าใช้งาน, การอัปโหลด, ดูเอกสาร และดาวน์โหลด ป้องกันการแก้ไขหรือลบ 100%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">ทุกประเภท Action</option>
            <option value="CREATE">CREATE (ลงทะเบียน)</option>
            <option value="VIEW">VIEW (เปิดดู)</option>
            <option value="DOWNLOAD">DOWNLOAD (ดาวน์โหลด)</option>
            <option value="DELETE">DELETE (ลบเอกสาร)</option>
            <option value="SEARCH">SEARCH (ค้นหา)</option>
          </select>

          <button
            onClick={reloadLogs}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="โหลดข้อมูลล่าสุด"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">วัน-เวลา (Timestamp)</th>
                <th className="py-3 px-4">ผู้ใช้งาน (User & Role)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">รายละเอียด (Audit Details)</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    <div>{log.user_name}</div>
                    <div className="text-[10px] text-slate-500 font-sans">Role: {log.user_role}</div>
                  </td>
                  <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-xs sm:max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Guarantee Note */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-400 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>PostgreSQL Audit Table configured without UPDATE or DELETE RLS policies. Audit entries are immutable.</span>
      </div>
    </div>
  );
};
