'use client';

import React from 'react';
import { DocumentItem } from '@/lib/types';
import { Download, X, Eye, FileText, ExternalLink } from 'lucide-react';

interface DocumentPreviewModalProps {
  doc: DocumentItem;
  currentRole?: string;
  currentUserName?: string;
  isDownloadMode?: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  doc,
  onClose,
}) => {
  const fileUrl = doc.drive_view_link || `https://drive.google.com/file/d/${doc.drive_file_id}/view`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">{doc.doc_no}</span>
                <span className="text-xs text-slate-400 font-normal">| {doc.doc_date}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{doc.title}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดใน Google Drive</span>
            </a>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer (Instant Google Drive Embed or Details) */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-2 overflow-hidden">
          {doc.drive_file_id && !doc.drive_file_id.includes('gdrive-file-') ? (
            <iframe
              src={`https://drive.google.com/file/d/${doc.drive_file_id}/preview`}
              className="w-full h-full rounded-xl border border-slate-800 bg-white"
              title="PDF Preview"
            />
          ) : (
            <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4" />
                <span>{doc.doc_no}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100 mb-1">{doc.title}</h4>
                <p className="text-slate-400">ลงวันที่: {doc.doc_date} (ปีงบประมาณ {doc.fiscal_year})</p>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                <div><strong className="text-slate-400">จาก:</strong> {doc.sender}</div>
                <div><strong className="text-slate-400">ถึง:</strong> {doc.recipient}</div>
                <div><strong className="text-slate-400">หมวดหมู่:</strong> {doc.category}</div>
                <div><strong className="text-slate-400">ชั้นความลับ:</strong> {doc.confidentiality_level}</div>
              </div>
              <div className="space-y-1">
                <strong className="text-slate-400">สรุปสาระสำคัญ:</strong>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {doc.summary}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>ชื่อไฟล์: {doc.file_name}</div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-sans text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลดเอกสาร</span>
          </a>
        </div>
      </div>
    </div>
  );
};
