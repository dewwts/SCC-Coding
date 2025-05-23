"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface TeamSkillsAnalysisProps {
  leader: any
  members: any[]
}

export default function TeamSkillsAnalysis({ leader, members }: TeamSkillsAnalysisProps) {
  const [skillsData, setSkillsData] = useState<any[]>([])
  const [skillGaps, setSkillGaps] = useState<any[]>([])
  const [missingSkills, setMissingSkills] = useState<string[]>([])
  const [skillCoverage, setSkillCoverage] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkillsData() {
      try {
        const supabase = createClient()

        // Get all team member IDs including leader
        const memberIds = [leader?.id, ...members.map((m) => m.id)].filter(Boolean)

        if (memberIds.length === 0) {
          setLoading(false)
          return
        }

        // Fetch all skills for team members
        const { data: employeeSkills, error: skillsError } = await supabase
          .from("employee_skills")
          .select("*, skills(*)")
          .in("employee_id", memberIds)

        if (skillsError) {
          throw skillsError
        }

        // Fetch all possible skills
        const { data: allSkills, error: allSkillsError } = await supabase.from("skills").select("*")

        if (allSkillsError) {
          throw allSkillsError
        }

        if (employeeSkills && allSkills) {
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

          // Calculate skill gaps
          const teamSkillIds = new Set(employeeSkills.map((es) => es.skill_id))

          // Find missing skills
          const missing = allSkills.filter((skill) => !teamSkillIds.has(skill.id)).map((skill) => skill.name)

          setMissingSkills(missing)

          // Calculate skill coverage
          const coverage = Math.round((employeeSkills.length / (employeeSkills.length + missing.length)) * 100)
          setSkillCoverage(coverage)

          // Group missing skills by category
          const missingSkillsByCategory: Record<string, number> = {}

          allSkills.forEach((skill) => {
            if (!teamSkillIds.has(skill.id)) {
              missingSkillsByCategory[skill.main_category] = (missingSkillsByCategory[skill.main_category] || 0) + 1
            }
          })

          // Convert to array for chart
          const gapsData = Object.entries(missingSkillsByCategory)
            .map(([name, value]) => ({
              name,
              value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5 gaps

          setSkillGaps(gapsData)
        }
      } catch (error) {
        console.error("Error fetching skills data:", error)
        setError("Failed to load skills data")
      } finally {
        setLoading(false)
      }
    }

    fetchSkillsData()
  }, [leader, members])

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-6">Team Skills Distribution</h3>

            <div className="h-[300px]">
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
                <div className="h-full flex items-center justify-center text-gray-500">No skills data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-6">Top Skill Gaps</h3>

            <div className="h-[300px]">
              {skillGaps.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillGaps}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">No skill gaps identified</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* เพิ่มส่วนแสดงความครอบคลุมทักษะและทักษะที่ขาด */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-6">Skill Coverage Analysis</h3>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Skill Coverage</span>
              <span>{skillCoverage}%</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full mb-4">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-purple-600"
                style={{ width: `${skillCoverage}%` }}
              ></div>
            </div>
          </div>

          {missingSkills.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3">Missing Skills ({missingSkills.length})</h4>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md">
                {missingSkills.slice(0, 30).map((skill, i) => (
                  <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {skill}
                  </Badge>
                ))}
                {missingSkills.length > 30 && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                    +{missingSkills.length - 30} more skills
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
