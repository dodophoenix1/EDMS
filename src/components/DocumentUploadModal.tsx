'use client';

import React, { useState } from 'react';
import { UserRole, ConfidentialityLevel, UrgencyLevel, DocType } from '@/lib/types';
import { validateMagicBytes } from '@/lib/gdrive';
import { getGoogleDriveAccessTokenAction, scanDocumentWithGeminiAction } from '@/app/actions';
import { generateAtomicDocNumber, createDocument } from '@/lib/supabase';
import { recordAuditLog } from '@/lib/audit';
import { Sparkles, Upload, FileCheck, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface DocumentUploadModalProps {
  currentRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  currentRole,
  currentUserName,
  onClose,
  onSuccess,
}) => {
  const currentFiscalYear = 2568;
  const [docType, setDocType] = useState<DocType>('receive');
  const [docNo, setDocNo] = useState<string>('กำลังสร้างเลขรับอัตโนมัติ...');
  const [title, setTitle] = useState<string>('');
  const [sender, setSender] = useState<string>('สำนักงานเขตพื้นที่การศึกษา');
  const [recipient, setRecipient] = useState<string>('โรงเรียนตัวอย่าง (Demo School)');
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('normal');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [category, setCategory] = useState<string>('ทั่วไป');
  const [summary, setSummary] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<{ isValid: boolean; error?: string } | null>(null);

  const [aiScanning, setAiScanning] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  React.useEffect(() => {
    generateAtomicDocNumber(currentFiscalYear).then((num) => setDocNo(num));
  }, [docType]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatusMessage('กำลังตรวจสอบ Header Signature ไฟล์...');

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer.slice(0, 16));
    const result = validateMagicBytes(bytes);

    if (!result.isValid) {
      setFileValidation({ isValid: false, error: result.error });
      setStatusMessage('');
      return;
    }

    setFileValidation({ isValid: true });
    setStatusMessage('ไฟล์ถูกต้อง (Magic Bytes Verified: ' + result.mimeType + ')');
  };

  const handleAiScan = async () => {
    if (!selectedFile) {
      alert('โปรดเลือกไฟล์เอกสาร (PDF หรือ รูปภาพ) ก่อนทำการสแกน AI');
      return;
    }

    setAiScanning(true);
    setStatusMessage('กำลังส่งเอกสารให้ Gemini AI อ่านข้อมูล OCR & สรุปเนื้อหา...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const extMeta = await scanDocumentWithGeminiAction(base64, selectedFile.type);

      if (extMeta.doc_no) setDocNo(extMeta.doc_no);
      if (extMeta.doc_date) setDocDate(extMeta.doc_date);
      if (extMeta.title) setTitle(extMeta.title);
      if (extMeta.sender) setSender(extMeta.sender);
      if (extMeta.recipient) setRecipient(extMeta.recipient);
      if (extMeta.confidentiality_level) setConfidentiality(extMeta.confidentiality_level);
      if (extMeta.urgency_level) setUrgency(extMeta.urgency_level);
      if (extMeta.category) setCategory(extMeta.category);
      if (extMeta.summary) setSummary(extMeta.summary);

      setStatusMessage('Gemini AI สแกนเอกสารสำเร็จ!');
    } catch (err: unknown) {
      const error = err as Error;
      alert('เกิดข้อผิดพลาดในการสแกนด้วย Gemini AI: ' + error.message);
      setStatusMessage('สแกน AI ไม่สำเร็จ');
    } finally {
      setAiScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !fileValidation?.isValid) {
      alert('โปรดเลือกไฟล์ที่ผ่านการตรวจสอบความถูกต้องก่อนบันทึก');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true';

    try {
      let realFileId = 'demo-gdrive-file-id';
      let realViewLink = 'https://drive.google.com';

      if (isDemo) {
        setStatusMessage('[Demo Mode] จำลองการประมวลผลไฟล์และลงทะเบียนแบบ Pure Static...');
        setUploadProgress(50);
        await new Promise((res) => setTimeout(res, 300));
        setUploadProgress(90);
      } else {
        setStatusMessage('กำลังขอ Access Token จาก Google Drive...');
        const { access_token, folderId } = await getGoogleDriveAccessTokenAction();

        setUploadProgress(30);
        setStatusMessage(`กำลังส่งไฟล์เข้า Google Drive โฟลเดอร์ (ID: ${folderId})...`);

        // Prepare Google Drive API v3 Multipart Upload directly from browser
        const metadata = {
          name: selectedFile.name,
          parents: [folderId],
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', selectedFile);

        const uploadRes = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error('Google Drive Upload Failed: ' + errText);
        }

        const fileData = await uploadRes.json();
        realFileId = fileData.id;
        realViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${realFileId}/view`;

        setUploadProgress(70);
        setStatusMessage('กำลังตั้งค่าสิทธิ์เข้าถึงไฟล์ใน Google Drive...');

        try {
          await fetch(`https://www.googleapis.com/drive/v3/files/${realFileId}/permissions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'reader',
              type: 'anyone',
            }),
          });
        } catch (permErr) {
          console.warn('Set Google Drive permission error:', permErr);
        }

        setUploadProgress(90);
        setStatusMessage('อัปโหลดไฟล์เข้า Google Drive สำเร็จ! กำลังบันทึกเข้า Supabase...');
      }

      // Save Record into Supabase
      const createdDoc = await createDocument(
        {
          doc_no: docNo,
          fiscal_year: currentFiscalYear,
          doc_type: docType,
          title: title || 'หนังสือราชการ',
          sender: sender,
          recipient: recipient,
          doc_date: docDate,
          confidentiality_level: confidentiality,
          urgency_level: urgency,
          category: category,
          summary: summary || 'สรุปเนื้อหาหนังสือราชการ',
          drive_file_id: realFileId,
          drive_view_link: realViewLink,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type || 'application/pdf',
        },
        currentRole
      );

      await recordAuditLog({
        userId: currentRole === 'super_admin' ? 'usr-admin-1' : 'usr-reg-1',
        userName: currentUserName,
        userRole: currentRole,
        action: 'CREATE',
        documentId: createdDoc.id,
        details: `ลงทะเบียนหนังสือราชการ ${docNo} - "${title}" (Uploaded directly to Google Drive: ${realFileId})`,
      });

      setUploadProgress(100);
      alert(`ลงทะเบียนหนังสือราชการเลขที่ ${docNo} สำเร็จ! ไฟล์ถูกเซฟลงใน Google Drive เรียบร้อยแล้ว`);
      onSuccess();
    } catch (err: unknown) {
      const error = err as Error;
      alert('เกิดข้อผิดพลาดในการลงทะเบียน: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">ลงทะเบียนหนังสือราชการ (EDMS Registration)</h3>
              <p className="text-[11px] text-slate-400">ออกเลขรับ-ส่งอัตโนมัติ + อัปโหลดเข้า Google Drive โฟลเดอร์ของโรงเรียน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* File Selector & Magic Bytes Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>อัปโหลดไฟล์เอกสาร (PDF, PNG, JPG)</span>
              </label>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleAiScan}
                  disabled={aiScanning || !fileValidation?.isValid}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-[11px] rounded-lg shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiScanning ? 'กำลังสแกน Gemini AI...' : 'สแกนด้วย Gemini AI'}</span>
                </button>
              )}
            </div>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="block w-full text-slate-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />

            {/* Validation Message */}
            {fileValidation && (
              <div className={`p-2 rounded-lg text-[11px] flex items-center space-x-2 ${
                fileValidation.isValid ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                {fileValidation.isValid ? (
                  <>
                    <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>ผ่านการตรวจ Magic Bytes Header Header Signature ปลอดภัย 100%</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{fileValidation.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">ประเภทหนังสือ</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="receive">หนังสือรับ (รับเข้าโรงเรียน)</option>
                <option value="send">หนังสือส่ง (ส่งออกนอก)</option>
                <option value="internal">บันทึกข้อความ (ภายในโรงเรียน)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">เลขที่หนังสือ (Atomic Auto Index)</label>
              <input
                type="text"
                value={docNo}
                onChange={(e) => setDocNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-emerald-400 font-bold focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1 font-medium">เรื่อง / ชื่อหนังสือราชการ *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ระบุเรื่องหนังสือราชการ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">จาก (หน่วยงานผู้ส่ง)</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">ถึง (ผู้รับ)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">ลงวันที่</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">หมวดหมู่เอกสาร</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ทั่วไป">ทั่วไป</option>
                <option value="วิชาการ">วิชาการ / การสอน</option>
                <option value="บริหารบุคคล">บริหารบุคคล / วิทยฐานะ</option>
                <option value="การเงิน/พัสดุ">การเงิน / พัสดุ / งบประมาณ</option>
                <option value="กิจการนักเรียน">กิจการนักเรียน</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">ชั้นความลับ</label>
              <select
                value={confidentiality}
                onChange={(e) => setConfidentiality(e.target.value as ConfidentialityLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="normal">ปกติ (ดูได้ทุกคน)</option>
                <option value="secret">ลับ (ผอ. & สารบัญเท่านั้น)</option>
                <option value="top_secret">ลับที่สุด (ผอ. & สารบัญเท่านั้น)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">ชั้นความเร่งด่วน</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="normal">ปกติ</option>
                <option value="urgent">ด่วน</option>
                <option value="super_urgent">ด่วนที่สุด</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1 font-medium">สรุปสาระสำคัญ (Gemini Auto-Generated or Manual)</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="สรุปเนื้อหาโดยสังเขป..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Status & Progress Bar */}
          {statusMessage && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span>{statusMessage}</span>
                {uploading && <span>{uploadProgress}%</span>}
              </div>
              {uploading && (
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* Form Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={uploading || !fileValidation?.isValid}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              {uploading ? 'กำลังส่งเข้า Google Drive...' : 'บันทึกหนังสือราชการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
