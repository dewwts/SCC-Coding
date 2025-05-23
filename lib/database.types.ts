export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: number
          name: string
          job_title: string
          experience: string
          work_year: number
          location: string
        }
        Insert: {
          id?: number
          name: string
          job_title: string
          experience: string
          work_year: number
          location: string
        }
        Update: {
          id?: number
          name?: string
          job_title?: string
          experience?: string
          work_year?: number
          location?: string
        }
      }
      personality_traits: {
        Row: {
          id: number
          employee_id: number
          ambition: number
          assertiveness: number
          awareness: number
          composure: number
          cooperativeness: number
          liveliness: number
          humility: number
          drive: number
          conceptual: number
          mastery: number
          structure: number
          flexibility: number
          positivity: number
          power: number
          sensitivity: number
          top_personality: string
          second_personality: string
          sorted_traits: string
          belbin_role: string
        }
        Insert: {
          id?: number
          employee_id: number
          ambition: number
          assertiveness: number
          awareness: number
          composure: number
          cooperativeness: number
          liveliness: number
          humility: number
          drive: number
          conceptual: number
          mastery: number
          structure: number
          flexibility: number
          positivity: number
          power: number
          sensitivity: number
          top_personality: string
          second_personality: string
          sorted_traits: string
          belbin_role: string
        }
        Update: {
          id?: number
          employee_id?: number
          ambition?: number
          assertiveness?: number
          awareness?: number
          composure?: number
          cooperativeness?: number
          liveliness?: number
          humility?: number
          drive?: number
          conceptual?: number
          mastery?: number
          structure?: number
          flexibility?: number
          positivity?: number
          power?: number
          sensitivity?: number
          top_personality?: string
          second_personality?: string
          sorted_traits?: string
          belbin_role?: string
        }
      }
      skills: {
        Row: {
          id: number
          name: string
          main_category: string
          subcategory: string
        }
        Insert: {
          id?: number
          name: string
          main_category: string
          subcategory: string
        }
        Update: {
          id?: number
          name?: string
          main_category?: string
          subcategory?: string
        }
      }
      employee_skills: {
        Row: {
          id: number
          employee_id: number
          skill_id: number
        }
        Insert: {
          id?: number
          employee_id: number
          skill_id: number
        }
        Update: {
          id?: number
          employee_id?: number
          skill_id?: number
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          description: string
        }
        Insert: {
          id?: number
          name: string
          description: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
        }
      }
      team_members: {
        Row: {
          id: number
          team_id: number
          employee_id: number
          is_leader: boolean
          matching_percentage: number
        }
        Insert: {
          id?: number
          team_id: number
          employee_id: number
          is_leader: boolean
          matching_percentage: number
        }
        Update: {
          id?: number
          team_id?: number
          employee_id?: number
          is_leader?: boolean
          matching_percentage?: number
        }
      }
    }
  }
}
