# 🏫 School EDMS - ระบบสารบัญและคลังหนังสือราชการดิจิทัล

> ระบบสารบัญและคลังหนังสือราชการอิเล็กทรอนิกส์สำหรับโรงเรียน (พัฒนาขึ้นสำหรับโรงเรียนฝางวิทยายน) อัปโหลดไฟล์ตรงเข้า Google Drive ของโรงเรียน พร้อมสแกนอ่านเนื้อหาและสรุปเอกสารด้วย Gemini 1.5 Flash AI อัตโนมัติ

---

## 🌟 ฟีเจอร์เด่น (Key Features)

- 📁 **Direct Google Drive API v3 Upload**: อัปโหลดไฟล์เอกสาร (PDF, PNG, JPG) เข้าสู่โฟลเดอร์ Google Drive ของโรงเรียนโดยตรงจากบราวเซอร์ ไม่กินพื้นที่เซิร์ฟเวอร์
- 🤖 **Gemini 1.5 Flash AI Scanner**: ระบบ AI OCR ช่วยอ่านเนื้อหาเอกสาร ออกเลขรับ/ส่ง ลงวันที่ สกัดชื่อเรื่อง และสรุปสาระสำคัญ 3 บรรทัดให้อัตโนมัติ
- ⚡ **Supabase Real-time Database**: จัดเก็บดัชนีหนังสือราชการและประวัติย้อนหลัง พร้อมระบบออกเลขรับ-ส่ง อัตโนมัติแบบ Atomic Auto Numbering
- 🔐 **Dual-Gate Security System**:
  - **Gate 1**: ระบบรหัส PIN สองชั้นป้องกันบุคคลภายนอกสำหรับหน้าค้นหาหนังสือ
  - **Gate 2**: ระบบ Passcode ป้องกันการเข้าถึง Admin Portal สำหรับลงทะเบียนหนังสือ
- ☀️ **Light & Dark Mode Support**: รองรับธีมสว่างอ่านง่ายสบายตาสำหรับบุคลากรครู และธีมมืดทรงพลัง
- 🛡️ **Immutable Audit Logging**: บันทึกประวัติการเข้าถึงและการเปลี่ยนแปลงเอกสารย้อนหลังอย่างละเอียด
- 🔍 **Magic Bytes Header Verification**: ตรวจสอบโครงสร้างไฟล์จริงป้องกันการแอบอ้างอิงไฟล์อันตราย

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React Icons
- **Backend / Database**: Supabase (PostgreSQL), Next.js Server Actions
- **AI OCR & Scanner**: Google Gemini 1.5 Flash API
- **Cloud Storage**: Google Drive API v3 (Multipart Direct Upload)
- **Deployment**: Vercel Serverless Platform

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Setup)

### 1. Clone Repository
```bash
git clone https://github.com/dodophoenix1/EDMS.git
cd EDMS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env.local` แล้วระบุคีย์ของคุณ:
```bash
cp .env.example .env.local
```

กรอกข้อมูลใน `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_target_google_drive_folder_id
```

### 4. Run Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 📦 การ Deploy ขึ้น Vercel

```bash
npx vercel --prod
```
ระบุค่า Environment Variables บน Vercel Dashboard ตามใน `.env.example` เป็นอันเสร็จสิ้น!

---

## ☕ สนับสนุนผู้พัฒนา (Buy Me a Coffee)

หากระบบนี้เป็นประโยชน์กับโรงเรียนหรือหน่วยงานของคุณ และต้องการเลี้ยงกาแฟหรือสนับสนุนผู้พัฒนา สามารถสแกน QR Code หรือสนับสนุนได้ที่นี่ครับ 🙏

<p align="center">
  <img src="public/bmcf.JPG" alt="Buy Me a Coffee - BMCF" width="300" />
</p>

---

## 📜 License & Credit

พัฒนาแจกฟรีสำหรับโรงเรียนและสถานศึกษา เพื่อขับเคลื่อนงานสารบัญไทยสู่ระบบดิจิทัลแบบ 100% 

**Powered by**: โรงเรียนฝางวิทยายน | Next.js | Supabase | Google Drive API | Gemini AI
