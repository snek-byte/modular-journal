import { saveToLocalStorage } from "@/lib/storage"
import { saveJournalToSupabase } from "@/lib/supabase-client"

// Debounce function to limit how often a function is called
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}

// Create a debounced auto-save function
export const createAutoSave = (journalId: string, isAuthenticated: boolean | null) => {
  // Return a debounced function that saves content
  return debounce(async (title: string, content: any) => {
    try {
      // Always save to local storage
      saveToLocalStorage(`journal-${journalId}`, content)
      saveToLocalStorage(`journal-title-${journalId}`, title)

      // If authenticated, try to save to Supabase
      if (isAuthenticated) {
        try {
          await saveJournalToSupabase(journalId, title, content)
        } catch (error) {
          console.warn("Could not save to Supabase:", error)
        }
      }

      return true
    } catch (error) {
      console.error("Error in auto-save:", error)
      return false
    }
  }, 2000) // Debounce for 2 seconds
}

