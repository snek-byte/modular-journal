import { supabase } from "./supabase-client"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

export async function isUserAuthenticated(): Promise<boolean> {
  if (!isBrowser) return false

  try {
    const { data } = await supabase.auth.getSession()
    return !!data.session
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!isBrowser) return null

  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

