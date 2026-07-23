/**
 * Google Drive API v3 Token & Direct Storage Integration
 */

export interface MagicBytesCheckResult {
  isValid: boolean;
  mimeType: string;
  extension: string;
  error?: string;
}

/**
 * Validates file magic bytes (header signature)
 */
export function validateMagicBytes(buffer: Uint8Array): MagicBytesCheckResult {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, mimeType: 'unknown', extension: 'unknown', error: 'ขนาดไฟล์เล็กเกินไปหรือไม่ถูกต้อง' };
  }

  // PDF: %PDF-
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { isValid: true, mimeType: 'application/pdf', extension: 'pdf' };
  }

  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { isValid: true, mimeType: 'image/png', extension: 'png' };
  }

  // JPEG/JPG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isValid: true, mimeType: 'image/jpeg', extension: 'jpg' };
  }

  return {
    isValid: false,
    mimeType: 'unsupported',
    extension: 'unknown',
    error: 'อนุญาตเฉพาะไฟล์ PDF, PNG และ JPG เท่านั้น',
  };
}

/**
 * Obtains a fresh Google OAuth2 Access Token on Server
 */
export async function getGoogleDriveAccessToken(): Promise<{ access_token: string; folderId: string }> {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1n0Yg-njrV6D3vTc-MiFFJ1dRRqW1tCkw';

  if (!clientId || clientId.includes('demo') || !refreshToken || refreshToken.includes('demo')) {
    throw new Error('ยังไม่ได้ตั้งค่า Google Drive Client ID หรือ Refresh Token บน Server');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    console.error('Google OAuth token error:', errText);
    throw new Error('ไม่สามารถขอ Access Token จาก Google Drive ได้: ' + errText);
  }

  const data = await tokenResponse.json();
  return {
    access_token: data.access_token,
    folderId: folderId,
  };
}
