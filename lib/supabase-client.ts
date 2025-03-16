import { createClient } from "@supabase/supabase-js"
import type { Descendant } from "slate"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the client only in browser environment or with proper environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: Descendant[]
  created_at: string
  updated_at: string
}

// Save journal entry to Supabase
export async function saveJournalToSupabase(journalId: string, title: string, content: any) {
  if (!isBrowser) return null

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is not authenticated, return null without throwing an error
    if (!user) {
      console.log("User not authenticated, skipping Supabase save")
      return null
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .upsert({
        id: journalId,
        user_id: user.id,
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error saving to Supabase:", error)
    throw error
  }
}

// Load journal entry from Supabase
export async function loadJournalFromSupabase(journalId: string) {
  if (!isBrowser) return null

  try {
    const { data, error } = await supabase.from("journal_entries").select("*").eq("id", journalId).single()

    if (error) {
      throw error
    }

    return data as JournalEntry
  } catch (error) {
    console.error("Error loading from Supabase:", error)
    return null
  }
}

// Get all journal entries for the current user
export async function getUserJournals() {
  if (!isBrowser) return []

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      throw error
    }

    return data as JournalEntry[]
  } catch (error) {
    console.error("Error fetching user journals:", error)
    return []
  }
}

// Delete a journal entry
export async function deleteJournal(journalId: string) {
  if (!isBrowser) return false

  try {
    const { error } = await supabase.from("journal_entries").delete().eq("id", journalId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting journal:", error)
    return false
  }
}

