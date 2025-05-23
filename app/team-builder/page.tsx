import TeamBuilderStepper from "@/components/team-builder/stepper"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TeamBuilderPage() {
  const supabase = createServerClient()

  // Fetch teams and employees on the server
  const { data: teams } = await supabase.from("teams").select("*")
  const { data: employees } = await supabase.from("employees").select("*, personality_traits(*)")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Builder</h1>
        <p className="text-gray-500 mt-2">
          Create high-performing teams by matching the right team leader and members based on complementary skills and
          personalities.
        </p>
      </div>

      <TeamBuilderStepper teams={teams || []} employees={employees || []} />
    </div>
  )
}
