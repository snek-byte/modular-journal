import { supabase } from "./supabase-client"

/**
 * Disables email confirmation for testing purposes.
 * WARNING: Only use this in development environments!
 */
export async function disableEmailConfirmation() {
  try {
    // This requires admin privileges and will only work if you have the right permissions
    const { error } = await supabase.auth.admin.updateConfig({
      emailConfirmation: {
        enabled: false,
      },
    })

    if (error) {
      console.error("Failed to disable email confirmation:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating auth config:", error)
    return { success: false, error }
  }
}

/**
 * Enables email confirmation (the default setting).
 */
export async function enableEmailConfirmation() {
  try {
    const { error } = await supabase.auth.admin.updateConfig({
      emailConfirmation: {
        enabled: true,
      },
    })

    if (error) {
      console.error("Failed to enable email confirmation:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating auth config:", error)
    return { success: false, error }
  }
}

