export type UserRole = 'super_admin' | 'registrar' | 'teacher';

export type DocType = 'receive' | 'send' | 'internal';

export type ConfidentialityLevel = 'normal' | 'secret' | 'top_secret';

export type UrgencyLevel = 'normal' | 'urgent' | 'super_urgent';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  position: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  doc_no: string;
  fiscal_year: number;
  doc_type: DocType;
  title: string;
  sender: string;
  recipient: string;
  doc_date: string;
  confidentiality_level: ConfidentialityLevel;
  urgency_level: UrgencyLevel;
  category: string;
  summary: string;
  drive_file_id: string;
  drive_view_link: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: 'VIEW' | 'DOWNLOAD' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SEARCH';
  document_id?: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface DocumentFilter {
  searchQuery: string;
  fiscalYear: number | 'all';
  confidentiality: ConfidentialityLevel | 'all';
  urgency: UrgencyLevel | 'all';
  docType: DocType | 'all';
  category: string | 'all';
}

export interface ExtractedDocMetadata {
  doc_no: string;
  doc_date: string;
  title: string;
  sender: string;
  recipient: string;
  confidentiality_level: ConfidentialityLevel;
  urgency_level: UrgencyLevel;
  category: string;
  summary: string;
}
