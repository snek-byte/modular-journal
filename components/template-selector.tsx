"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"
import type { Descendant } from "slate"

// Import templates from the templates module
import { templates } from "@/modules/templates-module"

interface TemplateSelectorProps {
  onSelectTemplate: (template: Descendant[]) => void
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleSelectTemplate = (templateId: string) => {
    const template = templates[templateId]
    if (template) {
      onSelectTemplate(template)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>Select a template to start your journal entry</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div
              className="border rounded-md p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelectTemplate("daily")}
            >
              <h3 className="font-medium text-lg mb-2">Daily Journal</h3>
              <p className="text-sm text-muted-foreground">A template for daily reflections, gratitude, and goals.</p>
            </div>
            <div
              className="border rounded-md p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelectTemplate("meeting")}
            >
              <h3 className="font-medium text-lg mb-2">Meeting Notes</h3>
              <p className="text-sm text-muted-foreground">
                A template for capturing meeting details, attendees, and action items.
              </p>
            </div>
            <div
              className="border rounded-md p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelectTemplate("project")}
            >
              <h3 className="font-medium text-lg mb-2">Project Plan</h3>
              <p className="text-sm text-muted-foreground">
                A template for outlining project objectives, tasks, and resources.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

