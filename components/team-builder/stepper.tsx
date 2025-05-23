"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, InfoIcon } from "lucide-react"
import TeamLeaderSelection from "@/components/team-builder/team-leader-selection"
import TeamMemberSelection from "@/components/team-builder/team-member-selection"
import TeamSummary from "@/components/team-builder/team-summary"
import TeamCompositionAnalysis from "@/components/team-builder/team-composition-analysis"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2Icon, ArrowLeftIcon, ArrowRightIcon, Loader2Icon } from "lucide-react"
import { suggestTeamLeader } from "@/lib/gemini"
import { useToast } from "@/components/ui/use-toast"

interface TeamBuilderStepperProps {
  teams: any[]
  employees: any[]
}

export default function TeamBuilderStepper({ teams, employees }: TeamBuilderStepperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [selectedLeader, setSelectedLeader] = useState<any>(null)
  const [suggestedLeader, setSuggestedLeader] = useState<any>(null)
  const [leaderExplanation, setLeaderExplanation] = useState<string>("")
  const [selectedMembers, setSelectedMembers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLeader, setIsLoadingLeader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leaderRequestSent, setLeaderRequestSent] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  // ตรวจสอบ query parameters เพื่อเลือกทีมหรือพนักงานโดยอัตโนมัติ
  useEffect(() => {
    const teamId = searchParams.get("team")
    const employeeId = searchParams.get("employee")

    if (teamId && teams.length > 0) {
      const team = teams.find((t) => t.id.toString() === teamId)
      if (team) {
        setSelectedTeam(team)
        toast({
          title: "เลือกทีมอัตโนมัติ",
          description: `เลือกทีม ${team.name} อัตโนมัติจาก URL`,
        })
      }
    }

    if (employeeId && employees.length > 0) {
      const employee = employees.find((e) => e.id.toString() === employeeId)
      if (employee) {
        // เพิ่มพนักงานเป็นสมาชิกทีมโดยอัตโนมัติในขั้นตอนที่ 2
        setSelectedMembers([{ ...employee, matching_percentage: 85 }])
        toast({
          title: "เพิ่มพนักงานอัตโนมัติ",
          description: `เพิ่ม ${employee.name} เป็นสมาชิกทีมอัตโนมัติจาก URL`,
        })
      }
    }
    console.log("Employees data in stepper:", employees)
  }, [teams, employees, searchParams, toast])

  // Get AI suggestion for team leader when team is selected
  useEffect(() => {
    async function getTeamLeaderSuggestion() {
      if (!selectedTeam || employees.length === 0 || leaderRequestSent) return

      setIsLoadingLeader(true)
      setError(null)
      setLeaderRequestSent(true)

      try {
        const suggestion = await suggestTeamLeader(selectedTeam, employees)

        if (suggestion && suggestion.employeeId) {
          const leader = employees.find((emp) => emp.id === suggestion.employeeId)
          if (leader) {
            setSuggestedLeader(leader)
            setSelectedLeader(leader)
            setLeaderExplanation(suggestion.explanation)

            // ตรวจสอบว่าใช้ข้อมูลจำลองหรือไม่
            const isMockData = suggestion.explanation.includes("ถูกเลือกเป็นผู้นำทีมเนื่องจากมีประสบการณ์ทำงานมากที่สุดในทีม")
            setUsingMockData(isMockData)

            if (!isMockData) {
              toast({
                title: "AI แนะนำผู้นำทีมสำเร็จ",
                description: "AI ได้วิเคราะห์และแนะนำผู้นำทีมที่เหมาะสมแล้ว",
              })
            }
          } else {
            throw new Error("Leader not found in employees list")
          }
        } else {
          throw new Error("Invalid response format from API")
        }
      } catch (error) {
        console.error("Error getting team leader suggestion:", error)
        toast({
          title: "ไม่สามารถใช้ AI แนะนำผู้นำทีมได้",
          description: "กำลังใช้ข้อมูลจำลองแทน",
          variant: "destructive",
        })

        // เลือกผู้นำทีมที่มีประสบการณ์มากที่สุดเป็นค่าเริ่มต้น
        const sortedEmployees = [...employees].sort((a, b) => (b.work_year || 0) - (a.work_year || 0))
        const defaultLeader = sortedEmployees[0]

        setSuggestedLeader(defaultLeader)
        setSelectedLeader(defaultLeader)
        setLeaderExplanation(`${defaultLeader.name} ถูกเลือกเป็นผู้นำทีมเนื่องจากมีประสบการณ์ทำงานมากที่สุดในทีม`)
        setUsingMockData(true)
      } finally {
        setIsLoadingLeader(false)
      }
    }

    getTeamLeaderSuggestion()
  }, [selectedTeam, employees, leaderRequestSent, toast])

  // Reset leaderRequestSent when team changes
  useEffect(() => {
    setLeaderRequestSent(false)
  }, [selectedTeam])

  const steps = [
    { title: "เลือกทีมและผู้นำทีม", description: "เลือกทีมและผู้นำทีมที่เหมาะสม" },
    { title: "เลือกสมาชิกทีม", description: "เพิ่มสมาชิกที่เสริมกับผู้นำทีม" },
    { title: "สรุปทีม", description: "ตรวจสอบองค์ประกอบของทีม" },
  ]

  const handleNext = () => {
    // ตรวจสอบว่าสามารถไปขั้นตอนถัดไปได้หรือไม่
    if (currentStep === 0 && (!selectedTeam || !selectedLeader)) {
      toast({
        title: "ไม่สามารถดำเนินการต่อได้",
        description: "กรุณาเลือกทีมและผู้นำทีมก่อน",
        variant: "destructive",
      })
      return
    }

    if (currentStep === 1 && selectedMembers.length === 0) {
      toast({
        title: "ไม่สามารถดำเนินการต่อได้",
        description: "กรุณาเลือกสมาชิกทีมอย่างน้อย 1 คน",
        variant: "destructive",
      })
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))

    // แสดงข้อความเมื่อไปถึงขั้นตอนสุดท้าย
    if (currentStep === steps.length - 2) {
      toast({
        title: "ตรวจสอบข้อมูลทีม",
        description: "กรุณาตรวจสอบข้อมูลทีมก่อนบันทึก",
      })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleTeamSelect = (team: any) => {
    setSelectedTeam(team)
    // Leader will be selected by AI
  }

  const handleLeaderSelect = (leader: any) => {
    setSelectedLeader(leader)
  }

  const handleMembersSelect = (members: any[]) => {
    setSelectedMembers(members)
  }

  // แยกฟังก์ชันสำหรับบันทึกทีมเพื่อใช้กับ useTransition
  const saveTeam = async () => {
    if (!selectedTeam || !selectedLeader || selectedMembers.length === 0) {
      toast({
        title: "ไม่สามารถบันทึกทีมได้",
        description: "กรุณาตรวจสอบข้อมูลทีม ผู้นำทีม และสมาชิกทีม",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Clear existing team members
      const { error: deleteError } = await supabase.from("team_members").delete().eq("team_id", selectedTeam.id)
      if (deleteError) throw deleteError

      // Add team leader
      const { error: leaderError } = await supabase.from("team_members").upsert({
        team_id: selectedTeam.id,
        employee_id: selectedLeader.id,
        is_leader: true,
        matching_percentage: 100, // Leader is 100% match by definition
      })
      if (leaderError) throw leaderError

      // Add team members
      for (const member of selectedMembers) {
        const { error: memberError } = await supabase.from("team_members").upsert({
          team_id: selectedTeam.id,
          employee_id: member.id,
          is_leader: false,
          matching_percentage: member.matching_percentage || 85,
        })
        if (memberError) throw memberError
      }

      toast({
        title: "บันทึกทีมสำเร็จ",
        description: `ทีม ${selectedTeam.name} ถูกบันทึกเรียบร้อยแล้ว`,
      })

      // Navigate to team page
      router.push(`/teams/${selectedTeam.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error saving team:", error)
      setError("ไม่สามารถบันทึกทีมได้")
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกทีมได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleSubmit = () => {
    // ใช้ startTransition เพื่อป้องกันปัญหา uncached promise
    startTransition(() => {
      saveTeam()
    })
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= index ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300 text-gray-300"
                }`}
              >
                {currentStep > index ? <CheckCircle2Icon className="h-6 w-6" /> : <span>{index + 1}</span>}
              </div>
              <div className="text-center mt-2">
                <div className={`font-medium ${currentStep >= index ? "text-gray-900" : "text-gray-400"}`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 ${currentStep >= index ? "text-gray-500" : "text-gray-400"}`}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-3">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200"></div>
          <div
            className="absolute top-0 left-0 h-0.5 bg-purple-600 transition-all"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
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

      <Card className="border-none shadow-sm p-6">
        {currentStep === 0 && (
          <TeamLeaderSelection
            teams={teams}
            suggestedLeader={suggestedLeader}
            leaderExplanation={leaderExplanation}
            isLoadingLeader={isLoadingLeader}
            onTeamSelect={handleTeamSelect}
            onLeaderSelect={handleLeaderSelect}
            selectedTeam={selectedTeam}
            selectedLeader={selectedLeader}
          />
        )}

        {currentStep === 1 && selectedTeam && selectedLeader && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TeamMemberSelection
                team={selectedTeam}
                leader={selectedLeader}
                employees={employees.filter((e) => e.id !== selectedLeader?.id)}
                onSelect={handleMembersSelect}
                selectedMembers={selectedMembers}
              />
            </div>
            <div className="lg:col-span-1">
              <TeamCompositionAnalysis leader={selectedLeader} members={selectedMembers} />
            </div>
          </div>
        )}

        {currentStep === 2 && selectedTeam && selectedLeader && (
          <TeamSummary team={selectedTeam} leader={selectedLeader} members={selectedMembers} />
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting || isPending}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={
                isSubmitting ||
                isPending ||
                (currentStep === 0 && (!selectedTeam || !selectedLeader)) ||
                (currentStep === 1 && selectedMembers.length === 0)
              }
            >
              ถัดไป
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกทีม"
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
