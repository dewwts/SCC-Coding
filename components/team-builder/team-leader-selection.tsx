"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, AlertCircle, UserIcon, BriefcaseIcon, MapPinIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface TeamLeaderSelectionProps {
  teams: any[]
  suggestedLeader: any
  leaderExplanation: string
  isLoadingLeader: boolean
  onTeamSelect: (team: any) => void
  onLeaderSelect: (leader: any) => void
  selectedTeam: any
  selectedLeader: any
}

export default function TeamLeaderSelection({
  teams,
  suggestedLeader,
  leaderExplanation,
  isLoadingLeader,
  onTeamSelect,
  onLeaderSelect,
  selectedTeam,
  selectedLeader,
}: TeamLeaderSelectionProps) {
  const [teamId, setTeamId] = useState<string>(selectedTeam?.id?.toString() || "")
  const [leaderId, setLeaderId] = useState<string>(selectedLeader?.id?.toString() || "")
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  // Check if we're using mock data
  useEffect(() => {
    if (suggestedLeader && leaderExplanation) {
      // ตรวจสอบว่าใช้ข้อมูลจำลองหรือไม่
      // ถ้าคำอธิบายมีรูปแบบที่เหมือนกับข้อมูลจำลอง
      const isMockData = leaderExplanation.includes("ถูกเลือกเป็นผู้นำทีมเนื่องจากมีประสบการณ์ทำงานมากที่สุดในทีม")
      setUsingMockData(isMockData)
    }
  }, [suggestedLeader, leaderExplanation])

  // Update parent component when team selection changes
  useEffect(() => {
    if (teamId) {
      const team = teams.find((t) => t.id.toString() === teamId)
      if (team) {
        onTeamSelect(team)
        setError(null)
      }
    }
  }, [teamId, teams, onTeamSelect])

  // Update parent component when leader selection changes
  useEffect(() => {
    if (leaderId && suggestedLeader) {
      onLeaderSelect(suggestedLeader)
    }
  }, [leaderId, suggestedLeader, onLeaderSelect])

  // Update leaderId when suggestedLeader changes
  useEffect(() => {
    if (suggestedLeader) {
      setLeaderId(suggestedLeader.id.toString())
    }
  }, [suggestedLeader])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">เลือกทีมและผู้นำทีม</h2>

      <div className="mb-6">
        <Label htmlFor="team-select" className="block mb-2">
          เลือกทีม
        </Label>
        <Select value={teamId} onValueChange={(value) => setTeamId(value)}>
          <SelectTrigger id="team-select" className="w-full">
            <SelectValue placeholder="เลือกทีม" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {teamId && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm text-gray-700">
            {teams.find((t) => t.id.toString() === teamId)?.description}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {usingMockData && teamId && (
        <Alert className="mb-4 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            กำลังใช้ข้อมูลจำลองเนื่องจาก AI API ไม่สามารถใช้งานได้ในขณะนี้
          </AlertDescription>
        </Alert>
      )}

      {teamId && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="block">ผู้นำทีมที่แนะนำโดย AI</Label>
          </div>

          {isLoadingLeader ? (
            <div className="space-y-4">
              <div className="flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mr-3"></div>
                <p className="text-gray-600">กำลังวิเคราะห์ผู้นำทีมที่เหมาะสม...</p>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          ) : suggestedLeader ? (
            <>
              {leaderExplanation && (
                <Alert className="mb-4 bg-purple-50 border-purple-100">
                  <InfoIcon className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-sm text-purple-800">{leaderExplanation}</AlertDescription>
                </Alert>
              )}

              <RadioGroup value={leaderId} onValueChange={setLeaderId}>
                <Card className="border border-purple-500 shadow-md mb-4 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <RadioGroupItem
                        value={suggestedLeader.id.toString()}
                        id={`employee-${suggestedLeader.id}`}
                        className="mt-1 mr-3"
                        checked={true}
                        disabled
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label htmlFor={`employee-${suggestedLeader.id}`} className="font-medium text-gray-900">
                              {suggestedLeader.name}
                            </Label>
                            <div className="text-sm text-gray-500 mt-1">{suggestedLeader.job_title}</div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">แนะนำโดย AI</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>ประสบการณ์: {suggestedLeader.work_year || 0} ปี</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>สถานที่: {suggestedLeader.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>บทบาท Belbin: {suggestedLeader.personality_traits?.belbin_role || "ไม่ทราบ"}</span>
                            </div>
                          </div>

                          {suggestedLeader.personality_traits?.top_personality && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">คุณลักษณะเด่น</div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{suggestedLeader.personality_traits.top_personality}</span>
                                  <span>
                                    {
                                      suggestedLeader.personality_traits[
                                        suggestedLeader.personality_traits.top_personality.toLowerCase()
                                      ]
                                    }
                                    /10
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    suggestedLeader.personality_traits[
                                      suggestedLeader.personality_traits.top_personality.toLowerCase()
                                    ] * 10
                                  }
                                  className="h-1.5"
                                />
                              </div>
                              {suggestedLeader.personality_traits?.second_personality && (
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>{suggestedLeader.personality_traits.second_personality}</span>
                                    <span>
                                      {
                                        suggestedLeader.personality_traits[
                                          suggestedLeader.personality_traits.second_personality.toLowerCase()
                                        ]
                                      }
                                      /10
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      suggestedLeader.personality_traits[
                                        suggestedLeader.personality_traits.second_personality.toLowerCase()
                                      ] * 10
                                    }
                                    className="h-1.5"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">ไม่สามารถวิเคราะห์ผู้นำทีมที่เหมาะสมได้</div>
          )}
        </div>
      )}
    </div>
  )
}
