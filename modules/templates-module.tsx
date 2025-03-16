"use client"

import type { JournalModule } from "@/lib/module-system"
import type { Descendant } from "slate"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText } from "lucide-react"

// Export the templates object so it can be imported by other components
export const templates: Record<string, Descendant[]> = {
  daily: [
    {
      type: "heading-one",
      children: [{ text: "Daily Journal Entry" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Date: " + new Date().toLocaleDateString() }],
    },
    {
      type: "heading-two",
      children: [{ text: "Gratitude" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Today I am grateful for:" }],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
      ],
    },
    {
      type: "heading-two",
      children: [{ text: "Goals" }],
    },
    {
      type: "paragraph",
      children: [{ text: "My goals for today:" }],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
      ],
    },
    {
      type: "heading-two",
      children: [{ text: "Reflections" }],
    },
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
  meeting: [
    {
      type: "heading-one",
      children: [{ text: "Meeting Notes" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Date: " + new Date().toLocaleDateString() }],
    },
    {
      type: "paragraph",
      children: [{ text: "Attendees: " }],
    },
    {
      type: "heading-two",
      children: [{ text: "Agenda" }],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
      ],
    },
    {
      type: "heading-two",
      children: [{ text: "Discussion" }],
    },
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
    {
      type: "heading-two",
      children: [{ text: "Action Items" }],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
      ],
    },
  ],
  project: [
    {
      type: "heading-one",
      children: [{ text: "Project Plan" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Project Name: " }],
    },
    {
      type: "paragraph",
      children: [{ text: "Start Date: " }],
    },
    {
      type: "heading-two",
      children: [{ text: "Objectives" }],
    },
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
    {
      type: "heading-two",
      children: [{ text: "Tasks" }],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
        {
          type: "list-item",
          children: [{ text: "" }],
        },
      ],
    },
    {
      type: "heading-two",
      children: [{ text: "Resources" }],
    },
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
}

// Create the templates module
export const templatesModule: JournalModule = {
  id: "templates",
  name: "Templates",
  description: "Add pre-defined templates to your journal",
  version: "1.0.0",
  isPremium: false,
  icon: FileText,

  renderToolbarItems: () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => applyTemplate("daily")}>Daily Journal</DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyTemplate("meeting")}>Meeting Notes</DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyTemplate("project")}>Project Plan</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },

  onInit: () => {
    console.log("Templates module initialized")
  },
}

// Helper function to apply a template
function applyTemplate(templateId: string) {
  const template = templates[templateId]
  if (!template) return

  // This would be connected to the editor in a real implementation
  // For now, we'll just log it
  console.log(`Applying template: ${templateId}`)

  // In a real implementation, we would dispatch an event or use a context
  // to update the editor content
  const event = new CustomEvent("applyTemplate", { detail: { template } })
  document.dispatchEvent(event)
}

