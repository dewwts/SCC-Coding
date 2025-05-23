"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [progress, setProgress] = useState<string>("")

  const addProgress = (message: string) => {
    setProgress((prev) => prev + "\n" + message)
  }

  const seedDatabase = async () => {
    setLoading(true)
    setStatus(null)
    setProgress("Starting database seeding process...")

    try {
      const supabase = createClient()

      // Step 1: Fetch and process the CSV files
      addProgress("Fetching CSV files...")

      // Fetch employee data
      addProgress("Fetching employee data...")
      const employeeResponse = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DataSourceBanpu.xlsx%20-%20EmployeeData-HpAC5vkrIWs8MyEPdW4Y6oAWI10p4u.csv",
      )
      const employeeData = await employeeResponse.text()
      const employeeRows = parseCSV(employeeData)
      addProgress(`Processed ${employeeRows.length} employee records`)

      // Fetch personality data
      addProgress("Fetching personality data...")
      const personalityResponse = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E0%B8%88%E0%B8%B1%E0%B8%94%E0%B8%AB%E0%B8%A1%E0%B8%A7%E0%B8%94%E0%B8%AB%E0%B8%A1%E0%B8%B9%E0%B9%88%20Banpu%20-%20Personality-FhuzSvaU14sdIvXRPrSw8ar43zwDCG.csv",
      )
      const personalityData = await personalityResponse.text()
      const personalityRows = parseCSV(personalityData)
      addProgress(`Processed ${personalityRows.length} personality records`)

      // Fetch skill categories
      addProgress("Fetching skill categories...")
      const skillCategoriesResponse = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E0%B8%88%E0%B8%B1%E0%B8%94%E0%B8%AB%E0%B8%A1%E0%B8%A7%E0%B8%94%E0%B8%AB%E0%B8%A1%E0%B8%B9%E0%B9%88%20Banpu%20-%20Skill-iJy0EvM5fjjxrW0nHq4XYZ4On0SCJg.csv",
      )
      const skillCategoriesData = await skillCategoriesResponse.text()
      const skillCategoriesRows = parseCSV(skillCategoriesData)
      addProgress(`Processed ${skillCategoriesRows.length} skill category records`)

      // Fetch employee skills
      addProgress("Fetching employee skills...")
      const employeeSkillsResponse = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DataSourceBanpu.xlsx%20-%20Skill-c9cbDoYrBDwwKq7ojLHVHDRf3NlKyd.csv",
      )
      const employeeSkillsData = await employeeSkillsResponse.text()
      const employeeSkillsRows = parseCSV(employeeSkillsData)
      addProgress(`Processed ${employeeSkillsRows.length} employee skill records`)

      // Step 2: Insert data into the database
      addProgress("Inserting data into the database...")

      // Insert employees
      addProgress("Inserting employees...")
      for (let i = 1; i < employeeRows.length; i++) {
        const row = employeeRows[i]
        if (row.length < 5) continue // Skip incomplete rows

        const { data, error } = await supabase.from("employees").upsert(
          {
            name: row[0],
            job_title: row[1],
            experience: row[2],
            work_year: Number.parseInt(row[3]) || 0,
            location: row[4],
          },
          { onConflict: "name" },
        )

        if (error) {
          console.error("Error inserting employee:", error)
          addProgress(`Error inserting employee ${row[0]}: ${error.message}`)
        }
      }

      // Get all employees to map names to IDs
      const { data: employees } = await supabase.from("employees").select("id, name")
      const employeeMap = new Map()
      employees?.forEach((emp) => employeeMap.set(emp.name, emp.id))
      addProgress(`Mapped ${employeeMap.size} employees to IDs`)

      // Insert personality traits
      addProgress("Inserting personality traits...")
      for (let i = 1; i < personalityRows.length; i++) {
        const row = personalityRows[i]
        if (row.length < 20) continue // Skip incomplete rows

        const employeeId = employeeMap.get(row[0])
        if (!employeeId) {
          addProgress(`Could not find employee ID for ${row[0]}, skipping personality traits`)
          continue
        }

        const { data, error } = await supabase.from("personality_traits").upsert(
          {
            employee_id: employeeId,
            ambition: Number.parseInt(row[1]) || 0,
            assertiveness: Number.parseInt(row[2]) || 0,
            awareness: Number.parseInt(row[3]) || 0,
            composure: Number.parseInt(row[4]) || 0,
            cooperativeness: Number.parseInt(row[5]) || 0,
            liveliness: Number.parseInt(row[6]) || 0,
            humility: Number.parseInt(row[7]) || 0,
            drive: Number.parseInt(row[8]) || 0,
            conceptual: Number.parseInt(row[9]) || 0,
            mastery: Number.parseInt(row[10]) || 0,
            structure: Number.parseInt(row[11]) || 0,
            flexibility: Number.parseInt(row[12]) || 0,
            positivity: Number.parseInt(row[13]) || 0,
            power: Number.parseInt(row[14]) || 0,
            sensitivity: Number.parseInt(row[15]) || 0,
            top_personality: row[16],
            second_personality: row[17],
            sorted_traits: row[18],
            belbin_role: row[19],
          },
          { onConflict: "employee_id" },
        )

        if (error) {
          console.error("Error inserting personality traits:", error)
          addProgress(`Error inserting personality traits for ${row[0]}: ${error.message}`)
        }
      }

      // Insert skills with categories
      addProgress("Inserting skills with categories...")
      const skillMap = new Map()
      for (let i = 1; i < skillCategoriesRows.length; i++) {
        const row = skillCategoriesRows[i]
        if (row.length < 4) continue // Skip incomplete rows

        const { data, error } = await supabase.from("skills").upsert(
          {
            name: row[0],
            main_category: row[2],
            subcategory: row[3],
          },
          { onConflict: "name", returning: "minimal" },
        )

        if (error) {
          console.error("Error inserting skill:", error)
          addProgress(`Error inserting skill ${row[0]}: ${error.message}`)
        }
      }

      // Get all skills to map names to IDs
      const { data: skills } = await supabase.from("skills").select("id, name")
      skills?.forEach((skill) => skillMap.set(skill.name, skill.id))
      addProgress(`Mapped ${skillMap.size} skills to IDs`)

      // Insert employee skills
      addProgress("Inserting employee skills...")
      for (let i = 1; i < employeeSkillsRows.length; i++) {
        const row = employeeSkillsRows[i]
        if (row.length < 2) continue // Skip incomplete rows

        const employeeId = employeeMap.get(row[0])
        if (!employeeId) {
          addProgress(`Could not find employee ID for ${row[0]}, skipping skills`)
          continue
        }

        const skills = row[1].split(";")
        for (const skillName of skills) {
          const skillId = skillMap.get(skillName.trim())
          if (!skillId) {
            // If skill doesn't exist in the map, insert it first
            const { data: newSkill, error: skillError } = await supabase
              .from("skills")
              .upsert(
                { name: skillName.trim(), main_category: "Other", subcategory: "Other" },
                { returning: "representation" },
              )

            if (skillError) {
              console.error("Error inserting new skill:", skillError)
              addProgress(`Error inserting new skill ${skillName}: ${skillError.message}`)
              continue
            }

            // Get the ID of the newly inserted skill
            const { data: insertedSkill } = await supabase
              .from("skills")
              .select("id")
              .eq("name", skillName.trim())
              .single()

            if (insertedSkill) {
              const { data, error } = await supabase.from("employee_skills").upsert(
                {
                  employee_id: employeeId,
                  skill_id: insertedSkill.id,
                },
                { onConflict: "employee_id,skill_id" },
              )

              if (error) {
                console.error("Error inserting employee skill:", error)
                addProgress(`Error inserting employee skill for ${row[0]} - ${skillName}: ${error.message}`)
              }
            }
          } else {
            // Skill exists in the map, insert the employee_skill record
            const { data, error } = await supabase.from("employee_skills").upsert(
              {
                employee_id: employeeId,
                skill_id: skillId,
              },
              { onConflict: "employee_id,skill_id" },
            )

            if (error) {
              console.error("Error inserting employee skill:", error)
              addProgress(`Error inserting employee skill for ${row[0]} - ${skillName}: ${error.message}`)
            }
          }
        }
      }

      addProgress("Database seeding completed successfully!")
      setStatus({ success: true, message: "Database seeded successfully!" })
    } catch (error) {
      console.error("Error seeding database:", error)
      setStatus({
        success: false,
        message: `Error seeding database: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to parse CSV
  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n")
    return lines.map((line) => {
      // Handle quoted fields properly
      const result = []
      let inQuotes = false
      let currentField = ""

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(currentField)
          currentField = ""
        } else {
          currentField += char
        }
      }

      result.push(currentField)
      return result
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Database Seeding Tool</CardTitle>
        <CardDescription>
          This tool will populate your Supabase database with sample data from the provided CSV files.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status && (
          <Alert className={status.success ? "bg-green-50 mb-4" : "bg-red-50 mb-4"}>
            {status.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        {progress && (
          <div className="bg-gray-50 p-4 rounded-md mb-4 max-h-60 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">{progress}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={seedDatabase} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Database...
            </>
          ) : (
            "Seed Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
