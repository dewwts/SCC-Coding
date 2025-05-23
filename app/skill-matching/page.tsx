"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"
import SkillMatchingHeader from "@/components/skill-matching/header"
import EmployeeList from "@/components/skill-matching/employee-list"
import CategoryFilter from "@/components/skill-matching/category-filter"

export default function SkillMatchingPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase.from("employees").select("*, personality_traits(*)")

        if (data) {
          setEmployees(data)
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <SkillMatchingHeader />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        <div className="lg:col-span-1">
          <CategoryFilter onCategoryChange={handleCategoryChange} />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">กำลังโหลดข้อมูลพนักงาน...</p>
            </div>
          ) : (
            <EmployeeList employees={employees} selectedCategory={selectedCategory} />
          )}
        </div>
      </div>
    </div>
  )
}
