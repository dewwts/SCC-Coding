"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface SkillsDistributionProps {
  employeeSkills: any[]
  skills: any[]
}

export default function SkillsDistribution({ employeeSkills, skills }: SkillsDistributionProps) {
  const [skillsData, setSkillsData] = useState<any[]>([])

  useEffect(() => {
    // Group skills by main category and count
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
  }, [employeeSkills])

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Skills Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
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
  )
}
