"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface TeamCompositionAnalysisProps {
  leader: any
  members: any[]
}

export default function TeamCompositionAnalysis({ leader, members }: TeamCompositionAnalysisProps) {
  const [skillsData, setSkillsData] = useState<any[]>([])
  const [personalityData, setPersonalityData] = useState<any[]>([])
  const [belbinData, setBelbinData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function analyzeTeamComposition() {
      setLoading(true)

      // Combine leader and members
      const allMembers = [leader, ...members].filter(Boolean)

      if (allMembers.length === 0) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // Get all team member IDs
        const memberIds = allMembers.map((m) => m.id)

        // Fetch all skills for team members
        const { data: employeeSkills } = await supabase
          .from("employee_skills")
          .select("*, skills(*)")
          .in("employee_id", memberIds)

        if (employeeSkills) {
          // Group skills by main category
          const skillsByCategory: Record<string, number> = {}

          employeeSkills.forEach((es) => {
            const skill = es.skills
            if (skill && skill.main_category) {
              skillsByCategory[skill.main_category] = (skillsByCategory[skill.main_category] || 0) + 1
            }
          })

          // Convert to array for chart
          const chartData = Object.entries(skillsByCategory).map(([name, value]) => ({
            name,
            value,
          }))

          setSkillsData(chartData)
        }

        // Calculate average personality traits
        const traitSums: Record<string, number> = {}
        const traitCounts: Record<string, number> = {}

        const personalityTraits = [
          "ambition",
          "assertiveness",
          "awareness",
          "composure",
          "cooperativeness",
          "liveliness",
          "humility",
          "drive",
          "conceptual",
          "mastery",
          "structure",
          "flexibility",
          "positivity",
          "power",
          "sensitivity",
        ]

        // แก้ไขส่วนที่เก็บข้อมูล personality traits
        allMembers.forEach((member) => {
          if (member?.personality_traits) {
            // ตรวจสอบว่า personality_traits เป็น array หรือ object
            const traitsData = Array.isArray(member.personality_traits)
              ? member.personality_traits[0]
              : member.personality_traits

            if (traitsData) {
              personalityTraits.forEach((trait) => {
                if (typeof traitsData[trait] === "number") {
                  traitSums[trait] = (traitSums[trait] || 0) + traitsData[trait]
                  traitCounts[trait] = (traitCounts[trait] || 0) + 1
                }
              })
            }
          }
        })

        // Calculate averages
        const traitAverages = personalityTraits.map((trait) => ({
          trait,
          value: traitCounts[trait] ? Math.round((traitSums[trait] / traitCounts[trait]) * 10) / 10 : 0,
        }))

        // Sort by value for radar chart
        setPersonalityData(traitAverages.sort((a, b) => b.value - a.value))

        // Count Belbin roles
        const belbinRoles: Record<string, number> = {}

        // แก้ไขส่วนที่เก็บข้อมูล Belbin roles
        allMembers.forEach((member) => {
          if (member?.personality_traits) {
            // ตรวจสอบว่า personality_traits เป็น array หรือ object
            const traitsData = Array.isArray(member.personality_traits)
              ? member.personality_traits[0]
              : member.personality_traits

            if (traitsData?.belbin_role) {
              const role = traitsData.belbin_role
              belbinRoles[role] = (belbinRoles[role] || 0) + 1
            }
          }
        })

        // Convert to array for chart
        const belbinChartData = Object.entries(belbinRoles).map(([name, value]) => ({
          name,
          value,
        }))

        setBelbinData(belbinChartData)

        // เพิ่มหลังจากบรรทัดที่รวบรวมข้อมูลสมาชิกทีม
        console.log("Team composition members:", allMembers)
        console.log("Personality data:", personalityData)
        console.log("Belbin data:", belbinData)
      } catch (error) {
        console.error("Error analyzing team composition:", error)
      } finally {
        setLoading(false)
      }
    }

    analyzeTeamComposition()
  }, [leader, members])

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!leader && members.length === 0) {
    return <div className="text-center py-8 text-gray-500">เลือกผู้นำทีมและสมาชิกทีมเพื่อดูการวิเคราะห์องค์ประกอบของทีม</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">การวิเคราะห์องค์ประกอบของทีม</h3>
      <p className="text-sm text-gray-500 mb-4">
        แผนภูมิด้านล่างแสดงการกระจายของทักษะและบุคลิกภาพของทีมปัจจุบัน ซึ่งจะเปลี่ยนแปลงตามสมาชิกที่คุณเลือก
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">การกระจายของทักษะในทีม</h4>
            <div className="h-[250px]">
              {skillsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">ไม่พบข้อมูลทักษะ</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">บุคลิกภาพของทีม</h4>
            <div className="h-[250px]">
              {personalityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={personalityData.slice(0, 8)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar name="ค่าเฉลี่ยทีม" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">ไม่พบข้อมูลบุคลิกภาพ</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {belbinData.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">การกระจายของบทบาท Belbin</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={belbinData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {belbinData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
