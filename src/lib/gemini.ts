import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedDocMetadata } from './types';

/**
 * AI Document Scanner using Gemini Flash API
 * Scans PDF/Images to automatically extract Thai official document metadata & 3-line summary.
 */
export async function scanDocumentWithGemini(
  base64Content: string,
  mimeType: string
): Promise<ExtractedDocMetadata> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback AI simulation for offline/demo key testing
  if (!apiKey || apiKey.includes('demo')) {
    await new Promise((res) => setTimeout(res, 1200)); // Simulate AI processing delay
    return {
      doc_no: 'ศธ 04123/' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      doc_date: new Date().toISOString().split('T')[0],
      title: 'อนุมัติจัดซื้ออุปกรณ์ห้องปฏิบัติการคอมพิวเตอร์และสื่อการสอนดิจิทัล',
      sender: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา',
      recipient: 'ผู้อำนวยการโรงเรียนเทศบาล 1',
      confidentiality_level: 'normal',
      urgency_level: 'urgent',
      category: 'วิชาการ/เทคโนโลยี',
      summary:
        '1. แจ้งอนุมัติงบประมาณปรับปรุงห้องปฏิบัติการคอมพิวเตอร์ จำนวน 500,000 บาท\n2. กำหนดให้โรงเรียนจัดซื้อจัดจ้างตามระเบียบพัสดุให้แล้วเสร็จภายในไตรมาสที่ 3\n3. ให้จัดส่งรายงานสรุปผลการดำเนินงานและภาพถ่ายให้เขตพื้นที่ฯ รับทราบ',
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `คุณคือระบบ AI สแกนเอกสารสารบัญหนังสือราชการไทย
โปรดวิเคราะห์รูปภาพ/PDF เอกสารราชการนี้ แล้วสกัดข้อมูลกลับมาในรูปแบบ JSON Object ภาษาไทย โดยมี Keys ต่อไปนี้เท่านั้น (ห้ามใส่ Markdown code blocks ใดๆ เพิ่มเติม):
{
  "doc_no": "เลขที่หนังสือ เช่น ศธ 04123/2567-0012",
  "doc_date": "วันที่ลงในเอกสาร ฟอร์แมต YYYY-MM-DD",
  "title": "เรื่อง/ชื่อเอกสาร",
  "sender": "หน่วยงานหรือผู้ส่ง",
  "recipient": "เรียน/ผู้รับ",
  "confidentiality_level": "normal หรือ secret หรือ top_secret",
  "urgency_level": "normal หรือ urgent หรือ super_urgent",
  "category": "หมวดหมู่เอกสาร เช่น วิชาการ, บริหารบุคคล, การเงิน/พัสดุ, บริหารทั่วไป",
  "summary": "สรุปสาระสำคัญเป็นข้อๆ ความยาวประมาณ 3 บรรทัด"
}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Content.replace(/^data:[^;]+;base64,/, ''),
        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : 'image/jpeg',
      },
    },
  ]);

  const responseText = result.response.text().trim();
  const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();

  try {
    const data = JSON.parse(cleanedJson) as ExtractedDocMetadata;
    return {
      doc_no: data.doc_no || 'ศธ 04123/2567-0001',
      doc_date: data.doc_date || new Date().toISOString().split('T')[0],
      title: data.title || 'เอกสารราชการ',
      sender: data.sender || 'หน่วยงานภายนอก',
      recipient: data.recipient || 'โรงเรียน',
      confidentiality_level: ['normal', 'secret', 'top_secret'].includes(data.confidentiality_level)
        ? data.confidentiality_level
        : 'normal',
      urgency_level: ['normal', 'urgent', 'super_urgent'].includes(data.urgency_level)
        ? data.urgency_level
        : 'normal',
      category: data.category || 'ทั่วไป',
      summary: data.summary || 'สรุปเนื้อหาเอกสารราชการโดยสังเขป',
    };
  } catch {
    throw new Error('ไม่สามารถแปลงผลลัพธ์จาก Gemini AI เป็น JSON ได้: ' + responseText);
  }
}
