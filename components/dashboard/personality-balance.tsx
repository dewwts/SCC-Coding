"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PersonalityBalanceProps {
  employees: any[]
}

export default function PersonalityBalance({ employees }: PersonalityBalanceProps) {
  const [belbinData, setBelbinData] = useState<any[]>([])

  useEffect(() => {
    // Count Belbin roles
    const belbinRoles: Record<string, number> = {}

    employees.forEach((employee) => {
      const role = employee.personality_traits?.belbin_role
      if (role) {
        belbinRoles[role] = (belbinRoles[role] || 0) + 1
      }
    })

    // Convert to array for chart
    const chartData = Object.entries(belbinRoles).map(([name, value]) => ({
      name: name.split(" ")[0], // Just take the first part of the role name
      fullName: name,
      value,
    }))

    setBelbinData(chartData)
  }, [employees])

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Personality Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {belbinData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={belbinData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No personality data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
