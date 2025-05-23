// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // ดึงคำถามล่าสุด
    const lastMessage = messages[messages.length - 1]
    const userQuestion = lastMessage.content

    // สร้าง payload ตามรูปแบบที่ถูกต้อง
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `คุณเป็น AI ผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูลพนักงานและทีมของบริษัทบ้านปู ชื่อของคุณคือ "Banpu Intelligence"
ตอบคำถามเกี่ยวกับพนักงาน ทีม ทักษะ และบุคลิกภาพของพนักงานในบริษัทบ้านปู
ตอบเป็นภาษาไทยเสมอ ยกเว้นคำศัพท์เฉพาะทางที่ใช้ภาษาอังกฤษ
ให้คำตอบที่เป็นประโยชน์และเข้าใจง่าย

คำถาม: ${userQuestion}`,
            },
          ],
        },
      ],
    }

    // เรียกใช้ API โดยตรงด้วย fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API Error:", errorData)
      throw new Error(`Gemini API returned status: ${response.status}. ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // ดึงข้อความตอบกลับจาก response
    let text = "ขออภัย ไม่สามารถประมวลผลคำตอบได้"

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts[0].text || text
    }

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in chat API:", error)

    // ถ้ายังมีข้อผิดพลาด ให้ใช้ข้อความที่เป็นประโยชน์
    const errorMessage = error instanceof Error ? error.message : String(error)

    // สร้างคำตอบที่แจ้งว่ามีปัญหาในการเชื่อมต่อกับ AI
    const fallbackResponse = {
      text: `ขออภัยครับ ระบบกำลังประสบปัญหาในการเชื่อมต่อกับ AI

ทีมงานกำลังแก้ไขปัญหานี้อยู่ ในระหว่างนี้ คุณสามารถถามคำถามเกี่ยวกับข้อมูลพื้นฐานได้ เช่น:
- ข้อมูลทั่วไปเกี่ยวกับพนักงาน
- ทักษะที่พบบ่อยในองค์กร
- บุคลิกภาพที่หลากหลายในทีม
- โครงสร้างของทีมต่างๆ

รายละเอียดข้อผิดพลาด (สำหรับทีมพัฒนา): ${errorMessage}`,
    }

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { "Content-Type": "application/json" },
    })
  }
}
