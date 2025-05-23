"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  try {
    return createClientComponentClient<Database>()
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Return a mock client that won't break the app
    return {
      from: () => ({
        select: () => ({ data: null, error: new Error("Supabase client not available") }),
      }),
    } as any
  }
}
