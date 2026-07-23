'use client';

import React, { useState, useEffect } from 'react';
import { DocumentItem, DocumentFilter, DocType } from '@/lib/types';
import { getFilteredDocuments } from '@/lib/supabase';
import { Search, Filter, Eye, Download, Sparkles, Clock, FileText, Building2 } from 'lucide-react';

interface PublicSearchSectionProps {
  onPreview: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
  theme: 'light' | 'dark';
}

export const PublicSearchSection: React.FC<PublicSearchSectionProps> = ({
  onPreview,
  onDownload,
  theme,
}) => {
  const isLight = theme === 'light';
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSummaryDoc, setSelectedSummaryDoc] = useState<DocumentItem | null>(null);

  const [filter, setFilter] = useState<DocumentFilter>({
    searchQuery: '',
    fiscalYear: 'all',
    confidentiality: 'all',
    urgency: 'all',
    docType: 'all',
    category: 'all',
  });

  const fetchDocs = async () => {
    setLoading(true);
    const docs = await getFilteredDocuments(filter, 'teacher');
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [filter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search Hero Card */}
      <div className={`border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800'
      }`}>
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 border rounded-full text-xs font-semibold mb-1 ${
            isLight
              ? 'bg-emerald-100/80 border-emerald-200 text-emerald-800'
              : 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
          }`}>
            <Building2 className="w-3.5 h-3.5" />
            <span>ระบบสารบัญดิจิทัล โรงเรียนฝางวิทยายน</span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
            ค้นหาหนังสือราชการและเอกสารคำสั่ง
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            ค้นหาเอกสารคำสั่งโรงเรียน, ประกาศ, บันทึกข้อความ ย้อนหลัง รวดเร็วและถูกต้อง
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            placeholder="พิมพ์เรื่องหนังสือ, เลขที่เอกสาร, ผู้ส่ง หรือสรุปเนื้อหา..."
            className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                : 'bg-slate-950/90 border-slate-700/80 text-white placeholder-slate-500 shadow-inner'
            }`}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2 text-xs">
          <div>
            <label className={`block text-[10px] mb-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ปีงบประมาณ</label>
            <select
              value={filter.fiscalYear}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  fiscalYear: e.target.value === 'all' ? 'all' : parseInt(e.target.value),
                })
              }
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <option value="all">ทุกปีงบประมาณ</option>
              <option value="2568">ปี 2568</option>
              <option value="2567">ปี 2567</option>
              <option value="2566">ปี 2566</option>
            </select>
          </div>

          <div>
            <label className={`block text-[10px] mb-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ประเภทหนังสือ</label>
            <select
              value={filter.docType}
              onChange={(e) =>
                setFilter({ ...filter, docType: e.target.value as DocType | 'all' })
              }
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <option value="all">ทุกประเภท</option>
              <option value="receive">หนังสือรับ</option>
              <option value="send">หนังสือส่ง</option>
              <option value="internal">บันทึกภายใน</option>
            </select>
          </div>

          <div>
            <label className={`block text-[10px] mb-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>หมวดหมู่เอกสาร</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="ทั่วไป">ทั่วไป</option>
              <option value="วิชาการ">วิชาการ</option>
              <option value="บริหารบุคคล">บริหารบุคคล</option>
              <option value="การเงิน/พัสดุ">การเงิน/พัสดุ</option>
            </select>
          </div>

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
              className={`w-full flex items-center justify-center space-x-1 py-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 font-medium'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document List Container */}
      <div className={`border rounded-2xl overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-2xl'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800/80'
        }`}>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
              รายการหนังสือราชการ โรงเรียนฝางวิทยายน ({documents.length} รายการ)
            </h3>
          </div>
          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Public View
          </span>
        </div>

        <div className={`divide-y text-xs ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
          {loading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>กำลังค้นหาเอกสาร...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto opacity-30" />
              <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                ไม่พบรายการหนังสือราชการตามเงื่อนไขที่ระบุ
              </p>
              <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองปีงบประมาณ</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-600 text-sm">{doc.doc_no}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-slate-100 text-slate-600 border-slate-200 font-medium'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      ปีงบ {doc.fiscal_year}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-slate-100 text-slate-600 border-slate-200 font-medium'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {doc.category}
                    </span>
                  </div>

                  <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {doc.title}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {doc.summary}
                  </p>

                  <div className={`flex items-center space-x-4 text-[11px] pt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    <span><strong>จาก:</strong> {doc.sender}</span>
                    <span><strong>ถึง:</strong> {doc.recipient}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {doc.doc_date}
                    </span>
                  </div>

                  {doc.summary && (
                    <button
                      onClick={() => setSelectedSummaryDoc(doc)}
                      className="mt-1 text-[11px] text-purple-600 hover:text-purple-700 flex items-center font-medium"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> ดูสรุปสาระสำคัญโดย Gemini AI
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onPreview(doc)}
                    className={`px-3.5 py-2 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-semibold ${
                      isLight
                        ? 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 shadow-sm'
                        : 'bg-slate-800 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300 border-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>เปิดดู Preview</span>
                  </button>

                  <button
                    onClick={() => onDownload(doc)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors flex items-center space-x-1.5 text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด PDF</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Gemini AI Summary Modal */}
      {selectedSummaryDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-purple-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">สรุปสาระสำคัญโดย Gemini AI</h3>
              </div>
              <button
                onClick={() => setSelectedSummaryDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono px-2 py-1 bg-slate-100 rounded"
              >
                ✕ ปิด
              </button>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-600 font-mono mb-1">{selectedSummaryDoc.doc_no}</h4>
              <p className="text-sm font-bold text-slate-900 mb-3">{selectedSummaryDoc.title}</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                {selectedSummaryDoc.summary}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
