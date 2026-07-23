'use client';

import React, { useState } from 'react';
import { UserRole, DocumentItem } from '@/lib/types';
import { Header } from '@/components/Header';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { DocumentList } from '@/components/DocumentList';
import { PublicSearchSection } from '@/components/PublicSearchSection';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
import { PublicPinGateModal } from '@/components/PublicPinGateModal';
import { AdminPinModal } from '@/components/AdminPinModal';
import { FileText, ShieldCheck, HardDrive, Cpu } from 'lucide-react';

export default function Home() {
  // Theme State: Default to Light Mode for clear & comfortable reading
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Gate 1: Main Website Access PIN (1234)
  const [isPublicPinAuthenticated, setIsPublicPinAuthenticated] = useState<boolean>(false);

  // Gate 2: Admin Portal Passcode (admin2569)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<'documents' | 'audit_logs'>('documents');

  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [currentUserName, setCurrentUserName] = useState<string>('นายสมชาย ใจดี (ผู้อำนวยการโรงเรียนฝางวิทยายน)');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [previewState, setPreviewState] = useState<{
    doc: DocumentItem;
    isDownload: boolean;
  } | null>(null);

  const isLight = theme === 'light';

  const handleRoleChange = (role: UserRole, name: string) => {
    setCurrentRole(role);
    setCurrentUserName(name);
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setViewMode('admin');
    } else {
      setShowAdminModal(true);
    }
  };

  const handlePublicClick = () => {
    setViewMode('public');
  };

  const handleAdminSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminModal(false);
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setViewMode('public');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* GATE 1: Public Website Access Gate (PIN Verification) */}
      {!isPublicPinAuthenticated && (
        <PublicPinGateModal onSuccess={() => setIsPublicPinAuthenticated(true)} />
      )}

      {/* Main Website Header */}
      <Header
        viewMode={viewMode}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminClick={handleAdminClick}
        onPublicClick={handlePublicClick}
        onAdminLogout={handleAdminLogout}
        adminTab={adminTab}
        onAdminTabChange={setAdminTab}
        currentRole={currentRole}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PUBLIC SEARCH VIEW ( Shown after PIN 1234 verification ) */}
        {viewMode === 'public' && isPublicPinAuthenticated && (
          <PublicSearchSection
            onPreview={(doc) => setPreviewState({ doc, isDownload: false })}
            onDownload={(doc) => setPreviewState({ doc, isDownload: true })}
            theme={theme}
          />
        )}

        {/* ADMIN PORTAL VIEW ( Shown after admin2569 passcode verification ) */}
        {viewMode === 'admin' && isAdminAuthenticated && (
          <div className="space-y-6">
            {/* RBAC Role Switcher */}
            <RoleSwitcher
              currentRole={currentRole}
              currentUserName={currentUserName}
              onRoleChange={handleRoleChange}
            />

            {/* Admin Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`border rounded-xl p-3.5 shadow-sm flex items-center space-x-3 transition-colors ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
              }`}>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>โรงเรียนฝางวิทยายน</div>
                  <div className="text-sm font-bold font-mono text-emerald-600">Supabase Connected</div>
                </div>
              </div>

              <div className={`border rounded-xl p-3.5 shadow-sm flex items-center space-x-3 transition-colors ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
              }`}>
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-600">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Google Drive Folder</div>
                  <div className="text-sm font-bold font-mono text-sky-600">Direct Upload</div>
                </div>
              </div>

              <div className={`border rounded-xl p-3.5 shadow-sm flex items-center space-x-3 transition-colors ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
              }`}>
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Gemini 1.5 Flash</div>
                  <div className="text-sm font-bold font-mono text-purple-600">AI OCR Active</div>
                </div>
              </div>

              <div className={`border rounded-xl p-3.5 shadow-sm flex items-center space-x-3 transition-colors ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
              }`}>
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Admin Portal</div>
                  <div className="text-sm font-bold font-mono text-indigo-600">Authenticated</div>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            {adminTab === 'documents' ? (
              <DocumentList
                currentRole={currentRole}
                currentUserName={currentUserName}
                onPreview={(doc) => setPreviewState({ doc, isDownload: false })}
                onDownload={(doc) => setPreviewState({ doc, isDownload: true })}
              />
            ) : (
              <AuditLogViewer />
            )}
          </div>
        )}
      </main>

      {/* GATE 2: Admin Portal Passcode Modal */}
      {showAdminModal && (
        <AdminPinModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={handleAdminSuccess}
        />
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <DocumentUploadModal
          currentRole={currentRole}
          currentUserName={currentUserName}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
          }}
        />
      )}

      {/* Preview / Download Modal */}
      {previewState && (
        <DocumentPreviewModal
          doc={previewState.doc}
          currentRole={currentRole}
          currentUserName={currentUserName}
          isDownloadMode={previewState.isDownload}
          onClose={() => setPreviewState(null)}
        />
      )}

      {/* Footer */}
      <footer className={`border-t py-4 text-center text-xs font-mono transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-900 text-slate-500'
      }`}>
        โรงเรียนฝางวิทยายน | Electronic Document Management System (EDMS) | Powered by Supabase & Google Drive
      </footer>
    </div>
  );
}
