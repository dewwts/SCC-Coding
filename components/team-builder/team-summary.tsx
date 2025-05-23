"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamSummaryProps {
  team: any
  leader: any
  members: any[]
}

export default function TeamSummary({ team, leader, members }: TeamSummaryProps) {
  const [belbinData, setBelbinData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ย้ายการคำนวณข้อมูลไปอยู่ใน useEffect เพื่อหลีกเลี่ยงการใช้ Promise โดยตรงในคอมโพเนนต์
  useEffect(() => {
    // ฟังก์ชันสำหรับคำนวณข้อมูล Belbin
    const calculateBelbinData = () => {
      // Count Belbin roles
      const belbinRoles: Record<string, number> = {}

      // Add leader
      if (leader?.personality_traits?.belbin_role) {
        belbinRoles[leader.personality_traits.belbin_role] = 1
      }

      // Add members
      members.forEach((member) => {
        if (member?.personality_traits?.belbin_role) {
          belbinRoles[member.personality_traits.belbin_role] =
            (belbinRoles[member.personality_traits.belbin_role] || 0) + 1
        }
      })

      // Convert to array for chart
      const data = Object.entries(belbinRoles).map(([name, value]) => ({
        name,
        value,
      }))

      setBelbinData(data)
      setIsLoading(false)
    }

    calculateBelbinData()
  }, [leader, members])

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-6 w-full mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32" />

          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Team Summary</h2>
      <p className="text-gray-500 mb-6">Review your team composition before finalizing</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium text-lg mb-4">Team Information</h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Team Name</div>
                <div className="text-gray-900">{team.name}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Description</div>
                <div className="text-gray-900">{team.description}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Team Size</div>
                <div className="text-gray-900">{members.length + 1} members (including leader)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium text-lg mb-4">Team Composition</h3>

            <div className="h-[200px]">
              {belbinData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={belbinData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                    >
                      {belbinData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No personality data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-4">Team Leader</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{leader.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{leader.job_title}</div>
                </div>
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Leader</div>
              </div>

              <div className="mt-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Belbin Role: {leader.personality_traits?.belbin_role || "Unknown"}
                </div>

                {leader.personality_traits?.top_personality && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{leader.personality_traits.top_personality}</span>
                      <span>
                        {leader.personality_traits[leader.personality_traits.top_personality.toLowerCase()]}/10
                      </span>
                    </div>
                    <Progress
                      value={leader.personality_traits[leader.personality_traits.top_personality.toLowerCase()] * 10}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-4">Team Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{member.job_title}</div>
                    </div>
                    <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {member.matching_percentage}% match
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Belbin Role: {member.personality_traits?.belbin_role || "Unknown"}
                    </div>

                    {member.personality_traits?.top_personality && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{member.personality_traits.top_personality}</span>
                          <span>
                            {member.personality_traits[member.personality_traits.top_personality.toLowerCase()]}/10
                          </span>
                        </div>
                        <Progress
                          value={
                            member.personality_traits[member.personality_traits.top_personality.toLowerCase()] * 10
                          }
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
