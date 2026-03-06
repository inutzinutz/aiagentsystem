import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `คุณคือ OpenClaw AI Agent ผู้ช่วยอัจฉริยะที่ทรงพลัง มีความสามารถดังนี้:

🧠 **ความสามารถ:**
- วิเคราะห์ข้อมูล, ยอดขาย, รายงาน
- ช่วยเขียนโค้ด, แก้บัก, อธิบายเทคนิค
- ตอบคำถามภาษาไทยและอังกฤษ
- สรุปเอกสาร, วิเคราะห์รูปภาพ
- ช่วยวางแผนและตัดสินใจ

📋 **กฎการทำงาน:**
- ตอบตรงประเด็น กระชับ แต่ครบถ้วน
- ใช้ภาษาไทยเป็นหลัก เว้นแต่ผู้ใช้ถามภาษาอื่น
- ใช้ markdown สำหรับโค้ดและรายการ
- บอกความไม่แน่ใจอย่างตรงไปตรงมา

วันที่ปัจจุบัน: ${new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, fileData } = await req.json()

    const model = genAI.getGenerativeModel({
      model: fileData ? 'gemini-1.5-flash' : 'gemini-1.5-flash',
      systemInstruction: systemPrompt || SYSTEM_PROMPT,
    })

    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({ history })

    const lastMessage = messages[messages.length - 1].content

    let parts: Part[]
    if (fileData) {
      parts = [
        { text: lastMessage || 'วิเคราะห์ไฟล์นี้ให้หน่อย' },
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          },
        },
      ]
    } else {
      parts = [{ text: lastMessage }]
    }

    const result = await chat.sendMessage(parts)
    const text = result.response.text()

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด: ' + String(error) }, { status: 500 })
  }
}
