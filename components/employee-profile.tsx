"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BriefcaseIcon, MapPinIcon, AwardIcon, BookOpenIcon, BrainIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { calculateTeamFit } from "@/lib/team-criteria"

interface EmployeeProfileProps {
  employeeId: number
}

export default function EmployeeProfile({ employeeId }: EmployeeProfileProps) {
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [skillsData, setSkillsData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [teamFitData, setTeamFitData] = useState<any[]>([])
  const [personalityTraits, setPersonalityTraits] = useState<any[]>([])

  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        const supabase = createClient()

        // Fetch employee with personality traits
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("*, personality_traits(*)")
          .eq("id", employeeId)
          .single()

        if (employeeError) {
          throw employeeError
        }

        console.log("Raw employee data:", employeeData)

        // Fetch employee skills
        const { data: skillsData, error: skillsError } = await supabase
          .from("employee_skills")
          .select("*, skills(*)")
          .eq("employee_id", employeeId)

        if (skillsError) {
          throw skillsError
        }

        if (employeeData) {
          // Process employee data
          const processedEmployee = {
            ...employeeData,
            skills: skillsData?.map((item) => item.skills) || [],
          }

          setEmployee(processedEmployee)

          // Process personality traits
          if (employeeData.personality_traits) {
            console.log("Personality traits data:", employeeData.personality_traits)

            // Check if personality_traits is an array or a direct object
            const traitsData = Array.isArray(employeeData.personality_traits)
              ? employeeData.personality_traits[0]
              : employeeData.personality_traits

            if (traitsData?.sorted_traits) {
              const parsedTraits = traitsData.sorted_traits.split(", ").map((trait: string) => {
                const [name, value] = trait.split(":")
                return { name, value: Number.parseInt(value) || 0 }
              })

              console.log("Parsed personality traits:", parsedTraits)
              setPersonalityTraits(parsedTraits)
            } else {
              console.log("No sorted_traits found in personality data")

              // If sorted_traits is not available, create traits from individual properties
              const manualTraits = [
                { name: "Ambition", value: traitsData?.ambition || 0 },
                { name: "Assertiveness", value: traitsData?.assertiveness || 0 },
                { name: "Awareness", value: traitsData?.awareness || 0 },
                { name: "Composure", value: traitsData?.composure || 0 },
                { name: "Cooperativeness", value: traitsData?.cooperativeness || 0 },
                { name: "Liveliness", value: traitsData?.liveliness || 0 },
                { name: "Humility", value: traitsData?.humility || 0 },
                { name: "Drive", value: traitsData?.drive || 0 },
                { name: "Conceptual", value: traitsData?.conceptual || 0 },
                { name: "Mastery", value: traitsData?.mastery || 0 },
                { name: "Structure", value: traitsData?.structure || 0 },
                { name: "Flexibility", value: traitsData?.flexibility || 0 },
                { name: "Positivity", value: traitsData?.positivity || 0 },
                { name: "Power", value: traitsData?.power || 0 },
                { name: "Sensitivity", value: traitsData?.sensitivity || 0 },
              ].filter((trait) => trait.value > 0)

              console.log("Manually created traits:", manualTraits)
              setPersonalityTraits(manualTraits)
            }
          } else {
            console.log("No personality_traits found in employee data")
          }

          // Process skills for visualization
          if (skillsData && skillsData.length > 0) {
            const skillsByCategory: Record<string, any> = {}

            skillsData.forEach((item) => {
              const category = item.skills?.main_category
              if (category) {
                if (!skillsByCategory[category]) {
                  skillsByCategory[category] = {
                    name: category,
                    value: 0,
                    skills: [],
                  }
                }

                skillsByCategory[category].value += 1
                skillsByCategory[category].skills.push(item.skills.name)
              }
            })

            setSkillsData(Object.values(skillsByCategory))
          }

          // Calculate team fit for all team types
          const teamTypes = ["NET ZERO", "Private Equity", "Board Directors", "Global Mindset", "Future Capabilities"]
          const fitData = teamTypes
            .map((teamType) => {
              const fit = calculateTeamFit(processedEmployee, teamType)
              return {
                teamName: teamType,
                ...fit,
              }
            })
            .sort((a, b) => b.overallFit - a.overallFit)

          setTeamFitData(fitData)
        }
      } catch (error) {
        console.error("Error fetching employee data:", error)
        setError("Failed to load employee data")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [employeeId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-1" />
            <Skeleton className="h-4 w-24 mx-auto mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="md:w-2/3">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  if (!employee) {
    return <div className="py-8 text-center">Employee not found</div>
  }

  // Get top 5 personality traits
  const topPersonalityTraits = [...personalityTraits].sort((a, b) => b.value - a.value).slice(0, 5)

  // Get top 3 skills categories
  const topSkillsCategories = [...skillsData].sort((a, b) => b.value - a.value).slice(0, 3)

  // Get best team fit
  const bestTeamFit = teamFitData[0]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

  // Get personality traits data for display
  const getPersonalityTraitsData = () => {
    // If we have parsed personality traits, use them
    if (personalityTraits.length > 0) {
      return personalityTraits
    }

    // Otherwise, try to extract from employee data
    const traits = []
    const traitsData = employee.personality_traits

    if (traitsData) {
      // Try to get traits from individual properties
      const traitNames = [
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

      for (const name of traitNames) {
        const value = traitsData[name]
        if (value && value > 0) {
          traits.push({ name: name.charAt(0).toUpperCase() + name.slice(1), value })
        }
      }
    }

    return traits
  }

  const displayPersonalityTraits = getPersonalityTraitsData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-700">{employee.name.charAt(0)}</span>
              </div>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">{employee.name}</h2>
              <p className="text-gray-500 text-center mb-4">{employee.job_title}</p>

              {employee.personality_traits?.belbin_role && (
                <div className="flex justify-center mb-4">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-sm px-3 py-1">
                    {employee.personality_traits.belbin_role}
                  </Badge>
                </div>
              )}

              <div className="space-y-3 mt-6">
                <div className="flex items-center text-sm">
                  <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Work Years: {employee.work_year}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Location: {employee.location}</span>
                </div>
                {bestTeamFit && (
                  <div className="flex items-center text-sm">
                    <AwardIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      Best Team Fit: {bestTeamFit.teamName} ({bestTeamFit.overallFit}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Skill Highlights */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-1 text-purple-600" />
                  Top Skills
                </h3>
                <div className="space-y-2">
                  {topSkillsCategories.length > 0 ? (
                    topSkillsCategories.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="text-sm">{category.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{category.value} skills</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills data available</p>
                  )}
                </div>
              </div>

              {/* Personality Highlights */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <BrainIcon className="h-4 w-4 mr-1 text-purple-600" />
                  Top Personality Traits
                </h3>
                <div className="space-y-2">
                  {topPersonalityTraits.length > 0 ? (
                    topPersonalityTraits.map((trait, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm">{trait.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{trait.value}/10</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No personality data available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="skills">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="team-fit">Team Fit</TabsTrigger>
            </TabsList>

            <TabsContent value="skills" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Skills Distribution</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {skillsData.length > 0 ? (
                      skillsData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center mb-3">
                            <span
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[categoryIndex % COLORS.length] }}
                            ></span>
                            <h4 className="font-medium">{category.name}</h4>
                            <span className="ml-auto text-sm text-gray-500">{category.value} skills</span>
                          </div>

                          <div className="relative h-2 bg-gray-100 rounded-full mb-4">
                            <div
                              className="absolute top-0 left-0 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, category.value * 10)}%`,
                                backgroundColor: COLORS[categoryIndex % COLORS.length],
                              }}
                            ></div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-3">
                            {category.skills.map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="outline" className="bg-gray-50 text-gray-700">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 text-gray-500">No skills data available</div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-3">All Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsData.length > 0 ? (
                      skillsData.flatMap((category) =>
                        category.skills.map((skill: string, index: number) => (
                          <Badge
                            key={`${category.name}-${index}`}
                            className="px-3 py-1"
                            style={{
                              backgroundColor: `${COLORS[skillsData.findIndex((c) => c.name === category.name) % COLORS.length]}20`,
                              color: COLORS[skillsData.findIndex((c) => c.name === category.name) % COLORS.length],
                            }}
                          >
                            {skill}
                          </Badge>
                        )),
                      )
                    ) : (
                      <p className="text-sm text-gray-500">No skills data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personality" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Personality Profile</h3>

                  {displayPersonalityTraits.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {displayPersonalityTraits.slice(0, 6).map((trait: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{trait.name}</h4>
                              <span className="text-sm font-semibold">{trait.value}/10</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full">
                              <div
                                className="absolute top-0 left-0 h-full rounded-full"
                                style={{
                                  width: `${trait.value * 10}%`,
                                  backgroundColor: `hsl(${240 + index * 30}, 70%, 60%)`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{getPersonalityDescription(trait.name)}</p>
                          </div>
                        ))}
                      </div>

                      {displayPersonalityTraits.length > 6 && (
                        <>
                          <h3 className="font-semibold text-lg mb-4">All Personality Traits</h3>
                          <div className="space-y-2">
                            {displayPersonalityTraits.slice(6).map((trait: any, index: number) => (
                              <div key={index} className="flex items-center">
                                <span className="text-sm">{trait.name}</span>
                                <div className="flex-1 mx-4">
                                  <Progress value={trait.value * 10} className="h-2" />
                                </div>
                                <span className="text-sm font-medium">{trait.value}/10</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No personality data available for this employee
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team-fit" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Team Fit Analysis</h3>

                  <div className="space-y-6">
                    {teamFitData.map((teamFit, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-lg">{teamFit.teamName}</h4>
                          <Badge
                            className={`px-3 py-1 ${
                              teamFit.overallFit >= 80
                                ? "bg-green-100 text-green-800"
                                : teamFit.overallFit >= 60
                                  ? "bg-blue-100 text-blue-800"
                                  : teamFit.overallFit >= 40
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {teamFit.overallFit}% Match
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Skills Fit</span>
                              <span>{teamFit.skillFit}%</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full">
                              <div
                                className="absolute top-0 left-0 h-full rounded-full bg-purple-600"
                                style={{ width: `${teamFit.skillFit}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Personality Fit</span>
                              <span>{teamFit.personalityFit}%</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full">
                              <div
                                className="absolute top-0 left-0 h-full rounded-full bg-indigo-500"
                                style={{ width: `${teamFit.personalityFit}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Matched Skills</h5>
                            <div className="flex flex-wrap gap-1">
                              {teamFit.matchedSkills.length > 0 ? (
                                teamFit.matchedSkills.map((skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No matched skills</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">Matched Personality</h5>
                            <div className="flex flex-wrap gap-1">
                              {teamFit.matchedPersonality.length > 0 ? (
                                teamFit.matchedPersonality.map((trait: string, i: number) => (
                                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {trait}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No matched personality traits</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Helper function to get personality trait descriptions
function getPersonalityDescription(trait: string): string {
  const descriptions: Record<string, string> = {
    ambition: "Driven to achieve goals and succeed at challenging tasks.",
    assertiveness: "Confident in expressing opinions and taking control of situations.",
    awareness: "Perceptive of surroundings and others' needs and feelings.",
    composure: "Calm and collected under pressure or in difficult situations.",
    cooperativeness: "Works well with others and contributes to team efforts.",
    liveliness: "Energetic and enthusiastic in approach to work and interactions.",
    humility: "Modest about achievements and open to feedback and learning.",
    drive: "Motivated to push forward and overcome obstacles.",
    conceptual: "Thinks abstractly and generates innovative ideas.",
    mastery: "Strives for excellence and continuous improvement of skills.",
    structure: "Prefers organization, planning, and systematic approaches.",
    flexibility: "Adapts easily to change and new situations.",
    positivity: "Maintains an optimistic outlook and focuses on solutions.",
    power: "Comfortable with authority and making impactful decisions.",
    sensitivity: "Attuned to emotions and interpersonal dynamics.",
  }

  // Make trait case-insensitive for lookup
  const traitLower = trait.toLowerCase()

  return descriptions[traitLower] || "A key personality characteristic that influences work style and team dynamics."
}
