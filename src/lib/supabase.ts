import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DocumentItem, DocumentFilter, UserRole } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isDemoMode = process.env.NEXT_PUBLIC_IS_DEMO === 'true';

// In Demo Mode, force offline mock mode so zero network requests are made!
export const isRealSupabaseConfigured =
  !isDemoMode &&
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes('demo') &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.includes('demo');

export const supabase: SupabaseClient | null = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial seed mock documents used strictly for Demo / Pure Static mode
const MOCK_INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-101',
    doc_no: 'ศธ 04123/2568-0001',
    fiscal_year: 2568,
    doc_type: 'receive',
    title: 'คำสั่งอนุมัติจัดซื้อจัดจ้างเครื่องคอมพิวเตอร์และระบบเครือข่าย ประจำปี 2568',
    sender: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา',
    recipient: 'โรงเรียนตัวอย่าง (Demo School)',
    doc_date: '2025-01-15',
    confidentiality_level: 'normal',
    urgency_level: 'urgent',
    category: 'การเงิน/พัสดุ',
    summary: '1. อนุมัติจัดซื้อคอมพิวเตอร์ 30 เครื่อง\n2. กำหนดให้ดำเนินการเสร็จสิ้นในไตรมาส 3\n3. รายงานผลการจัดซื้อจัดจ้างให้เขตฯ ทราบ',
    drive_file_id: 'gdrive-file-101',
    drive_view_link: 'https://drive.google.com/file/d/gdrive-file-101/view',
    file_name: 'คำสั่งจัดซื้อคอมพิวเตอร์_2568.pdf',
    file_size: 2450120,
    mime_type: 'application/pdf',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'doc-102',
    doc_no: 'ศธ 04123/2568-0002',
    fiscal_year: 2568,
    doc_type: 'receive',
    title: 'แจ้งผลการประเมินวิทยฐานะเชี่ยวชาญ (ครู คศ.3 -> คศ.4)',
    sender: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
    recipient: 'กลุ่มงานบริหารบุคคล โรงเรียนตัวอย่าง',
    doc_date: '2025-02-01',
    confidentiality_level: 'secret',
    urgency_level: 'super_urgent',
    category: 'บริหารบุคคล',
    summary: '1. แจ้งรายชื่อครูที่ผ่านการประเมินวิทยฐานะเชี่ยวชาญ\n2. เอกสารส่วนบุคคลที่มีผลต่อการปรับระดับเงินเดือน\n3. ห้ามเผยแพร่แก่บุคคลภายนอก (ลับเฉพาะ)',
    drive_file_id: 'gdrive-file-102',
    drive_view_link: 'https://drive.google.com/file/d/gdrive-file-102/view',
    file_name: 'ผลประเมินวิทยฐานะ_ลับ.pdf',
    file_size: 1890400,
    mime_type: 'application/pdf',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

let inMemoryDocuments: DocumentItem[] = [...MOCK_INITIAL_DOCUMENTS];
type RealtimeCallback = (docs: DocumentItem[]) => void;
const listeners: Set<RealtimeCallback> = new Set();

export function subscribeToDocumentChanges(callback: RealtimeCallback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => cb([...inMemoryDocuments]));
}

/**
 * Filter Documents by Multi-Year FTS Search & RBAC Security Policy
 */
