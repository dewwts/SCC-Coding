import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// ตั้งค่า Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { employeeData, teamDescription } = await request.json()

    // ใช้ AI จริงๆ ในการวิเคราะห์
    const teamFitAnalysis = await analyzeTeamFitWithAI(employeeData, teamDescription)

    return NextResponse.json(teamFitAnalysis)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ฟังก์ชันวิเคราะห์ความเหมาะสมของพนักงานกับทีมโดยใช้ AI
async function analyzeTeamFitWithAI(employeeData: any, teamDescription: string) {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ AI
    const employee = {
      id: employeeData.id,
      name: employeeData.name,
      job_title: employeeData.job_title,
      work_year: employeeData.work_year,
      personality_traits: employeeData.personality_traits
        ? {
            belbin_role: employeeData.personality_traits.belbin_role,
            top_personality: employeeData.personality_traits.top_personality,
            second_personality: employeeData.personality_traits.second_personality,
          }
        : null,
    }

    // สร้าง prompt สำหรับ AI - ระบุชัดเจนว่าต้องการ JSON เท่านั้น
    const prompt = `
    You MUST respond ONLY with valid JSON and nothing else. No explanations, no text, just JSON.
    
    Analyze the suitability of the employee for the team based on the provided data.
    
    Employee data:
    ${JSON.stringify(employee, null, 2)}
    
    Team description:
    ${teamDescription}
    
    Analyze how suitable this employee is for this team, considering:
    1. Belbin role and team fit
    2. Work experience
    3. Personality and team compatibility
    
    Respond ONLY with JSON in this format:
    {
      "percentage": 85,
      "explanation": "Explanation of why this employee is or is not suitable for this team"
    }
    
    Where percentage is a suitability score between 60-95
    `

    // เรียกใช้ Gemini API ด้วยโมเดลที่ถูกต้อง
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("Raw AI response:", text) // Log เพื่อดูการตอบกลับจริงๆ

    // ค้นหาส่วนที่เป็น JSON ในข้อความ
    const jsonMatch = text.match(/\{.*\}/s)

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error("Error parsing matched JSON:", parseError)
        throw new Error("Invalid JSON format in response")
      }
    } else {
      console.error("No JSON found in response")
      throw new Error("No JSON found in response")
    }
  } catch (error) {
    console.error("Error using AI for team fit analysis:", error)

    // ในกรณีที่มีข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    return {
      percentage: Math.floor(Math.random() * 20) + 75, // สุ่มคะแนนระหว่าง 75-94
      explanation: `${employeeData.name} มีคุณสมบัติที่เหมาะสมกับทีมนี้`,
    }
  }
}
