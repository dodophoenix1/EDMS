'use server';

import { getGoogleDriveAccessToken } from '@/lib/gdrive';
import { scanDocumentWithGemini } from '@/lib/gemini';
import { ExtractedDocMetadata } from '@/lib/types';

/**
 * Server Action for Google Drive OAuth Access Token Issuance
 * Obtains fresh Access Token on Server so Client can upload file directly into Google Drive Folder!
 */
export async function getGoogleDriveAccessTokenAction() {
  return await getGoogleDriveAccessToken();
}

/**
 * Server Action for Gemini AI Document Scanning & OCR
 */
export async function scanDocumentWithGeminiAction(
  base64Content: string,
  mimeType: string
): Promise<ExtractedDocMetadata> {
  return await scanDocumentWithGemini(base64Content, mimeType);
}
