"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import EmployeeProfile from "@/components/employee-profile"

interface TeamMembersListProps {
  members: any[]
}

export default function TeamMembersList({ members }: TeamMembersListProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length > 0 ? (
          members.map((member) => (
            <Card
              key={member.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEmployee(member)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                    <p className="text-gray-500 text-sm">{member.job_title}</p>
                  </div>
                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {member.matching_percentage}% match
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  Belbin Role: {member.personality_traits?.belbin_role || "Unknown"}
                </div>

                {member.personality_traits?.top_personality && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{member.personality_traits.top_personality}</span>
                      <span>
                        {member.personality_traits[member.personality_traits.top_personality.toLowerCase()]}/10
                      </span>
                    </div>
                    <Progress
                      value={member.personality_traits[member.personality_traits.top_personality.toLowerCase()] * 10}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">No team members found</div>
        )}
      </div>

      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {selectedEmployee && <EmployeeProfile employeeId={selectedEmployee.id} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
