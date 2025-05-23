"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BriefcaseIcon, MapPinIcon } from "lucide-react"
import EmployeeProfile from "@/components/employee-profile"

interface EmployeeCardProps {
  employee: any
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const [showProfile, setShowProfile] = useState(false)

  // แก้ไขการเข้าถึงข้อมูล sorted_traits
  // Get top 3 personality traits
  const getTopTraits = () => {
    if (!employee.personality_traits) return []

    // ตรวจสอบว่า personality_traits เป็น array หรือ object
    const traitsData = Array.isArray(employee.personality_traits)
      ? employee.personality_traits[0]
      : employee.personality_traits

    if (!traitsData?.sorted_traits) return []

    return traitsData.sorted_traits
      .split(", ")
      .slice(0, 3)
      .map((trait: string) => {
        const [name, value] = trait.split(":")
        return { name, value: Number.parseInt(value) }
      })
  }

  const topTraits = getTopTraits()

  // แก้ไขการเข้าถึงข้อมูล belbin_role
  const getBelbinRole = () => {
    if (!employee.personality_traits) return "ไม่ระบุ"

    // ตรวจสอบว่า personality_traits เป็น array หรือ object
    const traitsData = Array.isArray(employee.personality_traits)
      ? employee.personality_traits[0]
      : employee.personality_traits

    return traitsData?.belbin_role || "ไม่ระบุ"
  }

  const belbinRole = getBelbinRole()

  return (
    <>
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{employee.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <BriefcaseIcon className="h-4 w-4 mr-1" />
                <span>{employee.job_title}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{employee.location}</span>
              </div>
            </div>
            <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {employee.matchingScore ? `${employee.matchingScore}% ตรงกัน` : getBelbinRole()}
            </div>
          </div>

          {employee.aiExplanation && (
            <div className="mb-4 text-sm bg-gray-50 p-2 rounded text-gray-600">{employee.aiExplanation}</div>
          )}

          <div className="space-y-3 mt-4">
            {topTraits.map((trait: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{trait.name}</span>
                  <span className="text-gray-500">{trait.value}/10</span>
                </div>
                <Progress value={trait.value * 10} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-gray-50 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
            ดูโปรไฟล์
          </Button>
          <Link href={`/team-builder?employee=${employee.id}`}>
            <Button size="sm">เพิ่มเข้าทีม</Button>
          </Link>
        </CardFooter>
      </Card>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>โปรไฟล์พนักงาน</DialogTitle>
          </DialogHeader>
          <EmployeeProfile employeeId={employee.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
