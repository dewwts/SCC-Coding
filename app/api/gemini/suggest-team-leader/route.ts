import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// ตั้งค่า Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { team, employees } = await request.json()

    // ใช้ AI จริงๆ ในการวิเคราะห์
    const suggestedLeader = await suggestTeamLeaderWithAI(team, employees)

    return NextResponse.json(suggestedLeader)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ฟังก์ชันสำหรับแนะนำผู้นำทีมโดยใช้ AI
async function suggestTeamLeaderWithAI(team: any, employees: any[]) {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ AI
    const teamData = {
      id: team.id,
      name: team.name,
      description: team.description,
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
    
    Analyze and recommend the most suitable team leader for this team based on the team and employee data.
    
    Team data:
    ${JSON.stringify(teamData, null, 2)}
    
    Employee data:
    ${JSON.stringify(employeeData, null, 2)}
    
    When selecting a team leader, consider the following factors:
    1. Belbin roles suitable for leadership (e.g., Coordinator, Shaper)
    2. Work experience (work_year)
    3. Leadership-appropriate personality
    4. Relevance of job position to leadership
    
    Respond ONLY with JSON in this format:
    {
      "employeeId": 1,
      "explanation": "Explanation of why this employee is suitable to be a team leader"
    }
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
    console.error("Error using AI for team leader suggestion:", error)

    // ในกรณีที่มีข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    // ตรวจสอบว่ามีคำว่า "NET ZERO" ในคำอธิบายทีมหรือไม่
    if (team.description && team.description.includes("NET ZERO")) {
      // หาพนักงานที่มีตำแหน่งเกี่ยวกับ Net Zero
      const netZeroEmployee = employees.find((emp) => emp.job_title && emp.job_title.toLowerCase().includes("net-zero"))

      if (netZeroEmployee) {
        return {
          employeeId: netZeroEmployee.id,
          explanation: `${netZeroEmployee.name}, with job title '${netZeroEmployee.job_title}' and ${netZeroEmployee.work_year} years of experience, has a job title directly relevant to the team's objectives. This makes them a highly suitable candidate to lead the NET ZERO Team. Their seniority implies a depth of knowledge and experience in the field.`,
        }
      }
    }

    // ถ้าไม่พบพนักงานที่เกี่ยวข้องกับ Net Zero หรือไม่ใช่ทีม Net Zero
    // ให้เลือกพนักงานที่มีประสบการณ์มากที่สุด
    const sortedEmployees = [...employees].sort((a, b) => (b.work_year || 0) - (a.work_year || 0))
    const defaultLeader = sortedEmployees[0]

    return {
      employeeId: defaultLeader.id,
      explanation: `${defaultLeader.name} ถูกเลือกเป็นผู้นำทีมเนื่องจากมีประสบการณ์ทำงานมากที่สุดในทีม`,
    }
  }
}
