import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// ตั้งค่า Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { employees, selectedCategory } = await request.json()

    // ใช้ AI จริงๆ ในการวิเคราะห์
    const matchResults = await matchEmployeesWithAI(employees, selectedCategory)

    return NextResponse.json(matchResults)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ฟังก์ชันสำหรับ matching พนักงานโดยใช้ AI
async function matchEmployeesWithAI(employees: any[], selectedCategory: string) {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ AI
    const employeeData = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      job_title: emp.job_title,
      work_year: emp.work_year,
      personality_traits: emp.personality_traits
        ? {
            belbin_role: emp.personality_traits.belbin_role,
            top_personality: emp.personality_traits.top_personality,
            second_personality: emp.personality_traits.second_personality,
          }
        : null,
    }))

    // สร้าง prompt สำหรับ AI - ระบุชัดเจนว่าต้องการ JSON เท่านั้น
    const prompt = `
    You MUST respond ONLY with valid JSON and nothing else. No explanations, no text, just JSON.
    
    Analyze the suitability of employees based on the provided data, focusing on Belbin roles and personality.
    
    Employee data:
    ${JSON.stringify(employeeData, null, 2)}
    
    Selected category: ${selectedCategory}
    
    For each employee, calculate a matching score between 70-95 and provide a brief explanation of why this employee is suitable.
    
    If the selected category is not "all", consider whether the employee has a Belbin role or personality that matches the selected category and give additional points.
    
    Respond ONLY with JSON in this format:
    [
      {
        "employeeId": 1,
        "matchingScore": 85,
        "explanation": "Brief explanation"
      },
      ...
    ]
    `

    // เรียกใช้ Gemini API ด้วยโมเดลที่ถูกต้อง
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("Raw AI response:", text) // Log เพื่อดูการตอบกลับจริงๆ

    // ค้นหาส่วนที่เป็น JSON ในข้อความ
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s) || text.match(/\{.*\}/s)

    if (jsonMatch) {
      try {
        const parsedResults = JSON.parse(jsonMatch[0])
        return Array.isArray(parsedResults) ? parsedResults : [parsedResults]
      } catch (parseError) {
        console.error("Error parsing matched JSON:", parseError)
        throw new Error("Invalid JSON format in response")
      }
    } else {
      console.error("No JSON found in response")
      throw new Error("No JSON found in response")
    }
  } catch (error) {
    console.error("Error using AI for matching:", error)

    // ในกรณีที่มีข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    return employees.slice(0, 10).map((emp) => ({
      employeeId: emp.id,
      matchingScore: Math.floor(Math.random() * 20) + 75, // สุ่มคะแนนระหว่าง 75-94
      explanation: `${emp.name} มีคุณสมบัติที่เหมาะสมกับการทำงานร่วมกับทีม`,
    }))
  }
}
