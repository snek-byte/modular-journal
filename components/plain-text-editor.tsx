"use client"

import { useState, useEffect } from "react"
import { createEditor, type Descendant } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import { Card } from "@/components/ui/card"

interface PlainTextEditorProps {
  initialContent?: Descendant[]
  onContentChange: (content: Descendant[]) => void
  fontFamily?: string
  fontSize?: number
  background?: string
}

export function PlainTextEditor({
  initialContent = [{ type: "paragraph", children: [{ text: "" }] }],
  onContentChange,
  fontFamily = "inherit",
  fontSize = 16,
  background = "none",
}: PlainTextEditorProps) {
  const [editor] = useState(() => withHistory(withReact(createEditor())))
  const [content, setContent] = useState<Descendant[]>(initialContent)

  // Initialize with initial content
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  // Custom Elements renderer
  const renderElement = ({ attributes, children, element }: any) => {
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
      case "bulleted-list":
        return (
          <ul {...attributes} className="list-disc ml-6 my-4">
            {children}
          </ul>
        )
      case "numbered-list":
        return (
          <ol {...attributes} className="list-decimal ml-6 my-4">
            {children}
          </ol>
        )
      case "list-item":
        return <li {...attributes}>{children}</li>
      case "paragraph":
      default:
        return (
          <p {...attributes} className="my-2">
            {children}
          </p>
        )
    }
  }

  // Custom Leaf components for text formatting
  const renderLeaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>
    }

    if (leaf.italic) {
      children = <em>{children}</em>
    }

    if (leaf.underline) {
      children = <u>{children}</u>
    }

    if (leaf.color) {
      children = <span style={{ color: leaf.color }}>{children}</span>
    }

    return <span {...attributes}>{children}</span>
  }

  // Check if content is the default placeholder text
  const isDefaultContent = (content: Descendant[]) => {
    return (
      content.length === 1 &&
      content[0].type === "paragraph" &&
      content[0].children.length === 1 &&
      content[0].children[0].text === "Start writing your plain text journal here..."
    )
  }

  // Handle editor focus to clear default text
  const handleEditorFocus = () => {
    if (isDefaultContent(content)) {
      setContent([
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ])
      onContentChange([
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ])
    }
  }

  return (
    <Card className="w-full h-full">
      <div
        className="min-h-[500px] h-[70vh] p-4 border border-gray-200 dark:border-gray-700 rounded-md relative overflow-auto"
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          background: background !== "none" ? background : undefined,
        }}
      >
        <Slate
          editor={editor}
          initialValue={content}
          onChange={(value) => {
            setContent(value)
            onContentChange(value)
          }}
        >
          <Editable
            className="min-h-full focus:outline-none"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start typing..."
            spellCheck
            autoFocus
            onFocus={handleEditorFocus}
          />
        </Slate>
      </div>
    </Card>
  )
}

