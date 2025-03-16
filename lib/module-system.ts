import type React from "react"
import type { Descendant } from "slate"
import type { ReactNode } from "react"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Define the module interface
export interface JournalModule {
  id: string
  name: string
  description: string
  version: string
  isPremium: boolean
  icon?: React.ComponentType<{ className?: string }>

  // Module capabilities
  transformContent?: (content: Descendant[]) => Descendant[]
  renderToolbarItems?: () => ReactNode
  renderSidebarItems?: () => ReactNode
  renderSettings?: () => ReactNode

  // Lifecycle hooks
  onInit?: () => void
  onActivate?: () => void
  onDeactivate?: () => void
}

// Module registry to keep track of all available modules
class ModuleRegistry {
  private modules: Map<string, JournalModule> = new Map()
  private activeModules: Set<string> = new Set()

  // Register a new module
  register(module: JournalModule): void {
    if (this.modules.has(module.id)) {
      console.warn(`Module with ID ${module.id} is already registered.`)
      return
    }

    this.modules.set(module.id, module)

    // Call init hook if available
    if (module.onInit) {
      module.onInit()
    }
  }

  // Get all registered modules
  getAllModules(): JournalModule[] {
    return Array.from(this.modules.values())
  }

  // Get a specific module by ID
  getModule(id: string): JournalModule | undefined {
    return this.modules.get(id)
  }

  // Activate a module
  activateModule(id: string): boolean {
    const module = this.modules.get(id)
    if (!module) {
      console.warn(`Module with ID ${id} not found.`)
      return false
    }

    this.activeModules.add(id)

    // Call activate hook if available
    if (module.onActivate) {
      module.onActivate()
    }

    return true
  }

  // Deactivate a module
  deactivateModule(id: string): boolean {
    const module = this.modules.get(id)
    if (!module) {
      console.warn(`Module with ID ${id} not found.`)
      return false
    }

    this.activeModules.delete(id)

    // Call deactivate hook if available
    if (module.onDeactivate) {
      module.onDeactivate()
    }

    return true
  }

  // Check if a module is active
  isModuleActive(id: string): boolean {
    return this.activeModules.has(id)
  }

  // Get all active modules
  getActiveModules(): JournalModule[] {
    return Array.from(this.activeModules)
      .map((id) => this.modules.get(id))
      .filter((module): module is JournalModule => module !== undefined)
  }
}

// Create and export a singleton instance
export const moduleRegistry = new ModuleRegistry()

// Helper function to load modules from localStorage
export function loadActiveModules(): void {
  if (!isBrowser) return

  try {
    const activeModuleIds = JSON.parse(localStorage.getItem("activeModules") || "[]")
    if (Array.isArray(activeModuleIds)) {
      activeModuleIds.forEach((id) => {
        moduleRegistry.activateModule(id)
      })
    }
  } catch (error) {
    console.error("Error loading active modules:", error)
  }
}

// Helper function to save active modules to localStorage
export function saveActiveModules(): void {
  if (!isBrowser) return

  try {
    const activeModules = moduleRegistry.getActiveModules()
    const activeModuleIds = activeModules.map((module) => module.id)
    localStorage.setItem("activeModules", JSON.stringify(activeModuleIds))
  } catch (error) {
    console.error("Error saving active modules:", error)
  }
}

