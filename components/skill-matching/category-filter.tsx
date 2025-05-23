"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const personalityCategories = [
  { id: "all", name: "บุคลิกภาพทั้งหมด" },
  { id: "SH", name: "Shaper (SH)", description: "Drive, Ambition, Assertiveness" },
  { id: "IMP", name: "Implementer (IMP)", description: "Structure, Mastery, Composure" },
  { id: "CF", name: "Completer Finisher (CF)", description: "Awareness, Mastery, Sensitivity" },
  { id: "CO", name: "Coordinator (CO)", description: "Assertiveness, Positivity, Awareness" },
  { id: "TW", name: "Team Worker (TW)", description: "Cooperativeness, Sensitivity, Humility" },
  { id: "RI", name: "Resource Investigator (RI)", description: "Liveliness, Positivity, Flexibility" },
  { id: "PL", name: "Plant (PL)", description: "Conceptual, Flexibility, Awareness" },
  { id: "ME", name: "Monitor Evaluator (ME)", description: "Awareness, Composure, Conceptual" },
  { id: "SP", name: "Specialist (SP)", description: "Mastery, Drive, Conceptual" },
]

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void
}

export default function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory)
    }
  }, [selectedCategory, onCategoryChange])

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">กรองตามบุคลิกภาพ</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          {personalityCategories.map((category) => (
            <div key={category.id} className="mb-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={category.id} />
                <Label htmlFor={category.id} className="font-medium">
                  {category.name}
                </Label>
              </div>
              {category.description && <p className="text-xs text-gray-500 mt-1 ml-6">{category.description}</p>}
              {category.id !== personalityCategories[personalityCategories.length - 1].id && (
                <Separator className="mt-3" />
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
