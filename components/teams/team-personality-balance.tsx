"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface TeamPersonalityBalanceProps {
  leader: any
  members: any[]
}

export default function TeamPersonalityBalance({ leader, members }: TeamPersonalityBalanceProps) {
  const [personalityData, setPersonalityData] = useState<any[]>([])
  const [belbinData, setBelbinData] = useState<any[]>([])
  const [personalityCoverage, setPersonalityCoverage] = useState<number>(0)
  const [missingPersonality, setMissingPersonality] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Combine leader and members
    const allMembers = [leader, ...members].filter(Boolean)

    if (allMembers.length === 0) {
      setLoading(false)
      return
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

    // Define ideal personality traits for a balanced team
    const idealPersonalityTraits = [
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

    allMembers.forEach((member) => {
      if (member.personality_traits) {
        // Handle both array and object formats
        const traits = Array.isArray(member.personality_traits)
          ? member.personality_traits[0]
          : member.personality_traits

        if (traits) {
          personalityTraits.forEach((trait) => {
            if (typeof traits[trait] === "number") {
              traitSums[trait] = (traitSums[trait] || 0) + traits[trait]
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

    // Calculate personality coverage
    const presentTraits = personalityTraits.filter((trait) => traitCounts[trait] > 0)
    const coverage = Math.round((presentTraits.length / idealPersonalityTraits.length) * 100)
    setPersonalityCoverage(coverage)

    // Find missing personality traits
    const missing = idealPersonalityTraits.filter((trait) => !presentTraits.includes(trait))
    setMissingPersonality(missing)

    // Count Belbin roles
    const belbinRoles: Record<string, number> = {}

    allMembers.forEach((member) => {
      if (member.personality_traits) {
        // Handle both array and object formats
        const traits = Array.isArray(member.personality_traits)
          ? member.personality_traits[0]
          : member.personality_traits

        if (traits?.belbin_role) {
          const role = traits.belbin_role
          belbinRoles[role] = (belbinRoles[role] || 0) + 1
        }
      }
    })

    // Convert belbinRoles to array for chart data
    const belbinChartData = Object.entries(belbinRoles).map(([role, count]) => ({ name: role, value: count }))
    setBelbinData(belbinChartData)

    setLoading(false)
  }, [leader, members])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Team Personality Balance</h3>
          <Badge>{personalityCoverage}% Covered</Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={personalityData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="trait" />
            <PolarRadiusAxis />
            <Radar name="Average Traits" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <h4 className="text-md font-semibold">Missing Traits</h4>
          <ul className="list-disc pl-4">
            {missingPersonality.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
