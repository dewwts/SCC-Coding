import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerClient() {
  const cookieStore = cookies()

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookies in read-only mode (e.g. during static generation)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Handle cookies in read-only mode
        }
      },
    },
  })
}

// Export createClient as a named export to fix the deployment error
export { createClient }
