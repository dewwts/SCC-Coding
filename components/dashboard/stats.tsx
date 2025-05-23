import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, BriefcaseIcon, LightbulbIcon, UsersRoundIcon } from "lucide-react"

interface StatsProps {
  teams: any[]
  employees: any[]
  skills: any[]
}

export default function DashboardStats({ teams, employees, skills }: StatsProps) {
  // Count total team members
  const totalTeamMembers = teams?.reduce((acc, team) => {
    return acc + (team.team_members?.length || 0)
  }, 0)

  // Count unique employees in teams (some may be in multiple teams)
  const uniqueTeamEmployees = new Set()
  teams?.forEach((team) => {
    team.team_members?.forEach((member: any) => {
      uniqueTeamEmployees.add(member.employee_id)
    })
  })

  const stats = [
    {
      title: "Total Employees",
      value: employees?.length || 0,
      icon: <UsersIcon className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "Teams",
      value: teams?.length || 0,
      icon: <BriefcaseIcon className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "Skills",
      value: skills?.length || 0,
      icon: <LightbulbIcon className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "Team Assignments",
      value: uniqueTeamEmployees.size,
      icon: <UsersRoundIcon className="h-6 w-6 text-purple-600" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
