import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"
import TeamMembersList from "@/components/teams/team-members-list"
import TeamSkillsAnalysis from "@/components/teams/team-skills-analysis"
import TeamPersonalityBalance from "@/components/teams/team-personality-balance"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface TeamPageProps {
  params: {
    id: string
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/teams" className="text-purple-600 hover:text-purple-800 flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Teams
        </Link>
      </div>

      <Suspense fallback={<TeamDetailsSkeleton />}>
        <TeamDetails id={params.id} />
      </Suspense>
    </div>
  )
}

async function TeamDetails({ id }: { id: string }) {
  const supabase = createServerClient()

  // Fetch team details
  const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", id).single()

  if (teamError || !team) {
    return notFound()
  }

  // Fetch team members with their details and personality traits
  const { data: teamMembers, error: membersError } = await supabase
    .from("team_members")
    .select(`
      *,
      employees(
        *,
        personality_traits(*)
      )
    `)
    .eq("team_id", id)

  if (membersError) {
    console.error("Error fetching team members:", membersError)
    return <div>Error loading team members. Please try again later.</div>
  }

  // Process team members data
  const members = teamMembers.map((member) => {
    // Ensure personality_traits is properly structured
    const personalityTraits = member.employees.personality_traits

    return {
      ...member.employees,
      personality_traits: personalityTraits,
      is_leader: member.is_leader,
      matching_percentage: member.matching_percentage,
    }
  })

  const leader = members.find((member) => member.is_leader)
  const regularMembers = members.filter((member) => !member.is_leader)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-gray-500 mt-2">{team.description}</p>
        </div>
        <Button asChild>
          <Link href={`/team-builder?team=${team.id}`}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Team
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="members" className="mb-8">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="personality">Personality Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="pt-6">
          <TeamMembersList leader={leader} members={regularMembers} />
        </TabsContent>

        <TabsContent value="skills" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamSkillsAnalysis leader={leader} members={regularMembers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Personality Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamPersonalityBalance leader={leader} members={regularMembers} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TeamDetailsSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-10 w-64 mb-6" />

      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