export async function getFilteredDocuments(
  filter: DocumentFilter,
  userRole: UserRole
): Promise<DocumentItem[]> {
  if (supabase) {
    try {
      let query = supabase.from('documents').select('*');

      if (userRole === 'teacher') {
        query = query.eq('confidentiality_level', 'normal');
      }

      if (filter.fiscalYear !== 'all') {
        query = query.eq('fiscal_year', filter.fiscalYear);
      }
      if (filter.confidentiality !== 'all') {
        query = query.eq('confidentiality_level', filter.confidentiality);
      }
      if (filter.urgency !== 'all') {
        query = query.eq('urgency_level', filter.urgency);
      }
      if (filter.docType !== 'all') {
        query = query.eq('doc_type', filter.docType);
      }
      if (filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }
      if (filter.searchQuery.trim() !== '') {
        query = query.or(
          `title.ilike.%${filter.searchQuery}%,doc_no.ilike.%${filter.searchQuery}%,sender.ilike.%${filter.searchQuery}%,recipient.ilike.%${filter.searchQuery}%,summary.ilike.%${filter.searchQuery}%`
        );
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data as DocumentItem[];
      } else if (error) {
        console.error('Supabase query error:', error.message);
      }
    } catch (e) {
      console.warn('Real Supabase query exception:', e);
    }
  }

  // Fallback in-memory dataset (Pure Static Demo Mode)
  return inMemoryDocuments.filter((doc) => {
    if (userRole === 'teacher' && doc.confidentiality_level !== 'normal') {
      return false;
    }

    if (filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase();
      const matchNo = doc.doc_no.toLowerCase().includes(q);
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchSender = doc.sender.toLowerCase().includes(q);
      const matchRecipient = doc.recipient.toLowerCase().includes(q);
      const matchSummary = doc.summary.toLowerCase().includes(q);
      const matchCategory = doc.category.toLowerCase().includes(q);
      if (!matchNo && !matchTitle && !matchSender && !matchRecipient && !matchSummary && !matchCategory) {
        return false;
      }
    }

    if (filter.fiscalYear !== 'all' && doc.fiscal_year !== filter.fiscalYear) return false;
    if (filter.confidentiality !== 'all' && doc.confidentiality_level !== filter.confidentiality) return false;
    if (filter.urgency !== 'all' && doc.urgency_level !== filter.urgency) return false;
    if (filter.docType !== 'all' && doc.doc_type !== filter.docType) return false;
    if (filter.category !== 'all' && doc.category !== filter.category) return false;

    return true;
  });
}

/**
 * Auto Index Generator
 */
export async function generateAtomicDocNumber(fiscalYear: number, prefix: string = 'ศธ'): Promise<string> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_next_doc_number', {
        p_fiscal_year: fiscalYear,
        p_doc_type: 'receive',
        p_prefix: prefix,
      });

      if (!error && data) {
        return data as string;
      }
    } catch (e) {
      console.warn('Supabase RPC get_next_doc_number fallback:', e);
    }
  }

  const yearDocs = inMemoryDocuments.filter((d) => d.fiscal_year === fiscalYear);
  const nextSeq = yearDocs.length + 1;
  const formattedSeq = String(nextSeq).padStart(4, '0');
  return `${prefix} 04123/${fiscalYear}-${formattedSeq}`;
}

/**
 * Create New Document (Pure Static In-Memory fallback for Demo)
 */
export async function createDocument(
  doc: Omit<DocumentItem, 'id' | 'created_at' | 'updated_at'>,
  userRole: UserRole
): Promise<DocumentItem> {
  if (userRole === 'teacher') {
    throw new Error('ไม่อนุญาต: สิทธิ์ครูผู้สอน (Teacher) ไม่สามารถสร้างเอกสารสารบัญได้');
  }

  const cleanDoc = {
    doc_no: doc.doc_no,
    fiscal_year: doc.fiscal_year,
    doc_type: doc.doc_type,
    title: doc.title,
    sender: doc.sender,
    recipient: doc.recipient,
    doc_date: doc.doc_date,
    confidentiality_level: doc.confidentiality_level,
    urgency_level: doc.urgency_level,
    category: doc.category,
    summary: doc.summary,
    drive_file_id: doc.drive_file_id,
    drive_view_link: doc.drive_view_link,
    file_name: doc.file_name,
    file_size: doc.file_size,
    mime_type: doc.mime_type,
    created_by: null,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('documents')
      .insert([cleanDoc])
      .select()
      .single();

    if (!error && data) {
      notifyListeners();
      return data as DocumentItem;
    } else if (error) {
      console.error('Supabase Document Insert Failed:', error.message);
    }
  }

  const newDoc: DocumentItem = {
    ...cleanDoc,
    id: 'doc-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryDocuments.unshift(newDoc);
  notifyListeners();
  return newDoc;
}

/**
 * Delete Document
 */
export async function deleteDocument(docId: string, userRole: UserRole): Promise<boolean> {
  if (userRole === 'teacher') {
    throw new Error('ไม่อนุญาต: สิทธิ์ครูผู้สอนไม่มีอำนาจในการลบหนังสือราชการ');
  }

  if (supabase) {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) {
      console.error('Supabase Document Delete Failed:', error.message);
    }
  }

  inMemoryDocuments = inMemoryDocuments.filter((d) => d.id !== docId);
  notifyListeners();
  return true;
}
