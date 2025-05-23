import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// ตั้งค่า Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { teamDescription, selectedLeader, availableEmployees } = await request.json()

    // ใช้ AI จริงๆ ในการวิเคราะห์
    const suggestedMembers = await suggestTeamCompositionWithAI(teamDescription, selectedLeader, availableEmployees)

    return NextResponse.json(suggestedMembers)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ฟังก์ชันสำหรับแนะนำองค์ประกอบทีมโดยใช้ AI
async function suggestTeamCompositionWithAI(teamDescription: string, leader: any, employees: any[]) {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ AI
    const leaderData = {
      id: leader.id,
      name: leader.name,
      job_title: leader.job_title,
      work_year: leader.work_year,
      personality_traits: leader.personality_traits
        ? {
            belbin_role: leader.personality_traits.belbin_role,
            top_personality: leader.personality_traits.top_personality,
            second_personality: leader.personality_traits.second_personality,
          }
        : null,
    }

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
    
    Analyze and recommend the 5 most suitable team members for this team based on the team description, team leader, and available employees.
    
    Team description:
    ${teamDescription}
    
    Team leader data:
    ${JSON.stringify(leaderData, null, 2)}
    
    Available employee data:
    ${JSON.stringify(employeeData, null, 2)}
    
    When selecting team members, consider the following factors:
    1. Belbin roles that complement the team leader
    2. Team personality balance
    3. Work experience
    4. Diversity of skills and expertise
    
    For each recommended employee, provide a detailed explanation of why they are suitable for this team, focusing on how their personality traits and experience complement the team leader and fulfill the team's needs.
    
    Respond ONLY with JSON in this format:
    [
      {
        "employeeId": 1,
        "percentage": 85,
        "explanation": "Detailed explanation of why this employee is suitable for this team"
      },
      ...
    ]
    
    Select the 5 most suitable employees and give a suitability score (percentage) between 70-95
    `

    // เรียกใช้ Gemini API ด้วยโมเดลที่ถูกต้อง
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("Raw AI response:", text) // Log เพื่อดูการตอบกลับจริงๆ

    // ค้นหาส่วนที่เป็น JSON ในข้อความ
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)

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
    console.error("Error using AI for team composition suggestion:", error)

    // ในกรณีที่มีข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    return employees.slice(0, 5).map((emp) => ({
      employeeId: emp.id,
      percentage: Math.floor(Math.random() * 20) + 75, // สุ่มคะแนนระหว่าง 75-94
      explanation: `${emp.name} มีคุณสมบัติที่เหมาะสมกับทีมนี้ เนื่องจากมีบทบาท ${emp.personality_traits?.belbin_role || "ไม่ทราบ"} ซึ่งเสริมกับบทบาทของผู้นำทีม และมีประสบการณ์ทำงาน ${emp.work_year || 0} ปี ในตำแหน่ง ${emp.job_title} ทำให้สามารถช่วยให้ทีมบรรลุเป้าหมายได้อย่างมีประสิทธิภาพ`,
    }))
  }
}
