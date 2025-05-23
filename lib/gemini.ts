// ฟังก์ชันสำหรับวิเคราะห์ความเหมาะสมของพนักงานกับทีม
export async function analyzeTeamFit(
  employeeData: any,
  teamDescription: string,
): Promise<{ percentage: number; explanation: string }> {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ API
    const response = await fetch("/api/gemini/analyze-team-fit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeData, teamDescription }),
      cache: "no-store", // ไม่ใช้ cache
    })

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`)
    }

    const result = await response.json()

    // ตรวจสอบว่าผลลัพธ์มีรูปแบบที่ถูกต้องหรือไม่
    if (!result || typeof result.percentage !== "number" || typeof result.explanation !== "string") {
      throw new Error("Invalid response format from API")
    }

    return result
  } catch (error) {
    console.error("Error using AI for team fit analysis:", error)
    console.log("Falling back to mock data")

    // สร้างข้อมูลจำลองในกรณีที่ API มีปัญหา
    const percentage = Math.floor(Math.random() * 20) + 75 // สุ่มคะแนนระหว่าง 75-94

    // สร้างคำอธิบายตามบทบาท Belbin ถ้ามี
    let explanation = ""
    if (employeeData.personality_traits?.belbin_role) {
      const role = employeeData.personality_traits.belbin_role

      if (role.includes("Coordinator") || role.includes("Shaper")) {
        explanation = `${employeeData.name} มีบทบาท ${role} ซึ่งเหมาะกับการเป็นผู้นำและประสานงานในทีม`
      } else if (role.includes("Implementer") || role.includes("Completer Finisher")) {
        explanation = `${employeeData.name} มีบทบาท ${role} ซึ่งช่วยให้ทีมทำงานได้อย่างมีประสิทธิภาพและเสร็จสมบูรณ์`
      } else if (role.includes("Plant") || role.includes("Resource Investigator")) {
        explanation = `${employeeData.name} มีบทบาท ${role} ซึ่งช่วยสร้างความคิดสร้างสรรค์และนวัตกรรมให้กับทีม`
      } else if (role.includes("Monitor Evaluator") || role.includes("Specialist")) {
        explanation = `${employeeData.name} มีบทบาท ${role} ซึ่งช่วยวิเคราะห์และให้ความเชี่ยวชาญเฉพาะทางแก่ทีม`
      } else if (role.includes("Team Worker")) {
        explanation = `${employeeData.name} มีบทบาท ${role} ซึ่งช่วยสร้างความสามัคคีและการทำงานร่วมกันในทีม`
      } else {
        explanation = `${employeeData.name} มีบทบาท ${role} ซึ่งเป็นส่วนสำคัญในการทำงานร่วมกันของทีม`
      }
    } else {
      explanation = `${employeeData.name} มีประสบการณ์ทำงาน ${employeeData.work_year || 0} ปี และมีความเชี่ยวชาญในตำแหน่ง ${employeeData.job_title} ซึ่งเหมาะสมกับทีมนี้`
    }

    return {
      percentage,
      explanation,
    }
  }
}

// ฟังก์ชันสำหรับแนะนำองค์ประกอบทีมโดยใช้ AI
export async function suggestTeamComposition(
  teamDescription: string,
  selectedLeader: any,
  availableEmployees: any[],
): Promise<{ employeeId: number; percentage: number; explanation: string }[]> {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ API
    const response = await fetch("/api/gemini/suggest-team-composition", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamDescription, selectedLeader, availableEmployees }),
      cache: "no-store", // ไม่ใช้ cache
    })

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`)
    }

    const result = await response.json()

    // ตรวจสอบว่าผลลัพธ์มีรูปแบบที่ถูกต้องหรือไม่
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("Invalid response format from API")
    }

    return result
  } catch (error) {
    console.error("Error using AI for team composition suggestion:", error)
    console.log("Falling back to mock data")

    // เลือกพนักงาน 5 คนแรกหรือทั้งหมดถ้ามีน้อยกว่า 5 คน
    const selectedEmployees = availableEmployees.slice(0, Math.min(5, availableEmployees.length))

    // สร้างข้อมูลจำลองสำหรับแต่ละคน
    return selectedEmployees.map((emp) => {
      const percentage = Math.floor(Math.random() * 20) + 75 // สุ่มคะแนนระหว่าง 75-94

      // สร้างคำอธิบายตามบทบาท Belbin ถ้ามี
      let explanation = ""
      if (emp.personality_traits?.belbin_role && selectedLeader.personality_traits?.belbin_role) {
        const empRole = emp.personality_traits.belbin_role
        const leaderRole = selectedLeader.personality_traits.belbin_role

        explanation = `${emp.name} มีบทบาท ${empRole} ซึ่งเสริมกับบทบาท ${leaderRole} ของผู้นำทีม ทำให้ทีมมีความสมดุลและทำงานร่วมกันได้ดี`
      } else {
        explanation = `${emp.name} มีประสบการณ์ทำงาน ${emp.work_year || 0} ปี และมีความเชี่ยวชาญในตำแหน่ง ${emp.job_title} ซึ่งเป็นประโยชน์ต่อทีม`
      }

      return {
        employeeId: emp.id,
        percentage,
        explanation,
      }
    })
  }
}

