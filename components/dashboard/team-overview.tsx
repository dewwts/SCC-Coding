"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface TeamOverviewProps {
  teams: any[]
}

export default function TeamOverview({ teams }: TeamOverviewProps) {
  const [activeTab, setActiveTab] = useState("all")

  const teamNames = teams.map((team) => team.name)

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Team Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            {teamNames.map((name) => (
              <TabsTrigger key={name} value={name}>
                {name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <Link href={`/teams/${team.id}`} className="text-xs text-purple-600 hover:text-purple-800">
                      View Details
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{team.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>{team.team_members?.length || 0} members</span>
                    <span>{team.team_members?.find((m: any) => m.is_leader)?.employees?.name || "No leader"}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {teams.map((team) => (
            <TabsContent key={team.id} value={team.name}>
              <div className="p-4 border border-gray-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <Link href={`/teams/${team.id}`} className="text-xs text-purple-600 hover:text-purple-800">
                    View Details
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mb-4">{team.description}</p>

                <h4 className="font-medium text-gray-700 mb-2">Team Members</h4>
                <div className="space-y-2">
                  {team.team_members?.map((member: any) => (
                    <div key={member.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{member.employees?.name}</span>
                        {member.is_leader && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">Leader</span>
                        )}
                      </div>
                      <span className="text-gray-500">{member.matching_percentage}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
