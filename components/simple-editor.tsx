"use client"

import { useState, useMemo } from "react"
import { createEditor, type Descendant } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bold, Italic, Underline } from "lucide-react"

// Define the initial value for the editor
const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "Start writing your journal here..." }],
  },
]

// Custom Elements renderer
const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case "heading-one":
      return (
        <h1 {...attributes} className="text-3xl font-bold my-4">
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 {...attributes} className="text-2xl font-bold my-3">
          {children}
        </h2>
      )
    case "block-quote":
      return (
        <blockquote {...attributes} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic">
          {children}
        </blockquote>
      )
    case "bulleted-list":
      return (
        <ul {...attributes} className="list-disc ml-6 my-4">
          {children}
        </ul>
      )
    default:
      return (
        <p {...attributes} className="my-2">
          {children}
        </p>
      )
  }
}

// Custom Leaf components for text formatting
const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

export function SimpleEditor() {
  const [value, setValue] = useState<Descendant[]>(initialValue)

  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  // Define formatting functions
  const toggleBold = () => {
    editor.addMark("bold", true)
  }

  const toggleItalic = () => {
    editor.addMark("italic", true)
  }

  const toggleUnderline = () => {
    editor.addMark("underline", true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Journal Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={toggleBold}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleItalic}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleUnderline}>
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Slate editor={editor} initialValue={value} onChange={(newValue) => setValue(newValue)}>
          <div className="min-h-[300px] p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <Editable
              renderElement={Element}
              renderLeaf={Leaf}
              placeholder="Start writing your journal here..."
              spellCheck
              autoFocus
              className="min-h-[300px] focus:outline-none"
            />
          </div>
        </Slate>
      </CardContent>
    </Card>
  )
}

