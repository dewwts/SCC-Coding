"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EmployeeCard from "@/components/skill-matching/employee-card"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, InfoIcon } from "lucide-react"
import { matchEmployeeSkills } from "@/lib/gemini"

interface EmployeeListProps {
  employees?: any[]
  selectedCategory?: string
}

export default function EmployeeList({ employees = [], selectedCategory = "all" }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("matchingScore")
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([])
  const [loadedEmployees, setLoadedEmployees] = useState<any[]>(employees)
  const [loading, setLoading] = useState(employees.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [aiProcessed, setAiProcessed] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  // Fetch employees if not provided
  useEffect(() => {
    async function fetchEmployees() {
      if (employees.length > 0) {
        setLoadedEmployees(employees)
        return
      }

      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase.from("employees").select("*, personality_traits(*)")

        if (data) {
          setLoadedEmployees(data)
        } else {
          throw new Error("ไม่พบข้อมูลพนักงาน")
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
        setError("ไม่สามารถโหลดข้อมูลพนักงานได้")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [employees])

  // Process employees with AI
  useEffect(() => {
    // ตรวจสอบว่าได้โหลดพนักงานแล้วและยังไม่ได้ประมวลผลด้วย AI
    if (loadedEmployees.length === 0 || aiProcessed) return

    async function processWithAI() {
      setLoading(true)
      setError(null)

      try {
        // พยายามใช้ API จริงก่อน
        const matchResults = await matchEmployeeSkills(loadedEmployees, selectedCategory)

        if (matchResults && matchResults.length > 0) {
          // Map AI results to employees
          const processedEmployees = loadedEmployees.map((emp) => {
            const match = matchResults.find((m: any) => m.employeeId === emp.id)
            if (match) {
              return {
                ...emp,
                matchingScore: match.matchingScore,
                aiExplanation: match.explanation,
              }
            }
            return emp
          })

          setLoadedEmployees(processedEmployees)
          setAiProcessed(true)

          // ตรวจสอบว่าใช้ข้อมูลจำลองหรือไม่
          // ถ้าคำอธิบายมีรูปแบบที่เหมือนกับข้อมูลจำลอง
          const isMockData = matchResults.some((result: any) => {
            const explanation = result.explanation || ""
            return explanation.includes("มีประสบการณ์ทำงาน") && explanation.includes("ปี และมีความเชี่ยวชาญในตำแหน่ง")
          })

          setUsingMockData(isMockData)
        } else {
          throw new Error("Invalid response format from API")
        }
      } catch (error) {
        console.error("Error processing employees with AI:", error)

        // ใช้ข้อมูลจำลองเมื่อ API มีปัญหา
        const matchResults = await matchEmployeeSkills(loadedEmployees, selectedCategory)

        if (matchResults && matchResults.length > 0) {
          // Map mock results to employees
          const processedEmployees = loadedEmployees.map((emp) => {
            const match = matchResults.find((m: any) => m.employeeId === emp.id)
            if (match) {
              return {
                ...emp,
                matchingScore: match.matchingScore,
                aiExplanation: match.explanation,
              }
            }
            return emp
          })

          setLoadedEmployees(processedEmployees)
          setUsingMockData(true)
        }

        setAiProcessed(true)
      } finally {
        setLoading(false)
      }
    }

    processWithAI()
  }, [loadedEmployees, selectedCategory, aiProcessed])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...loadedEmployees]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "matchingScore") {
        return (b.matchingScore || 0) - (a.matchingScore || 0)
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "")
      } else if (sortBy === "job_title") {
        return (a.job_title || "").localeCompare(b.job_title || "")
      } else if (sortBy === "belbin_role") {
        return (a.personality_traits?.belbin_role || "").localeCompare(b.personality_traits?.belbin_role || "")
      }
      return 0
    })

    setFilteredEmployees(result)
  }, [loadedEmployees, searchTerm, sortBy])

  // เมื่อ selectedCategory เปลี่ยน ให้รีเซ็ต aiProcessed เพื่อให้ประมวลผลใหม่
  useEffect(() => {
    setAiProcessed(false)
  }, [selectedCategory])

  return (
    <div>
      <Card className="border-none shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาพนักงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matchingScore">คะแนนความเหมาะสม</SelectItem>
                  <SelectItem value="name">ชื่อ</SelectItem>
                  <SelectItem value="job_title">ตำแหน่ง</SelectItem>
                  <SelectItem value="belbin_role">บทบาท Belbin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลดข้อมูลพนักงาน...</p>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      ) : (
        <div className="col-span-2 text-center py-8 text-gray-500">ไม่พบพนักงานที่ตรงกับเงื่อนไขการค้นหา</div>
      )}
    </div>
  )
}
