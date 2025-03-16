"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { moduleRegistry, type JournalModule, loadActiveModules, saveActiveModules } from "@/lib/module-system"
import { templatesModule } from "@/modules/templates-module"

// Register available modules
const availableModules: JournalModule[] = [
  templatesModule,
  // Add more modules here
]

export function ModuleManager() {
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)

  // Initialize modules
  useEffect(() => {
    if (initialized) return

    // Register all available modules
    availableModules.forEach((module) => {
      moduleRegistry.register(module)
    })

    // Load active modules from localStorage
    loadActiveModules()

    // Get active module IDs
    const activeModuleIds = moduleRegistry.getActiveModules().map((module) => module.id)
    setActiveModules(activeModuleIds)

    setInitialized(true)
  }, [initialized])

  // Toggle module activation
  const toggleModule = (moduleId: string) => {
    if (activeModules.includes(moduleId)) {
      moduleRegistry.deactivateModule(moduleId)
      setActiveModules(activeModules.filter((id) => id !== moduleId))
    } else {
      moduleRegistry.activateModule(moduleId)
      setActiveModules([...activeModules, moduleId])
    }

    // Save active modules to localStorage
    saveActiveModules()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Modules</CardTitle>
        <CardDescription>Enable or disable modules to customize your journal experience</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="active">Active Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {availableModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      {module.icon && <module.icon className="h-5 w-5" />}
                      <h3 className="font-medium">{module.name}</h3>
                      {module.isPremium && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Premium</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`module-${module.id}`}
                      checked={activeModules.includes(module.id)}
                      onCheckedChange={() => toggleModule(module.id)}
                    />
                    <Label htmlFor={`module-${module.id}`}>
                      {activeModules.includes(module.id) ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-4">
              {activeModules.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No active modules. Enable modules from the "All Modules" tab.
                </p>
              ) : (
                availableModules
                  .filter((module) => activeModules.includes(module.id))
                  .map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          {module.icon && <module.icon className="h-5 w-5" />}
                          <h3 className="font-medium">{module.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toggleModule(module.id)}>
                        Disable
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reset to Default</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}

