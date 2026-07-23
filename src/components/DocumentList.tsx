'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentItem,
  DocumentFilter,
  UserRole,
  ConfidentialityLevel,
  UrgencyLevel,
  DocType,
} from '@/lib/types';
import { getFilteredDocuments, deleteDocument } from '@/lib/supabase';
import { recordAuditLog } from '@/lib/audit';
import {
  Search,
  Filter,
  FileText,
  Eye,
  Download,
  Trash2,
  Lock,
  Clock,
  Zap,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface DocumentListProps {
  currentRole: UserRole;
  currentUserName: string;
  onPreview: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  currentRole,
  currentUserName,
  onPreview,
  onDownload,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [queryLatencyMs, setQueryLatencyMs] = useState<number>(0);
  const [selectedSummaryDoc, setSelectedSummaryDoc] = useState<DocumentItem | null>(null);

  const [filter, setFilter] = useState<DocumentFilter>({
    searchQuery: '',
    fiscalYear: 'all',
    confidentiality: 'all',
    urgency: 'all',
    docType: 'all',
    category: 'all',
  });

  // Multi-Year FTS Search Execution (<100ms PostgreSQL FTS)
  useEffect(() => {
    let isMounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      const startTime = performance.now();
      const docs = await getFilteredDocuments(filter, currentRole);
      const endTime = performance.now();

      if (isMounted) {
        setDocuments(docs);
        setQueryLatencyMs(Math.round(endTime - startTime));
        setLoading(false);
      }
    };

    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, [filter, currentRole]);

  const handleDelete = async (doc: DocumentItem) => {
    if (!confirm(`คุณต้องการลบเอกสารเลขที่ ${doc.doc_no} ("${doc.title}") ใช่หรือไม่?`)) {
      return;
    }

    try {
      await deleteDocument(doc.id, currentRole);
      await recordAuditLog({
        userId: currentRole === 'super_admin' ? 'usr-admin-1' : 'usr-reg-1',
        userName: currentUserName,
        userRole: currentRole,
        action: 'DELETE',
        documentId: doc.id,
        details: `ลบเอกสารสารบัญ ${doc.doc_no} - "${doc.title}"`,
      });
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  const getConfidentialityBadge = (level: ConfidentialityLevel) => {
    switch (level) {
      case 'normal':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
            ปกติ
          </span>
        );
      case 'secret':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
            <Lock className="w-3 h-3 mr-1 text-amber-400" /> ลับ (Secret)
          </span>
        );
      case 'top_secret':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
            <ShieldAlert className="w-3 h-3 mr-1 text-rose-400" /> ลับที่สุด (Top Secret)
          </span>
        );
    }
  };

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'normal':
        return <span className="text-slate-400 text-xs">ปกติ</span>;
      case 'urgent':
        return <span className="text-amber-400 text-xs font-semibold">ด่วน</span>;
      case 'super_urgent':
        return <span className="text-rose-400 text-xs font-bold flex items-center"><Zap className="w-3 h-3 mr-0.5" /> ด่วนที่สุด</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* FTS Search Input */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
              placeholder="ค้นหาตามเลขที่, เรื่อง, ผู้ส่ง, หรือสรุปเนื้อหา..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* PostgreSQL FTS Latency Badge */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>PostgreSQL Full-Text Search:</span>
            <strong className="text-emerald-400">{queryLatencyMs} ms</strong>
            <span className="text-slate-600">(&lt; 100ms)</span>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t border-slate-800/60 text-xs">
          {/* Fiscal Year Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">ปีงบประมาณ</label>
            <select
              value={filter.fiscalYear}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  fiscalYear: e.target.value === 'all' ? 'all' : parseInt(e.target.value),
                })
              }
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">ทุกปีงบประมาณ</option>
              <option value="2568">2568</option>
              <option value="2567">2567</option>
              <option value="2566">2566</option>
            </select>
          </div>

          {/* Confidentiality Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">ชั้นความลับ</label>
            <select
              value={filter.confidentiality}
              onChange={(e) =>
                setFilter({ ...filter, confidentiality: e.target.value as ConfidentialityLevel | 'all' })
              }
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">ทุกชั้นความลับ</option>
              <option value="normal">ปกติ (Public)</option>
              <option value="secret">ลับ (Secret)</option>
              <option value="top_secret">ลับที่สุด (Top Secret)</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">ความเร่งด่วน</label>
            <select
              value={filter.urgency}
              onChange={(e) =>
                setFilter({ ...filter, urgency: e.target.value as UrgencyLevel | 'all' })
              }
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">ทุกความเร่งด่วน</option>
              <option value="normal">ปกติ</option>
              <option value="urgent">ด่วน</option>
              <option value="super_urgent">ด่วนที่สุด</option>
            </select>
          </div>

          {/* Doc Type Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">ประเภทหนังสือ</label>
            <select
              value={filter.docType}
              onChange={(e) =>
                setFilter({ ...filter, docType: e.target.value as DocType | 'all' })
              }
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">ทุกประเภท</option>
              <option value="receive">หนังสือรับ</option>
              <option value="send">หนังสือส่ง</option>
              <option value="internal">บันทึกข้อความ (ภายใน)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilter({
                  searchQuery: '',
                  fiscalYear: 'all',
                  confidentiality: 'all',
                  urgency: 'all',
                  docType: 'all',
                  category: 'all',
                })
              }
              className="w-full flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        </div>
      </div>

      {/* RLS Notification for Teacher Role */}
      {currentRole === 'teacher' && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-300 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Supabase RLS Enforced:</strong> คุณกำลังเข้าใช้งานในสิทธิ์ &quot;ครูผู้สอน&quot; ระบบกำลังซ่อนหนังสือที่มีชั้นความลับ &quot;ลับ&quot; และ &quot;ลับที่สุด&quot; (ประเมิน/เงินเดือน) อัตโนมัติในระดับ Database
          </span>
        </div>
      )}

      {/* Document Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">เลขที่หนังสือ / วันที่</th>
                <th className="py-3 px-4">เรื่อง / สาระสำคัญ AI</th>
                <th className="py-3 px-4">จาก &rarr; ถึง</th>
                <th className="py-3 px-4 text-center">ความลับ / เร่งด่วน</th>
                <th className="py-3 px-4 text-right">การจัดการ (DLP Watermarked)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังโหลดและกรองเอกสารด้วย FTS Index...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>ไม่พบรายการหนังสือราชการตามเงื่อนไขการค้นหา</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Doc No & Date */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-mono font-bold text-emerald-400">{doc.doc_no}</div>
                      <div className="text-[10px] text-slate-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {doc.doc_date} (ปีงบ {doc.fiscal_year})
                      </div>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.doc_type === 'receive' ? 'หนังสือรับ' : doc.doc_type === 'send' ? 'หนังสือส่ง' : 'บันทึกภายใน'}
                      </span>
                    </td>

                    {/* Title & Gemini Summary */}
                    <td className="py-3 px-4 align-top max-w-xs sm:max-w-sm">
                      <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {doc.title}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                        {doc.summary}
                      </div>
                      {doc.summary && (
                        <button
                          onClick={() => setSelectedSummaryDoc(doc)}
                          className="mt-1 text-[10px] text-purple-400 hover:text-purple-300 flex items-center font-mono"
                        >
                          <Sparkles className="w-3 h-3 mr-1 text-purple-400" /> ดูสรุป 3 บรรทัดโดย Gemini AI
                        </button>
                      )}
                    </td>

                    {/* Sender -> Recipient */}
                    <td className="py-3 px-4 align-top text-[11px] text-slate-300">
                      <div><strong className="text-slate-400">จาก:</strong> {doc.sender}</div>
                      <div className="mt-0.5"><strong className="text-slate-400">ถึง:</strong> {doc.recipient}</div>
                      <div className="text-[10px] text-slate-500 mt-1">หมวด: {doc.category}</div>
                    </td>

                    {/* Confidentiality & Urgency */}
                    <td className="py-3 px-4 align-top text-center space-y-1">
                      <div>{getConfidentialityBadge(doc.confidentiality_level)}</div>
                      <div>{getUrgencyBadge(doc.urgency_level)}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-top text-right space-x-1">
                      <button
                        onClick={() => onPreview(doc)}
                        className="p-1.5 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 rounded-lg border border-slate-700 transition-colors inline-flex items-center space-x-1"
                        title="เปิดดู PDF พร้อม Dynamic Watermark"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Preview</span>
                      </button>

                      <button
                        onClick={() => onDownload(doc)}
                        className="p-1.5 bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-300 rounded-lg border border-slate-700 transition-colors inline-flex items-center space-x-1"
                        title="ดาวน์โหลด PDF ติด Watermark ระบุชื่อผู้เปิด"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Download</span>
                      </button>

                      {currentRole !== 'teacher' && (
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors inline-flex items-center"
                          title="ลบเอกสาร"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gemini AI Summary Modal */}
      {selectedSummaryDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-purple-800/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-purple-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-100">สรุปสาระสำคัญโดย Gemini AI Flash</h3>
              </div>
              <button
                onClick={() => setSelectedSummaryDoc(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 bg-slate-800 rounded"
              >
                ✕ ปิด
              </button>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 font-mono mb-1">{selectedSummaryDoc.doc_no}</h4>
              <p className="text-sm font-semibold text-slate-200 mb-3">{selectedSummaryDoc.title}</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedSummaryDoc.summary}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              Powered by @google/generative-ai (Gemini Flash API)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
