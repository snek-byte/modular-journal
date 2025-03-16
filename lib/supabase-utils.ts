import { supabase } from "./supabase-client"
import type { Descendant } from "slate"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Save journal entry to Supabase
export async function saveJournalToSupabase(journalId: string, title: string, content: Descendant[]) {
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