// ฟังก์ชันสำหรับ matching พนักงานโดยใช้ AI
export async function matchEmployeeSkills(
  employees: any[],
  selectedCategory: string,
): Promise<{ employeeId: number; matchingScore: number; explanation: string }[]> {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ API
    const response = await fetch("/api/gemini/match-skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employees, selectedCategory }),
      cache: "no-store", // ไม่ใช้ cache
    })

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`)
    }

    const result = await response.json()

    // ตรวจสอบว่าผลลัพธ์มีรูปแบบที่ถูกต้องหรือไม่
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("Invalid response format from API")
    }

    return result
  } catch (error) {
    console.error("Error using AI for matching:", error)
    console.log("Falling back to mock data")

    return employees.map((emp) => {
      let matchingScore = Math.floor(Math.random() * 20) + 75 // สุ่มคะแนนระหว่าง 75-94
      let explanation = ""

      // ถ้ามีการเลือกหมวดหมู่ที่ไม่ใช่ "all" และพนักงานมีบทบาท Belbin
      if (selectedCategory !== "all" && emp.personality_traits?.belbin_role) {
        const role = emp.personality_traits.belbin_role

        // ถ้าบทบาทตรงกับหมวดหมู่ที่เลือก ให้คะแนนเพิ่ม
        if (role.includes(selectedCategory)) {
          matchingScore = Math.min(95, matchingScore + 10)
          explanation = `${emp.name} มีบทบาท ${role} ซึ่งตรงกับหมวดหมู่ ${selectedCategory} ที่คุณเลือก ทำให้มีความเหมาะสมสูง`
        } else {
          explanation = `${emp.name} มีบทบาท ${role} ซึ่งมีความเหมาะสมในระดับหนึ่ง แม้จะไม่ตรงกับหมวดหมู่ ${selectedCategory} ที่คุณเลือกโดยตรง`
        }
      } else {
        // กรณีเลือก "all" หรือไม่มีบทบาท Belbin
        if (emp.personality_traits?.belbin_role) {
          explanation = `${emp.name} มีบทบาท ${emp.personality_traits.belbin_role} ซึ่งช่วยให้ทีมทำงานได้อย่างมีประสิทธิภาพ`
        } else {
          explanation = `${emp.name} มีประสบการณ์ทำงาน ${emp.work_year || 0} ปี และมีความเชี่ยวชาญในตำแหน่ง ${emp.job_title}`
        }
      }

      return {
        employeeId: emp.id,
        matchingScore,
        explanation,
      }
    })
  }
}

// ฟังก์ชันสำหรับแนะนำผู้นำทีมโดยใช้ AI
export async function suggestTeamLeader(
  team: any,
  employees: any[],
): Promise<{ employeeId: number; explanation: string }> {
  try {
    // เตรียมข้อมูลสำหรับส่งให้ API
    const response = await fetch("/api/gemini/suggest-team-leader", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ team, employees }),
      cache: "no-store", // ไม่ใช้ cache
    })

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`)
    }

    const result = await response.json()

    // ตรวจสอบว่าผลลัพธ์มีรูปแบบที่ถูกต้องหรือไม่
    if (!result || typeof result.employeeId !== "number" || typeof result.explanation !== "string") {
      throw new Error("Invalid response format from API")
    }

    return result
  } catch (error) {
    console.error("Error using AI for team leader suggestion:", error)
    console.log("Falling back to mock data")

    // เรียงลำดับพนักงานตามประสบการณ์ทำงาน (มากไปน้อย)
    const sortedEmployees = [...employees].sort((a, b) => (b.work_year || 0) - (a.work_year || 0))

    // เลือกพนักงานที่มีบทบาท Coordinator หรือ Shaper ถ้ามี
    const leaderRoles = ["Coordinator", "Shaper", "CO", "SH"]
    const potentialLeader = employees.find(
      (emp) =>
        emp.personality_traits?.belbin_role &&
        leaderRoles.some((role) => emp.personality_traits.belbin_role.includes(role)),
    )

    if (potentialLeader) {
      return {
        employeeId: potentialLeader.id,
        explanation: `${potentialLeader.name} มีบทบาท ${potentialLeader.personality_traits.belbin_role} ซึ่งเหมาะกับการเป็นผู้นำทีม และมีประสบการณ์ทำงาน ${potentialLeader.work_year || 0} ปี`,
      }
    }

    // ถ้าไม่มีใครมีบทบาทผู้นำ ให้เลือกคนที่มีประสบการณ์มากที่สุด
    const defaultLeader = sortedEmployees[0]

    return {
      employeeId: defaultLeader.id,
      explanation: `${defaultLeader.name} ถูกเลือกเป็นผู้นำทีมเนื่องจากมีประสบการณ์ทำงานมากที่สุดในทีม (${defaultLeader.work_year || 0} ปี)`,
    }
  }
}
