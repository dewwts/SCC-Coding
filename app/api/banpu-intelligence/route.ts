import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = createClient()

    // Fetch employee data
    const { data: employees, error: employeesError } = await supabase.from("employees").select("*").limit(20)
    if (employeesError) throw employeesError

    // Fetch team data
    const { data: teams, error: teamsError } = await supabase.from("teams").select("*").limit(10)
    if (teamsError) throw teamsError

    // Create a context for the AI
    const systemPrompt = `
คุณเป็น AI ผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูลพนักงานและทีมของบริษัทบ้านปู

ข้อมูลพนักงานบ้านปู:
${JSON.stringify(employees, null, 2)}

ข้อมูลทีมบ้านปู:
${JSON.stringify(teams, null, 2)}

โปรดตอบคำถามโดยใช้ข้อมูลข้างต้น ให้คำตอบที่เป็นประโยชน์และเข้าใจง่าย ถ้าไม่มีข้อมูลเพียงพอ ให้แนะนำว่าผู้ใช้ควรถามคำถามอะไรเพิ่มเติม
`

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in Banpu Intelligence API:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
