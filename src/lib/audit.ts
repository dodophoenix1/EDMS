import { AuditLogItem, UserRole } from './types';

// In-memory audit log store for demo/fallback mode
let mockAuditLogs: AuditLogItem[] = [
  {
    id: 'log-001',
    user_id: 'usr-admin-1',
    user_name: 'นายสมชาย ใจดี (ผอ.โรงเรียน)',
    user_role: 'super_admin',
    action: 'CREATE',
    document_id: 'doc-101',
    details: 'สร้างหนังสือรับ ศธ 04123/2567-0001 (คำสั่งจัดตั้งงบประมาณ พ.ศ. 2567)',
    ip_address: '192.168.1.100',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log-002',
    user_id: 'usr-reg-1',
    user_name: 'นางสาวสุดา สารบรรณ',
    user_role: 'registrar',
    action: 'VIEW',
    document_id: 'doc-102',
    details: 'เปิดดูเอกสาร ศธ 04123/2567-0002 (แจ้งผลการประเมินวิทยฐานะครู)',
    ip_address: '192.168.1.105',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log-003',
    user_id: 'usr-teacher-1',
    user_name: 'นายวิชัย สอนดี (ครู คศ.2)',
    user_role: 'teacher',
    action: 'SEARCH',
    details: 'ค้นหาเอกสารคำว่า "งบประมาณ 2567"',
    ip_address: '192.168.1.120',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export async function recordAuditLog(log: {
  userId: string;
  userName: string;
  userRole: UserRole | string;
  action: 'VIEW' | 'DOWNLOAD' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SEARCH';
  documentId?: string;
  details: string;
  ipAddress?: string;
}): Promise<AuditLogItem> {
  const newEntry: AuditLogItem = {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    user_id: log.userId,
    user_name: log.userName,
    user_role: log.userRole,
    action: log.action,
    document_id: log.documentId,
    details: log.details,
    ip_address: log.ipAddress || '182.52.14.99',
    created_at: new Date().toISOString(),
  };

  mockAuditLogs.unshift(newEntry);
  return newEntry;
}

export function getAuditLogs(): AuditLogItem[] {
  return [...mockAuditLogs];
}
