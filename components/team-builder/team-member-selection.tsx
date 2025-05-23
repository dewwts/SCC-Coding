"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, InfoIcon, Search, UserIcon, BarChart3Icon, BrainIcon } from "lucide-react"
import { suggestTeamComposition } from "@/lib/gemini"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { calculateTeamComposition } from "@/lib/team-criteria"

interface TeamMemberSelectionProps {
  team: any
  leader: any
  employees: any[]
  onSelect: (members: any[]) => void
  selectedMembers: any[]
}

export default function TeamMemberSelection({
  team,
  leader,
  employees,
  onSelect,
  selectedMembers,
}: TeamMemberSelectionProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestionsFetched, setSuggestionsFetched] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [skillsData, setSkillsData] = useState<any[]>([])
  const [personalityData, setPersonalityData] = useState<any[]>([])
  const [belbinData, setBelbinData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("members")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [teamComposition, setTeamComposition] = useState<any>(null)
  const [allSkills, setAllSkills] = useState<any[]>([])
  const [allPersonalityTraits, setAllPersonalityTraits] = useState<string[]>([])

  // Initialize selected IDs from props
  useEffect(() => {
    setSelectedIds(new Set(selectedMembers.map((m) => m.id)))
  }, [selectedMembers])

  // Filter employees based on search term
  useEffect(() => {
    let filtered = [...employees]

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (emp.personality_traits?.belbin_role || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEmployees(filtered)
  }, [employees, searchTerm])

  // ดึงข้อมูลทักษะทั้งหมดและบุคลิกภาพทั้งหมดเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    async function fetchAllSkillsAndTraits() {
      try {
        const supabase = createClient()

        // ดึงข้อมูลทักษะทั้งหมด
        const { data: skills } = await supabase.from("skills").select("*")
        if (skills) {
          setAllSkills(skills)
        }

        // กำหนดบุคลิกภาพทั้งหมดที่ควรมี
        setAllPersonalityTraits([
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
        ])
      } catch (error) {
        console.error("Error fetching all skills and traits:", error)
      }
    }

    fetchAllSkillsAndTraits()
  }, [])

  // Get AI suggestions for team composition
  useEffect(() => {
    async function getAiSuggestions() {
      if (!team || !leader || employees.length === 0 || suggestionsFetched) return

      setIsLoading(true)
      setError(null)
      setSuggestionsFetched(true)

      // เริ่มต้นการโหลด
      setLoadingProgress(10)

      const loadingInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(loadingInterval)
            return prev
          }
          return prev + 10
        })
      }, 1000)

      try {
        // พยายามใช้ API จริงก่อน
        const suggestions = await suggestTeamComposition(team.description, leader, employees)

        setLoadingProgress(100)
        clearInterval(loadingInterval)

        if (suggestions && suggestions.length > 0) {
          // Map suggestions to employees
          const suggestedEmployees = suggestions
            .map((suggestion: any) => {
              const employee = employees.find((e) => e.id === suggestion.employeeId)
              if (employee) {
                return {
                  ...employee,
                  matching_percentage: suggestion.percentage,
                  explanation: suggestion.explanation,
                }
              }
              return null
            })
            .filter(Boolean)

          setAiSuggestions(suggestedEmployees)

          // ตรวจสอบว่าใช้ข้อมูลจำลองหรือไม่
          // ถ้าคำอธิบายมีรูปแบบที่เหมือนกับข้อมูลจำลอง
          const isMockData = suggestions.some((suggestion: any) => {
            const explanation = suggestion.explanation || ""
            return explanation.includes("มีประสบการณ์ทำงาน") && explanation.includes("ปี และมีความเชี่ยวชาญในตำแหน่ง")
          })

          setUsingMockData(isMockData)

          if (!isMockData) {
            toast({
              title: "AI แนะนำสมาชิกทีมสำเร็จ",
              description: "AI ได้วิเคราะห์และแนะนำสมาชิกทีมที่เหมาะสมแล้ว",
            })
          }
        } else {
          throw new Error("Invalid response format from API")
        }
      } catch (error) {
        console.error("Error getting AI suggestions:", error)
        clearInterval(loadingInterval)
        setLoadingProgress(100)

        toast({
          title: "ไม่สามารถใช้ AI แนะนำสมาชิกทีมได้",
          description: "กำลังใช้ข้อมูลจำลองแทน",
          variant: "destructive",
        })

        // ใช้ข้อมูลจำลองเมื่อ API มีปัญหา
        const suggestions = await suggestTeamComposition(team.description, leader, employees)

        if (suggestions && suggestions.length > 0) {
          // Map mock suggestions to employees
          const suggestedEmployees = suggestions
            .map((suggestion: any) => {
              const employee = employees.find((e) => e.id === suggestion.employeeId)
              if (employee) {
                return {
                  ...employee,
                  matching_percentage: suggestion.percentage,
                  explanation: suggestion.explanation,
                }
              }
              return null
            })
            .filter(Boolean)

          setAiSuggestions(suggestedEmployees)
          setUsingMockData(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    getAiSuggestions()
  }, [team, leader, employees, suggestionsFetched, toast])

  // Reset suggestions when team or leader changes
  useEffect(() => {
    setSuggestionsFetched(false)
    setAiSuggestions([])
  }, [team, leader])

  // คำนวณข้อมูล skills และ personality เมื่อมีการเปลี่ยนแปลงสมาชิกทีม
  const analyzeTeamComposition = useCallback(async () => {
    if (!leader) {
      // ถ้าไม่มีผู้นำทีม ไม่ต้องวิเคราะห์
      return
    }

    setIsAnalyzing(true)

    try {
      // Combine leader and members
      const allMembers = [leader, ...selectedMembers].filter(Boolean)

      // คำนวณความเหมาะสมของทีมโดยรวม
      if (team) {
        const composition = calculateTeamComposition(team, allMembers)
        setTeamComposition(composition)
      }

      // คำนวณข้อมูล Belbin roles
      const belbinRoles: Record<string, number> = {}

      // เก็บข้อมูล Belbin roles
      allMembers.forEach((member) => {
        if (member?.personality_traits) {
          // ตรวจสอบว่า personality_traits เป็น array หรือ object
          const traitsData = Array.isArray(member.personality_traits)
            ? member.personality_traits[0]
            : member.personality_traits

          if (traitsData?.belbin_role) {
            const role = traitsData.belbin_role
            belbinRoles[role] = (belbinRoles[role] || 0) + 1
          }
        }
      })

      // แปลงเป็น array สำหรับแผนภูมิ
      const belbinChartData = Object.entries(belbinRoles).map(([name, value]) => ({
        name,
        value,
      }))

      setBelbinData(belbinChartData)

      // คำนวณค่าเฉลี่ย personality traits
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

      // เก็บข้อมูล personality traits
      allMembers.forEach((member) => {
        if (member?.personality_traits) {
          // ตรวจสอบว่า personality_traits เป็น array หรือ object
          const traitsData = Array.isArray(member.personality_traits)
            ? member.personality_traits[0]
            : member.personality_traits

          if (traitsData) {
            personalityTraits.forEach((trait) => {
              if (typeof traitsData[trait] === "number") {
                traitSums[trait] = (traitSums[trait] || 0) + traitsData[trait]
                traitCounts[trait] = (traitCounts[trait] || 0) + 1
              }
            })
          }
        }
      })

      // คำนวณค่าเฉลี่ย
      const traitAverages = personalityTraits
        .map((trait) => ({
          trait,
          value: traitCounts[trait] ? Math.round((traitSums[trait] / traitCounts[trait]) * 10) / 10 : 0,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // แสดงเฉพาะ 8 อันดับแรก

      setPersonalityData(traitAverages)

      // ดึงข้อมูลทักษะจาก Supabase
      try {
        const supabase = createClient()

        // Get all team member IDs
        const memberIds = allMembers.map((m) => m.id)

        // Fetch all skills for team members
        const { data: employeeSkills } = await supabase
          .from("employee_skills")
          .select("*, skills(*)")
          .in("employee_id", memberIds)

        if (employeeSkills && employeeSkills.length > 0) {
          // Group skills by main category
          const skillsByCategory: Record<string, any> = {}

          employeeSkills.forEach((es) => {
            const skill = es.skills
            if (skill && skill.main_category) {
              if (!skillsByCategory[skill.main_category]) {
                skillsByCategory[skill.main_category] = {
                  name: skill.main_category,
                  value: 0,
                  skills: new Set(),
                }
              }
              skillsByCategory[skill.main_category].value += 1
              skillsByCategory[skill.main_category].skills.add(skill.name)
            }
          })

          // Convert to array for chart and convert skills Set to Array
          const chartData = Object.values(skillsByCategory).map((category) => ({
            ...category,
            skills: Array.from(category.skills),
          }))

          setSkillsData(chartData)

          // คำนวณทักษะที่ขาดแบบ realtime
          if (allSkills.length > 0) {
            // สร้าง Set ของทักษะที่ทีมมี
            const teamSkillIds = new Set(employeeSkills.map((es) => es.skill_id))

            // หาทักษะที่ขาด
            const missingSkills = allSkills.filter((skill) => !teamSkillIds.has(skill.id)).map((skill) => skill.name)

            // อัพเดทข้อมูล teamComposition
            if (teamComposition) {
              setTeamComposition({
                ...teamComposition,
                missingSkills: missingSkills,
                skillCoverage: Math.round(
                  (employeeSkills.length / (employeeSkills.length + missingSkills.length)) * 100,
                ),
              })
            }
          }
        } else {
          // ถ้าไม่มีข้อมูลทักษะ ใช้ข้อมูลจำลอง
          const mockSkillCategories = ["Technical", "Management", "Communication", "Leadership", "Problem Solving"]
          const mockSkillsData = mockSkillCategories.map((category) => ({
            name: category,
            value: Math.floor(Math.random() * 5) + 3, // สุ่มจำนวนทักษะในแต่ละหมวดหมู่ (3-7)
            skills: [`${category} Skill 1`, `${category} Skill 2`],
          }))

          setSkillsData(mockSkillsData)
        }
      } catch (error) {
        console.error("Error fetching skills data:", error)

        // ใช้ข้อมูลจำลองเมื่อเกิดข้อผิดพลาด
        const mockSkillCategories = ["Technical", "Management", "Communication", "Leadership", "Problem Solving"]
        const mockSkillsData = mockSkillCategories.map((category) => ({
          name: category,
          value: Math.floor(Math.random() * 5) + 3, // สุ่มจำนวนทักษะในแต่ละหมวดหมู่ (3-7)
          skills: [`${category} Skill 1`, `${category} Skill 2`],
        }))

        setSkillsData(mockSkillsData)
      }
    } catch (error) {
      console.error("Error analyzing team composition:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [leader, selectedMembers, team, allSkills])

  // เรียกใช้ analyzeTeamComposition เมื่อมีการเปลี่ยนแปลงสมาชิกทีม
  useEffect(() => {
    analyzeTeamComposition()
  }, [analyzeTeamComposition])

  const toggleMember = (employee: any) => {
    const newSelectedIds = new Set(selectedIds)

    if (newSelectedIds.has(employee.id)) {
      newSelectedIds.delete(employee.id)
    } else {
      newSelectedIds.add(employee.id)
    }

    setSelectedIds(newSelectedIds)

    // Update parent component
    const selectedEmployees = employees
      .filter((emp) => newSelectedIds.has(emp.id))
      .map((emp) => {
        // Find if this employee has a matching percentage from AI suggestions
        const suggestion = aiSuggestions.find((s) => s.id === emp.id)
        return {
          ...emp,
          matching_percentage: suggestion?.matching_percentage || 85,
        }
      })

    onSelect(selectedEmployees)

    // เมื่อมีการเลือกสมาชิกทีม ให้เปลี่ยนไปที่แท็บ skills หรือ personality เพื่อให้เห็นการเปลี่ยนแปลงของกราฟ
    if (selectedEmployees.length > 0 && activeTab === "members") {
      setActiveTab("skills")
    }
  }

  const selectAllSuggested = () => {
    if (aiSuggestions.length === 0) return

    const suggestedIds = new Set(aiSuggestions.map((s) => s.id))
    setSelectedIds(suggestedIds)

    const selectedEmployees = employees
      .filter((emp) => suggestedIds.has(emp.id))
      .map((emp) => {
        const suggestion = aiSuggestions.find((s) => s.id === emp.id)
        return {
          ...emp,
          matching_percentage: suggestion?.matching_percentage || 85,
        }
      })

    onSelect(selectedEmployees)

    toast({
      title: "เลือกสมาชิกทีมทั้งหมด",
      description: `เลือกสมาชิกทีมที่แนะนำโดย AI จำนวน ${aiSuggestions.length} คน`,
    })

    // เมื่อเลือกสมาชิกทีมทั้งหมด ให้เปลี่ยนไปที่แท็บ skills เพื่อให้เห็นการเปลี่ยนแปลงของกราฟ
    setActiveTab("skills")
  }

  // เรียงลำดับพนักงานโดยให้คนที่ AI แนะนำอยู่ด้านบน
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aIsSuggested = aiSuggestions.some((s) => s.id === a.id)
    const bIsSuggested = aiSuggestions.some((s) => s.id === b.id)

    if (aIsSuggested && !bIsSuggested) return -1
    if (!aIsSuggested && bIsSuggested) return 1
    return 0
  })

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm">{`${payload[0].value} skills (${((payload[0].payload.percent || 0) * 100).toFixed(0)}%)`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">เลือกสมาชิกทีม</h2>

      <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="members">รายชื่อพนักงาน</TabsTrigger>
          <TabsTrigger value="skills">ทักษะของทีม</TabsTrigger>
          <TabsTrigger value="personality">บุคลิกภาพของทีม</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาพนักงาน"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {aiSuggestions.length > 0 && (
              <Button onClick={selectAllSuggested} className="whitespace-nowrap">
                เลือกทั้งหมดที่ AI แนะนำ
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <Progress value={loadingProgress} className="w-full mb-4" />
              <p className="text-gray-500">กำลังวิเคราะห์และแนะนำสมาชิกทีมที่เหมาะสม...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {usingMockData && (
            <Alert className="mb-4 bg-blue-50">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                กำลังใช้ข้อมูลจำลองเนื่องจาก AI API ไม่สามารถใช้งานได้ในขณะนี้
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 gap-4">
              {sortedEmployees.length > 0 ? (
                sortedEmployees.map((employee) => {
                  const suggestion = aiSuggestions.find((s) => s.id === employee.id)
                  const isSuggested = !!suggestion

                  return (
                    <Card
                      key={employee.id}
                      className={`border transition-all ${
                        selectedIds.has(employee.id)
                          ? "border-purple-500 shadow-md"
                          : isSuggested
                            ? "border-green-200 hover:border-green-300"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Checkbox
                              checked={selectedIds.has(employee.id)}
                              onCheckedChange={() => toggleMember(employee)}
                              className="mt-1"
                            />
                            <div>
                              <div className="flex items-center">
                                <p className="font-semibold">{employee.name}</p>
                                {isSuggested && (
                                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                    แนะนำโดย AI
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{employee.job_title}</p>
                              {employee.personality_traits && (
                                <p className="text-xs text-gray-500 mt-1">
                                  บทบาท:{" "}
                                  {Array.isArray(employee.personality_traits)
                                    ? employee.personality_traits[0]?.belbin_role || "ไม่ระบุ"
                                    : employee.personality_traits?.belbin_role || "ไม่ระบุ"}
                                </p>
                              )}
                            </div>
                          </div>

                          {suggestion && (
                            <div className="text-right">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-1 cursor-help">
                                      {suggestion.matching_percentage}% เหมาะสม
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">{suggestion.explanation}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>

                        {/* แสดงเหตุผลที่ AI แนะนำ */}
                        {suggestion && (
                          <div className="mt-3 ml-8 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                            <p className="font-medium mb-1">เหตุผลที่ AI แนะนำ:</p>
                            <p>{suggestion.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "ไม่พบพนักงานที่ตรงกับคำค้นหา" : "ไม่พบข้อมูลพนักงาน"}
                </div>
              )}
            </div>
          )}

          {/* แสดงสรุปจำนวนที่เลือก */}
          {selectedIds.size > 0 && (
            <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm text-purple-800">
                    เลือกสมาชิกทีมแล้ว {selectedIds.size} คน จากทั้งหมด {employees.length} คน
                  </span>
                </div>
                {selectedIds.size !== aiSuggestions.length && aiSuggestions.length > 0 && (
                  <Button variant="link" size="sm" onClick={selectAllSuggested} className="text-purple-600 p-0">
                    เลือกทั้งหมดที่ AI แนะนำ
                  </Button>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="pt-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-4">
              <BarChart3Icon className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium">ทักษะของทีม</h3>
            </div>

            {selectedIds.size === 0 ? (
              <div className="text-center py-8 text-gray-500">กรุณาเลือกสมาชิกทีมอย่างน้อย 1 คน เพื่อดูข้อมูลทักษะของทีม</div>
            ) : isAnalyzing ? (
              <div className="text-center py-8">
                <Progress value={70} className="w-full mb-4" />
                <p className="text-gray-500">กำลังวิเคราะห์ทักษะของทีม...</p>
              </div>
            ) : skillsData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {skillsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลทักษะของทีม</div>
            )}

            {teamComposition && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-3">ความครอบคลุมทักษะของทีม</h4>
                <div className="flex justify-between text-sm mb-1">
                  <span>ความครอบคลุมทักษะ</span>
                  <span>{teamComposition.skillCoverage}%</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full mb-4">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-purple-600"
                    style={{ width: `${teamComposition.skillCoverage}%` }}
                  ></div>
                </div>

                {teamComposition.missingSkills && teamComposition.missingSkills.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">ทักษะที่ยังขาด ({teamComposition.missingSkills.length})</h5>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {teamComposition.missingSkills.slice(0, 20).map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {skill}
                        </Badge>
                      ))}
                      {teamComposition.missingSkills.length > 20 && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                          +{teamComposition.missingSkills.length - 20} ทักษะอื่นๆ
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="personality" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-4">
                <BrainIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium">บุคลิกภาพของทีม</h3>
              </div>

              {selectedIds.size === 0 ? (
                <div className="text-center py-8 text-gray-500">กรุณาเลือกสมาชิกทีมอย่างน้อย 1 คน เพื่อดูข้อมูลบุคลิกภาพของทีม</div>
              ) : isAnalyzing ? (
                <div className="text-center py-8">
                  <Progress value={70} className="w-full mb-4" />
                  <p className="text-gray-500">กำลังวิเคราะห์บุคลิกภาพของทีม...</p>
                </div>
              ) : personalityData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={personalityData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="trait" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar name="Team Average" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลบุคลิกภาพของทีม</div>
              )}

              {teamComposition && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span>ความครอบคลุมบุคลิกภาพ</span>
                    <span>{teamComposition.personalityCoverage}%</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full mb-4">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-indigo-500"
                      style={{ width: `${teamComposition.personalityCoverage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-4">
                <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium">บทบาท Belbin ในทีม</h3>
              </div>

              {selectedIds.size === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  กรุณาเลือกสมาชิกทีมอย่างน้อย 1 คน เพื่อดูข้อมูลบทบาท Belbin ในทีม
                </div>
              ) : isAnalyzing ? (
                <div className="text-center py-8">
                  <Progress value={70} className="w-full mb-4" />
                  <p className="text-gray-500">กำลังวิเคราะห์บทบาท Belbin ในทีม...</p>
                </div>
              ) : belbinData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={belbinData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        labelLine={false}
                        label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                      >
                        {belbinData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลบทบาท Belbin</div>
              )}

              {teamComposition &&
                teamComposition.missingPersonality &&
                teamComposition.missingPersonality.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium mb-2">บุคลิกภาพที่ยังขาด</h5>
                    <div className="flex flex-wrap gap-1">
                      {teamComposition.missingPersonality.map((trait: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
