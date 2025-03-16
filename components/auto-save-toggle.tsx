"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Save } from "lucide-react"

interface AutoSaveToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function AutoSaveToggle({ enabled, onToggle }: AutoSaveToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-save"
              checked={enabled}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-green-500"
            />
            <Label htmlFor="auto-save" className="flex items-center gap-1 cursor-pointer">
              <Save className="h-4 w-4" />
              <span className="text-sm">Auto-save</span>
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent>{enabled ? "Auto-save is enabled" : "Auto-save is disabled"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

