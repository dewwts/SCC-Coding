import { Suspense } from "react"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UsersIcon, PlusIcon } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TeamsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-500 mt-2">View and manage all teams in your organization</p>
        </div>
        <Button asChild>
          <Link href="/team-builder">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Team
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TeamsGridSkeleton />}>
        <TeamsGrid />
      </Suspense>
    </div>
  )
}

async function TeamsGrid() {
  const supabase = createServerClient()
  const { data: teams, error } = await supabase.from("teams").select("*, team_members(count)")

  if (error) {
    console.error("Error fetching teams:", error)
    return <div>Error loading teams. Please try again later.</div>
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first team</p>
        <Button asChild>
          <Link href="/team-builder">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Team
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Link key={team.id} href={`/teams/${team.id}`} className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-purple-200">
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <UsersIcon className="h-4 w-4 mr-2" />
                <span>
                  {team.team_members?.[0]?.count || 0} team member
                  {(team.team_members?.[0]?.count || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Team
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
