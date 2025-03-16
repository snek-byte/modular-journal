import { ModuleManager } from "@/components/module-manager"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6">
        <ModuleManager />
      </div>
    </div>
  )
}

