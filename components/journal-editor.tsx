"use client"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import React from "react"

import { createEditor, type Editor } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { saveJournalToSupabase } from "@/lib/supabase-client"
import { createAutoSave } from "@/lib/auto-save"
import { AutoSaveToggle } from "@/components/auto-save-toggle"
import { WordCounter } from "@/components/word-counter"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Download,
  Printer,
  RotateCcw,
  RotateCw,
  X,
  RefreshCw,
  Undo,
  Redo,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import interact from "interactjs"
import type { Descendant } from "slate"
import { toggleMark, toggleBlock, toggleAlign, isMarkActive, isBlockActive } from "@/lib/editor-utils"
import { FontSelector } from "@/components/font-selector"
import { BackgroundUploader } from "@/components/background-uploader"
import { TemplateSelector } from "@/components/template-selector"
import { ColorPicker } from "@/components/color-picker"
import { TextResizer } from "@/components/text-resizer"
import { EmojiPicker } from "@/components/emoji-picker"
import { DraggableEmoji } from "@/components/draggable-emoji"
import { ShapePicker } from "@/components/shape-picker"
import { DraggableShape } from "@/components/draggable-shape"
import { PlainTextEditor } from "@/components/plain-text-editor"
// Update the import for the icon picker
// Replace the import for IconPicker with:
import { SimplifiedIconPicker } from "@/components/simplified-icon-picker"
import { DraggableIcon } from "@/components/draggable-icon"

// Helper function to convert CSS string to style object
function cssToStyle(cssString: string): React.CSSProperties {
  // For CSS backgrounds, we'll create a unique class and add it to the document
  // Then return a simple style object that just references that class
  const uniqueId = `bg-${Math.random().toString(36).substring(2, 9)}`

  // Create a style element if it doesn't exist
  if (typeof document !== "undefined") {
    let styleEl = document.getElementById("dynamic-backgrounds")
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = "dynamic-backgrounds"
      document.head.appendChild(styleEl)
    }

    // Add the CSS as a class
    const css = `.${uniqueId} {
      ${cssString}
      opacity: 0.85;
      z-index: 1;
    }`

    styleEl.innerHTML += css
  }

  // Return a simple style object with just the class name
  return {
    opacity: 0.85,
    zIndex: 1,
  }
}

// Define the initial value for the editor
const initialValue: Descendant[] = []

// Custom Elements renderer
const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align }

  switch (element.type) {
    case "heading-one":
      return (
        <h1 style={style} {...attributes} className="text-3xl font-bold my-4">
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 style={style} {...attributes} className="text-2xl font-bold my-3">
          {children}
        </h2>
      )
    case "bulleted-list":
      return (
        <ul style={style} {...attributes} className="list-disc ml-6 my-4">
          {children}
        </ul>
      )
    case "numbered-list":
      return (
        <ol style={style} {...attributes} className="list-decimal ml-6 my-4">
          {children}
        </ol>
      )
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case "paragraph":
    default:
      return (
        <p style={style} {...attributes} className="my-2">
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

  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>
  }

  return <span {...attributes}>{children}</span>
}

// Format button component
const FormatButton = ({ format, icon: Icon, isBlock = false, isAlign = false, activeEditor, onClick }: any) => {
  const isActive =
    activeEditor &&
    (isAlign
      ? isBlockActive(activeEditor, format, "align")
      : isBlock
        ? isBlockActive(activeEditor, format)
        : isMarkActive(activeEditor, format))

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    if (!activeEditor) return
    if (isAlign) {
      toggleAlign(activeEditor, format)
    } else if (isBlock) {
      toggleBlock(activeEditor, format)
    } else {
      toggleMark(activeEditor, format)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={isActive ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={handleClick}>
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{format.replace("-", " ")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Preview text box component
const PreviewTextBox = ({
  box,
  fontFamily,
  fontSize,
}: {
  box: { id: string; position: { x: number; y: number }; rotation: number; content: Descendant[]; fontSize: number }
  fontFamily: string
  fontSize: number
}) => {
  // Create a dedicated editor for each preview box
  const previewEditor = useMemo(() => withReact(createEditor()), [])

  return (
    <div
      className="absolute"
      style={{
        left: `${box.position.x}px`,
        top: `${box.position.y}px`,
        maxWidth: "800px",
        fontFamily: fontFamily,
        fontSize: `${box.fontSize || fontSize}px`,
        transform: `rotate(${box.rotation}deg)`,
        transformOrigin: "center center",
        zIndex: 5,
      }}
    >
      <div className="p-2">
        <Slate editor={previewEditor} initialValue={box.content} onChange={() => {}}>
          <Editable readOnly renderElement={Element} renderLeaf={Leaf} className="slate-editor-content" />
        </Slate>
      </div>
    </div>
  )
}

// Text box component that can be moved around
interface TextBoxProps {
  id: string
  position: { x: number; y: number }
  rotation: number
  content: Descendant[]
  onMove: (id: string, position: { x: number; y: number }) => void
  onRotate: (id: string, rotation: number) => void
  onDelete: (id: string) => void
  onContentChange: (id: string, content: Descendant[]) => void
  fontFamily: string
  fontSize: number
  onFontSizeChange: (id: string, size: number) => void
  onFontFamilyChange: (id: string, fontFamily: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
  onEditorReady: (id: string, editor: Editor) => void
}

const TextBox = ({
  id,
  position,
  rotation,
  content,
  onMove,
  onRotate,
  onDelete,
  onContentChange,
  fontFamily,
  fontSize,
  onFontSizeChange,
  onFontFamilyChange,
  isSelected,
  onSelect,
  onEditorReady,
}: TextBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [isDragging, setIsDragging] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsNew(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isNew])

  // Show controls when selected or hovered
  useEffect(() => {
    setShowControls(isSelected)
  }, [isSelected])

  // Notify parent when editor is ready
  useEffect(() => {
    onEditorReady(id, editor)
  }, [id, editor, onEditorReady])

  // Set up interact.js for dragging
  useEffect(() => {
    if (!boxRef.current) return

    // Initialize data-x and data-y attributes with the current position
    boxRef.current.setAttribute("data-x", String(position.x))
    boxRef.current.setAttribute("data-y", String(position.y))
    boxRef.current.setAttribute("data-rotation", String(rotation))

    // Apply the initial transform
    boxRef.current.style.transform = `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`

    const dragHandle = boxRef.current.querySelector(".drag-handle") as HTMLElement

    if (!dragHandle) {
      console.error("Drag handle not found")
      return
    }

    const interactable = interact(dragHandle).draggable({
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
      autoScroll: true,
      listeners: {
        start: () => {
          setIsDragging(true)
          onSelect(id)
          document.body.classList.add("dragging-active")
        },
        move: (event) => {
          // Get the current position from data attributes
          const x = Number.parseFloat(boxRef.current?.getAttribute("data-x") || "0") || 0
          const y = Number.parseFloat(boxRef.current?.getAttribute("data-y") || "0") || 0
          const rot = Number.parseFloat(boxRef.current?.getAttribute("data-rotation") || "0") || 0

          // Update the position by adding the delta
          const newX = x + event.dx
          const newY = y + event.dy

          // Update data attributes with new position
          boxRef.current?.setAttribute("data-x", String(newX))
          boxRef.current?.setAttribute("data-y", String(newY))

          // Apply transform to move the element
          if (boxRef.current) {
            boxRef.current.style.transform = `translate(${newX}px, ${newY}px) rotate(${rot}deg)`
          }
        },
        end: (event) => {
          if (!boxRef.current) return

          // Get final position from data attributes
          const finalX = Number.parseFloat(boxRef.current.getAttribute("data-x") || "0") || 0
          const finalY = Number.parseFloat(boxRef.current.getAttribute("data-y") || "0") || 0

          // Ensure the position is within bounds
          const containerRect = boxRef.current.parentElement?.getBoundingClientRect()
          const boxRect = boxRef.current.getBoundingClientRect()

          let adjustedX = finalX
          let adjustedY = finalY

          if (containerRect && boxRect) {
            // Keep at least 40px of the box visible on each side
            if (finalX < -boxRect.width + 40) adjustedX = -boxRect.width + 40
            if (finalY < 0) adjustedY = 0
            if (finalX > containerRect.width - 40) adjustedX = containerRect.width - 40
            if (finalY > containerRect.height - 40) adjustedY = containerRect.height - 40

            // Update the data attributes if position was adjusted
            if (adjustedX !== finalX || adjustedY !== finalY) {
              boxRef.current.setAttribute("data-x", String(adjustedX))
              boxRef.current.setAttribute("data-y", String(adjustedY))
              const rot = Number.parseFloat(boxRef.current.getAttribute("data-rotation") || "0") || 0
              boxRef.current.style.transform = `translate(${adjustedX}px, ${adjustedY}px) rotate(${rot}deg)`
            }
          }

          // Update the state with the new position
          onMove(id, { x: adjustedX, y: adjustedY })
          setIsDragging(false)
          document.body.classList.remove("dragging-active")
        },
      },
    })

    return () => {
      interactable.unset()
    }
  }, [id, onMove, onSelect, position.x, position.y, rotation])

  // Handle box click to select it
  const handleBoxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(id)
  }

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete(id)
  }

  // Handle rotation
  const handleRotate = (amount: number) => {
    const newRotation = rotation + amount
    onRotate(id, newRotation)

    // Update the DOM element directly for immediate feedback
    if (boxRef.current) {
      const x = Number.parseFloat(boxRef.current.getAttribute("data-x") || "0") || 0
      const y = Number.parseFloat(boxRef.current.getAttribute("data-y") || "0") || 0

      boxRef.current.setAttribute("data-rotation", String(newRotation))
      boxRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${newRotation}deg)`
    }
  }

  // Handle editor focus to clear default text
  const handleEditorFocus = () => {
    // Force clear the content immediately when focused
    if (
      content.length === 1 &&
      content[0].type === "paragraph" &&
      content[0].children.length === 1 &&
      content[0].children[0].text === "Start writing your journal here..."
    ) {
      // Use a direct editor command to clear the content
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: content[0].children[0].text.length },
      }
      editor.deleteFragment()

      // Also update the parent component's state
      const emptyContent = [{ type: "paragraph", children: [{ text: "" }] }]
      onContentChange(id, emptyContent)
    }
  }

  // Clear default text on mount
  useEffect(() => {
    if (
      content.length === 1 &&
      content[0].type === "paragraph" &&
      content[0].children.length === 1 &&
      content[0].children[0].text === "Start writing your journal here..."
    ) {
      // Clear the content with a slight delay to ensure the editor is ready
      setTimeout(() => {
        const emptyContent = [{ type: "paragraph", children: [{ text: "" }] }]
        onContentChange(id, emptyContent)
      }, 100)
    }
  }, [])

  // Check if content is the default placeholder text
  const isDefaultContent = (content: Descendant[]) => {
    return (
      content.length === 1 &&
      content[0].type === "paragraph" &&
      content[0].children.length === 1 &&
      content[0].children[0].text === "Start writing your journal here..."
    )
  }

  // Handle editor focus to clear default text
  const handleEditorFocusOld = () => {
    if (isDefaultContent(content)) {
      const emptyContent = [
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ]
      onContentChange(id, emptyContent)
    }
  }

  return (
    <div
      ref={boxRef}
      className={`textbox rounded-md ${isSelected ? "ring-1 ring-blue-500/30" : ""} ${
        isDragging ? "cursor-grabbing" : ""
      } ${isNew ? "animate-pulse ring-1 ring-green-500/30" : ""}`}
      style={{
        position: "absolute",
        minWidth: "200px",
        maxWidth: "800px",
        fontFamily: fontFamily,
        fontSize: `${fontSize}px`,
        zIndex: isSelected ? 10 : 1,
        touchAction: "none",
        transformOrigin: "center center",
      }}
      onClick={handleBoxClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isSelected && setShowControls(false)}
    >
      {/* Subtle drag handle at the top */}
      <div className="drag-handle h-4 bg-transparent hover:bg-gray-100/20 dark:hover:bg-gray-800/20 rounded-t-md flex items-center justify-center cursor-move relative">
        <div className="w-8 h-1 bg-gray-300/50 dark:bg-gray-600/50 rounded-full"></div>

        {/* Controls that appear on hover or selection */}
        {showControls && (
          <div className="absolute right-0 top-0 flex items-center space-x-1 p-1 bg-background/80 backdrop-blur-sm rounded-md border border-gray-200/30 dark:border-gray-700/30">
            {/* Rotate buttons */}
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleRotate(-15)
              }}
              title="Rotate counterclockwise"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleRotate(15)
              }}
              title="Rotate clockwise"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Delete button */}
            <button
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleDelete}
              title="Delete text box"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add a rotation indicator */}
      {isSelected && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 bg-background/80 backdrop-blur-sm rounded px-1">
          {rotation}° <span className="text-xs">(Click buttons to rotate)</span>
        </div>
      )}

      {/* Content area */}
      <div className={`p-2 rounded-b-md ${isSelected ? "ring-1 ring-blue-500" : ""}`}>
        <Slate
          editor={editor}
          initialValue={content}
          onChange={(value) => {
            onContentChange(id, value)
          }}
        >
          <Editable
            className="min-h-[50px] focus:outline-none slate-editor-content"
            renderElement={Element}
            renderLeaf={Leaf}
            placeholder="Type here..."
            spellCheck
            onClick={(e) => {
              e.stopPropagation()
              onSelect(id)
              handleEditorFocus() // Also call handleEditorFocus on click
            }}
            onFocus={() => {
              onSelect(id)
              handleEditorFocus()

              // Add this extra timeout to ensure the editor is ready
              setTimeout(() => {
                if (isDefaultContent(content)) {
                  const emptyContent = [{ type: "paragraph", children: [{ text: "" }] }]
                  onContentChange(id, emptyContent)
                }
              }, 50)
            }}
          />
        </Slate>
      </div>
    </div>
  )
}

// Main JournalEditor component
interface JournalEditorProps {
  journalId: string
  initialTitle?: string
  initialContent?: Descendant[]
  onSaved?: () => void
  isAuthenticated?: boolean | null
  onAuthNeeded?: () => void
}

export function JournalEditor({
  journalId,
  initialTitle = "Untitled Journal",
  initialContent,
  onSaved,
  isAuthenticated = null,
  onAuthNeeded,
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [textBoxes, setTextBoxes] = useState<
    {
      id: string
      position: { x: number; y: number }
      rotation: number
      content: Descendant[]
      fontSize: number
      fontFamily: string
    }[]
  >([
    {
      id: "default",
      position: { x: 40, y: 40 },
      rotation: 0,
      content: initialContent || initialValue,
      fontSize: 16,
      fontFamily: "inherit",
    },
  ])
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>("default")
  const [emojis, setEmojis] = useState<
    {
      id: string
      emoji: string
      position: { x: number; y: number }
      rotation: number
      size: number
    }[]
  >([])
  const [shapes, setShapes] = useState<
    {
      id: string
      shape: {
        type: string
        path: string
        color: string
        opacity: number
        size: number
        borderColor: string
        borderWidth: number
      }
      position: { x: number; y: number }
      rotation: number
    }[]
  >([])
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null)

  // Update the icons state to store the IconComponent
  // Replace the existing icons state with this:

  const [icons, setIcons] = useState<
    {
      id: string
      IconComponent: any
      iconName: string
      position: { x: number; y: number }
      rotation: number
      size: number
      color?: string
    }[]
  >([])

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [fontFamily, setFontFamily] = useState("inherit")
  const [background, setBackground] = useState("none")
  const [textBoxEditors, setTextBoxEditors] = useState<Record<string, Editor>>({})
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null)
  const [textColor, setTextColor] = useState("inherit")
  const [defaultFontSize, setDefaultFontSize] = useState(16)
  const [plainTextContent, setPlainTextContent] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "Start writing your plain text journal here..." }],
    },
  ])
  const [history, setHistory] = useState<{
    past: Array<{
      title: string
      textBoxes: typeof textBoxes
      emojis: typeof emojis
      icons: typeof icons
      shapes: typeof shapes
      plainTextContent: typeof plainTextContent
      background: string
    }>
    future: Array<{
      title: string
      textBoxes: typeof textBoxes
      emojis: typeof emojis
      icons: typeof icons
      shapes: typeof shapes
      plainTextContent: typeof plainTextContent
      background: string
    }>
  }>({ past: [], future: [] })

  const containerRef = useRef<HTMLDivElement>(null)

  // Set up container as a drop target for emojis
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault() // Allow drop
    }

    container.addEventListener("dragover", handleDragOver)

    return () => {
      container.removeEventListener("dragover", handleDragOver)
    }
  }, [])

  // Auto-save function
  const autoSave = useMemo(() => createAutoSave(journalId, isAuthenticated), [journalId, isAuthenticated])

  // Effect to trigger auto-save when content changes
  useEffect(() => {
    if (!isLoaded || !autoSaveEnabled) return

    // Combine all text box content for saving
    const combinedContent = textBoxes.map((box) => ({
      ...box,
      content: box.content,
    }))

    // Save both regular content and plain text content
    autoSave(title, {
      textBoxes: combinedContent as unknown as Descendant[],
      plainText: plainTextContent,
    })
  }, [title, textBoxes, plainTextContent, isLoaded, autoSaveEnabled, autoSave])

  // Load content from local storage on initial render
  useEffect(() => {
    if (!isLoaded) return

    // Try to load from local storage
    const savedContent = localStorage.getItem(`journal-${journalId}`)
    const savedTitle = localStorage.getItem(`journal-title-${journalId}`)

    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent)
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          // Check if the saved content is in the new format (array of text boxes)
          if (
            parsedContent[0] &&
            "id" in parsedContent[0] &&
            "position" in parsedContent[0] &&
            "content" in parsedContent[0]
          ) {
            // Add rotation if it doesn't exist in saved data
            const updatedContent = parsedContent.map((box) => ({
              ...box,
              rotation: box.rotation !== undefined ? box.rotation : 0,
            }))
            setTextBoxes(updatedContent)
          } else {
            // Convert old format to new format
            setTextBoxes([
              {
                id: "default",
                position: { x: 40, y: 40 },
                rotation: 0,
                content: parsedContent,
              },
            ])
          }
        }
      } catch (error) {
        console.error("Error parsing saved content:", error)
      }
    }

    if (savedTitle) {
      setTitle(savedTitle)
    }
  }, [journalId, isLoaded, initialContent])

  // Save current state to history
  const saveToHistory = useCallback(() => {
    // Don't save if nothing has changed
    if (history.past.length > 0) {
      const lastState = history.past[history.past.length - 1]
      if (
        lastState.title === title &&
        JSON.stringify(lastState.textBoxes) === JSON.stringify(textBoxes) &&
        JSON.stringify(lastState.emojis) === JSON.stringify(emojis) &&
        JSON.stringify(lastState.icons) === JSON.stringify(icons) &&
        JSON.stringify(lastState.shapes) === JSON.stringify(shapes) &&
        JSON.stringify(lastState.plainTextContent) === JSON.stringify(plainTextContent) &&
        lastState.background === background
      ) {
        return
      }
    }

    setHistory((prev) => ({
      past: [...prev.past, { title, textBoxes, emojis, icons, shapes, plainTextContent, background }],
      future: [],
    }))
  }, [title, textBoxes, emojis, icons, shapes, plainTextContent, background, history.past])

  // Handle undo
  const handleUndo = () => {
    if (history.past.length === 0) return

    const newPast = [...history.past]
    const lastState = newPast.pop()

    if (!lastState) return

    setHistory({
      past: newPast,
      future: [{ title, textBoxes, emojis, icons, shapes, plainTextContent, background }, ...history.future],
    })

    setTitle(lastState.title)
    setTextBoxes(lastState.textBoxes)
    setEmojis(lastState.emojis || [])
    setIcons(lastState.icons || [])
    setShapes(lastState.shapes || [])
    setPlainTextContent(lastState.plainTextContent || plainTextContent)
    setBackground(lastState.background)
  }

  // Handle redo
  const handleRedo = () => {
    if (history.future.length === 0) return

    const newFuture = [...history.future]
    const nextState = newFuture.shift()

    if (!nextState) return

    setHistory({
      past: [...history.past, { title, textBoxes, emojis, icons, shapes, plainTextContent, background }],
      future: newFuture,
    })

    setTitle(nextState.title)
    setTextBoxes(nextState.textBoxes)
    setEmojis(nextState.emojis || [])
    setIcons(nextState.icons || [])
    setShapes(nextState.shapes || [])
    setPlainTextContent(nextState.plainTextContent || plainTextContent)
    setBackground(nextState.background)
  }

  // Reset editor to default state
  const handleReset = () => {
    // Save current state to history before resetting
    saveToHistory()

    // Reset to default state
    setTitle(initialTitle)
    setTextBoxes([
      {
        id: "default",
        position: { x: 40, y: 40 },
        rotation: 0,
        content: [{ type: "paragraph", children: [{ text: "" }] }],
        fontSize: 16,
        fontFamily: "inherit",
      },
    ])
    setEmojis([])
    setIcons([])
    setShapes([])
    setPlainTextContent([
      {
        type: "paragraph",
        children: [{ text: "Start writing your plain text here..." }],
      },
    ])
    setBackground("none")
    setSelectedTextBoxId("default")
    setSelectedEmojiId(null)
    setSelectedIconId(null)
    setSelectedShapeId(null)
  }

  // Save state to history when content changes (debounced)
  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(() => {
      // Only save if there are actual changes
      if (history.past.length === 0) {
        saveToHistory()
        return
      }

      const lastState = history.past[history.past.length - 1]
      const currentStateStr = JSON.stringify({ title, textBoxes, background })
      const lastStateStr = JSON.stringify({
        title: lastState.title,
        textBoxes: lastState.textBoxes,
        background: lastState.background,
      })

      if (currentStateStr !== lastStateStr) {
        saveToHistory()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, textBoxes, background, isLoaded, saveToHistory, history.past])

  // Handle adding a new text box
  const handleAddTextBox = () => {
    const newId = `textbox-${Date.now()}`
    const containerRect = containerRef.current?.getBoundingClientRect()

    // Default position in the center if container dimensions are not available
    let newX = 100
    let newY = 100

    if (containerRect) {
      // Calculate a position that ensures the textbox is visible
      // Start with a safe position
      newX = 40
      newY = 40

      // If there are existing textboxes, position relative to the last one
      if (textBoxes.length > 0) {
        // Get the last textbox
        const lastBox = textBoxes[textBoxes.length - 1]

        // Try to position to the right of the last box
        newX = lastBox.position.x + 220

        // If that would go off-screen, position below instead
        if (newX > containerRect.width - 250) {
          newX = 40
          newY = Math.max(...textBoxes.map((box) => box.position.y)) + 100
        }

        // If that would go off-screen too, find a visible spot
        if (newY > containerRect.height - 150) {
          // Find a gap between existing boxes
          newX = 40
          newY = 40

          // Simple algorithm to find a gap - can be improved
          let foundGap = false
          const boxHeight = 150 // Approximate height
          const boxWidth = 220 // Approximate width

          // Try a grid approach
          for (let y = 40; y < containerRect.height - boxHeight; y += boxHeight) {
            for (let x = 40; x < containerRect.width - boxWidth; x += boxWidth) {
              // Check if this position overlaps with any existing box
              const overlaps = textBoxes.some((box) => {
                return (
                  x < box.position.x + boxWidth &&
                  x + boxWidth > box.position.x &&
                  y < box.position.y + boxHeight &&
                  y + boxHeight > box.position.y
                )
              })

              if (!overlaps) {
                newX = x
                newY = y
                foundGap = true
                break
              }
            }
            if (foundGap) break
          }

          // If no gap found, just place at origin
          if (!foundGap) {
            newX = 40
            newY = 40
          }
        }
      }
    }

    // Create a new textbox with EMPTY content
    setTextBoxes((prevBoxes) => [
      ...prevBoxes,
      {
        id: newId,
        position: { x: newX, y: newY },
        rotation: 0,
        fontSize: defaultFontSize,
        fontFamily: "inherit",
        content: [{ type: "paragraph", children: [{ text: "" }] }],
      },
    ])

    // Set the new text box as selected
    setSelectedTextBoxId(newId)
  }

  // Handle adding a new emoji
  const handleAddEmoji = (emoji: string) => {
    const newId = `emoji-${Date.now()}`
    const containerRect = containerRef.current?.getBoundingClientRect()

    // Default position in the center if container dimensions are not available
    let newX = 200
    let newY = 200

    if (containerRect) {
      // Position in the center of the visible area
      newX = containerRect.width / 2 - 24
      newY = containerRect.height / 2 - 24
    }

    setEmojis((prevEmojis) => [
      ...prevEmojis,
      {
        id: newId,
        emoji: emoji,
        position: { x: newX, y: newY },
        rotation: 0,
        size: 48,
      },
    ])

    // Set the new emoji as selected
    setSelectedEmojiId(newId)
    setSelectedTextBoxId(null)
  }

  // Handle adding a new shape
  const handleAddShape = (shapeData: {
    type: string
    path: string
    color: string
    opacity: number
    size: number
    borderColor: string
    borderWidth: number
  }) => {
    const newId = `shape-${Date.now()}`
    const containerRect = containerRef.current?.getBoundingClientRect()

    // Default position in the center if container dimensions are not available
    let newX = 200
    let newY = 200

    if (containerRect) {
      // Position in the center of the visible area
      newX = containerRect.width / 2 - shapeData.size / 2
      newY = containerRect.height / 2 - shapeData.size / 2
    }

    setShapes((prevShapes) => [
      ...prevShapes,
      {
        id: newId,
        shape: shapeData,
        position: { x: newX, y: newY },
        rotation: 0,
      },
    ])

    // Set the new shape as selected
    setSelectedShapeId(newId)
    setSelectedTextBoxId(null)
    setSelectedEmojiId(null)
  }

  // Update the handleAddIcon function to store the IconComponent
  // Replace the existing handleAddIcon function with this:

  const handleAddIcon = (IconComponent: any, iconName: string, size: number, color?: string) => {
    const newId = `icon-${Date.now()}`
    const containerRect = containerRef.current?.getBoundingClientRect()

    // Default position in the center if container dimensions are not available
    let newX = 200
    let newY = 200

    if (containerRect) {
      // Position in the center of the visible area
      newX = containerRect.width / 2 - size / 2
      newY = containerRect.height / 2 - size / 2
    }

    setIcons((prevIcons) => [
      ...prevIcons,
      {
        id: newId,
        IconComponent,
        iconName,
        position: { x: newX, y: newY },
        rotation: 0,
        size,
        color,
      },
    ])

    // Set the new icon as selected
    setSelectedIconId(newId)
    setSelectedTextBoxId(null)
    setSelectedEmojiId(null)
    setSelectedShapeId(null)
  }

  // Handle moving a text box
  const handleMoveTextBox = (id: string, position: { x: number; y: number }) => {
    // Ensure we're working with numbers
    const x = typeof position.x === "number" ? position.x : Number.parseFloat(String(position.x)) || 0
    const y = typeof position.y === "number" ? position.y : Number.parseFloat(String(position.y)) || 0

    // Update the text box position
    setTextBoxes((prevBoxes) => prevBoxes.map((box) => (box.id === id ? { ...box, position: { x, y } } : box)))
  }

  // Handle rotating a text box
  const handleRotateTextBox = (id: string, rotation: number) => {
    setTextBoxes((prevBoxes) => prevBoxes.map((box) => (box.id === id ? { ...box, rotation } : box)))
  }

  // Handle deleting a text box
  const handleDeleteTextBox = (id: string) => {
    console.log("Deleting text box:", id)

    // Don't delete if it's the last text box
    if (textBoxes.length <= 1) {
      // If it's the last box, just clear its content instead
      setTextBoxes(
        textBoxes.map((box) =>
          box.id === id ? { ...box, content: [{ type: "paragraph", children: [{ text: "" }] }] } : box,
        ),
      )
      return
    }

    // Remove the text box
    const updatedBoxes = textBoxes.filter((box) => box.id !== id)
    setTextBoxes(updatedBoxes)

    // If the deleted box was selected, select another one
    if (selectedTextBoxId === id) {
      setSelectedTextBoxId(updatedBoxes.length > 0 ? updatedBoxes[0].id : null)
    }
  }

  // Handle moving an emoji
  const handleMoveEmoji = (id: string, position: { x: number; y: number }) => {
    // Ensure we're working with numbers
    const x = typeof position.x === "number" ? position.x : Number.parseFloat(String(position.x)) || 0
    const y = typeof position.y === "number" ? position.y : Number.parseFloat(String(position.y)) || 0

    // Update the emoji position with a new object to ensure state change is detected
    setEmojis((prevEmojis) => prevEmojis.map((emoji) => (emoji.id === id ? { ...emoji, position: { x, y } } : emoji)))
  }

  // Handle rotating an emoji
  const handleRotateEmoji = (id: string, rotation: number) => {
    setEmojis((prevEmojis) => prevEmojis.map((emoji) => (emoji.id === id ? { ...emoji, rotation } : emoji)))
  }

  // Handle deleting an emoji
  const handleDeleteEmoji = (id: string) => {
    setEmojis((prevEmojis) => prevEmojis.filter((emoji) => emoji.id !== id))

    // If the deleted emoji was selected, deselect it
    if (selectedEmojiId === id) {
      setSelectedEmojiId(null)
    }
  }

  // Handle resizing an emoji
  const handleResizeEmoji = (id: string, size: number) => {
    setEmojis((prevEmojis) => prevEmojis.map((emoji) => (emoji.id === id ? { ...emoji, size } : emoji)))
  }

  // Handle moving a shape
  const handleMoveShape = (id: string, position: { x: number; y: number }) => {
    // Ensure we're working with numbers
    const x = typeof position.x === "number" ? position.x : Number.parseFloat(String(position.x)) || 0
    const y = typeof position.y === "number" ? position.y : Number.parseFloat(String(position.y)) || 0

    // Update the shape position
    setShapes((prevShapes) => prevShapes.map((shape) => (shape.id === id ? { ...shape, position: { x, y } } : shape)))
  }

  // Handle rotating a shape
  const handleRotateShape = (id: string, rotation: number) => {
    setShapes((prevShapes) => prevShapes.map((shape) => (shape.id === id ? { ...shape, rotation } : shape)))
  }

  // Handle deleting a shape
  const handleDeleteShape = (id: string) => {
    setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== id))

    // If the deleted shape was selected, deselect it
    if (selectedShapeId === id) {
      setSelectedShapeId(null)
    }
  }

  // Handle resizing a shape
  const handleResizeShape = (id: string, size: number) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) => (shape.id === id ? { ...shape, shape: { ...shape.shape, size } } : shape)),
    )
  }

  // Handle updating shape properties
  const handleUpdateShape = (id: string, updates: Partial<any>) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) => (shape.id === id ? { ...shape, shape: { ...shape.shape, ...updates } } : shape)),
    )
  }

  // Handle moving an icon
  const handleMoveIcon = (id: string, position: { x: number; y: number }) => {
    // Ensure we're working with numbers
    const x = typeof position.x === "number" ? position.x : Number.parseFloat(String(position.x)) || 0
    const y = typeof position.y === "number" ? position.y : Number.parseFloat(String(position.y)) || 0

    // Update the icon position
    setIcons((prevIcons) => prevIcons.map((icon) => (icon.id === id ? { ...icon, position: { x, y } } : icon)))
  }

  // Handle rotating an icon
  const handleRotateIcon = (id: string, rotation: number) => {
    setIcons((prevIcons) => prevIcons.map((icon) => (icon.id === id ? { ...icon, rotation } : icon)))
  }

  // Handle deleting an icon
  const handleDeleteIcon = (id: string) => {
    setIcons((prevIcons) => prevIcons.filter((icon) => icon.id !== id))

    // If the deleted icon was selected, deselect it
    if (selectedIconId === id) {
      setSelectedIconId(null)
    }
  }

  // Handle resizing an icon
  const handleResizeIcon = (id: string, size: number) => {
    setIcons((prevIcons) => prevIcons.map((icon) => (icon.id === id ? { ...icon, size } : icon)))
  }

  // Handle selecting an emoji
  const handleSelectEmoji = (id: string) => {
    setSelectedEmojiId(id)
    setSelectedTextBoxId(null)
    setActiveEditor(null)
  }

  // Handle selecting a shape
  const handleSelectShape = (id: string) => {
    setSelectedShapeId(id)
    setSelectedTextBoxId(null)
    setSelectedEmojiId(null)
    setActiveEditor(null)
  }

  // Handle selecting an icon
  const handleSelectIcon = (id: string) => {
    setSelectedIconId(id)
    setSelectedTextBoxId(null)
    setSelectedEmojiId(null)
    setSelectedShapeId(null)
    setActiveEditor(null)
  }

  // Handle text box content change
  const handleTextBoxContentChange = (id: string, content: Descendant[]) => {
    setTextBoxes(textBoxes.map((box) => (box.id === id ? { ...box, content } : box)))
  }

  const handleFontSizeChange = (id: string, size: number) => {
    setTextBoxes(textBoxes.map((box) => (box.id === id ? { ...box, fontSize: size } : box)))
  }

  const handleFontFamilyChange = (id: string, fontFamily: string) => {
    setTextBoxes(textBoxes.map((box) => (box.id === id ? { ...box, fontFamily } : box)))
  }

  // Handle selecting a text box
  const handleSelectTextBox = (id: string) => {
    setSelectedTextBoxId(id)
    // Set the active editor when selecting a text box
    if (textBoxEditors[id]) {
      setActiveEditor(textBoxEditors[id])
    }
  }

  // Handle container click to deselect all text boxes, emojis, and shapes
  const handleContainerClick = () => {
    setSelectedTextBoxId(null)
    setSelectedEmojiId(null)
    setSelectedShapeId(null)
    setSelectedIconId(null)
    setActiveEditor(null)
  }

  // Handle text color change
  const handleTextColorChange = (color: string) => {
    if (!activeEditor) return

    // Apply color to selected text
    if (color === "inherit") {
      // Remove the color mark if setting to default
      activeEditor.removeMark("color")
    } else {
      activeEditor.addMark("color", color)
    }
    setTextColor(color)
  }

  // Handle template application
  const applyTemplate = (template: Descendant[]) => {
    // Apply template to the selected text box or create a new one
    if (selectedTextBoxId) {
      setTextBoxes(textBoxes.map((box) => (box.id === selectedTextBoxId ? { ...box, content: template } : box)))
    } else {
      handleAddTextBox()
      // We need to wait for the state update before applying the template
      setTimeout(() => {
        setTextBoxes((prev) =>
          prev.map((box) => (box.id === prev[prev.length - 1].id ? { ...box, content: template } : box)),
        )
      }, 0)
    }
  }

  const handleSaveToCloud = async () => {
    setSaving(true)
    setSaveStatus("saving")

    try {
      if (!isAuthenticated) {
        onAuthNeeded?.()
        return
      }

      // Save the text boxes structure
      await saveJournalToSupabase(journalId, title, textBoxes as unknown as Descendant[])

      setSaveStatus("saved")
      onSaved?.()
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  const handleEditorReady = useCallback(
    (id: string, editor: Editor) => {
      setTextBoxEditors((prev) => ({
        ...prev,
        [id]: editor,
      }))

      // If this is the selected text box, set it as the active editor
      if (id === selectedTextBoxId) {
        setActiveEditor(editor)
      }
    },
    [selectedTextBoxId],
  )

  const handleExport = () => {
    try {
      // Create a simple HTML representation
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${
          Tabs.defaultValue === "plain-text"
            ? `<div>
            ${plainTextContent
              .map((node) => {
                if (node.type === "paragraph") {
                  return `<p>${node.children.map((child: any) => child.text).join("")}</p>`
                }
                return ""
              })
              .join("")}
          </div>`
            : `<div>
            ${textBoxes
              .map(
                (box) => `
              <div style="margin-bottom: 20px;">
                ${box.content
                  .map((node) => {
                    if (node.type === "paragraph") {
                      return `<p>${node.children.map((child: any) => child.text).join("")}</p>`
                    }
                    return ""
                  })
                  .join("")}
              </div>
            `,
              )
              .join("")}
          </div>`
        }
      </body>
      </html>
    `

      // Create a blob and download link
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/\s+/g, "-")}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting journal:", error)
    }
  }

  // Update the print function to handle CSS backgrounds properly
  const handlePrint = () => {
    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"

    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

    if (!iframeDoc) {
      document.body.removeChild(iframe)
      alert("Unable to create print preview")
      return
    }

    // For CSS backgrounds, include the CSS directly
    let backgroundCSS = ""
    if (background !== "none" && !background.startsWith("url(") && !background.includes("gradient")) {
      backgroundCSS = `
  .print-background {
    ${background}
    opacity: 0.85;
  }
  `
    }

    // Generate HTML content for printing
    const printContent = `
<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<style>
  @page {
    size: auto;
    margin: 0mm;
  }
  html, body { 
    font-family: ${fontFamily || "Arial, sans-serif"};
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  body {
    position: relative;
    min-height: 100vh;
  }
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    page-break-inside: avoid;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  .content {
    position: relative;
    z-index: 10;
    padding: 20px;
  }
  .text-box { 
    position: absolute; 
    transform-origin: center center;
    z-index: 10;
    background-color: transparent !important;
  }
  .plain-text {
    position: relative;
    z-index: 10;
    padding: 20px;
  }
  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  ${backgroundCSS}
</style>
</head>
<body>
${background === "none" ? "" : `<div class="background" style="background: ${background};"></div>`}
<div class="content">
  <h1>${title}</h1>
  ${
    Tabs.defaultValue === "plain-text"
      ? `<div class="plain-text">
      ${plainTextContent
        .map((node) => {
          if (node.type === "paragraph") {
            return `<p>${node.children
              .map((child: any) => {
                let text = child.text
                if (child.bold) text = `<strong>${text}</strong>`
                if (child.italic) text = `<em>${text}</em>`
                if (child.underline) text = `<u>${text}</u>`
                if (child.color) text = `<span style="color:${child.color}">${text}</span>`
                return text
              })
              .join("")}</p>`
          } else if (node.type === "heading-one") {
            return `<h1>${node.children.map((child: any) => child.text).join("")}</h1>`
          } else if (node.type === "heading-two") {
            return `<h2>${node.children.map((child: any) => child.text).join("")}</h2>`
          } else if (node.type === "bulleted-list") {
            return `<ul>${(node.children as any[]).map((item) => `<li>${item.children.map((child: any) => child.text).join("")}</li>`).join("")}</ul>`
          } else if (node.type === "numbered-list") {
            return `<ol>${(node.children as any[]).map((item) => `<li>${item.children.map((child: any) => child.text).join("")}</li>`).join("")}</ol>`
          }
          return ""
        })
        .join("")}
    </div>`
      : `${textBoxes
          .map(
            (box) => `
      <div class="text-box" style="left: ${box.position.x}px; top: ${box.position.y}px; transform: rotate(${box.rotation}deg); font-family: ${box.fontFamily}; font-size: ${box.fontSize}px;">
    ${box.content
      .map((node) => {
        if (node.type === "heading-one") {
          return `<h1>${node.children.map((child: any) => child.text).join("")}</h1>`
        } else if (node.type === "heading-two") {
          return `<h2>${node.children.map((child: any) => child.text).join("")}</h2>`
        } else if (node.type === "bulleted-list") {
          return `<ul>${(node.children as any[]).map((item) => `<li>${item.children.map((child: any) => child.text).join("")}</li>`).join("")}</ul>`
        } else if (node.type === "numbered-list") {
          return `<ol>${(node.children as any[]).map((item) => `<li>${item.children.map((child: any) => child.text).join("")}</li>`).join("")}</ol>`
        } else {
          return `<p>${node.children
            .map((child: any) => {
              let text = child.text
              if (child.bold) text = `<strong>${text}</strong>`
              if (child.italic) text = `<em>${text}</em>`
              if (child.underline) text = `<u>${text}</u>`
              if (child.color) text = `<span style="color:${child.color}">${text}</span>`
              return text
            })
            .join("")}</p>`
        }
      })
      .join("")}
  </div>
`,
          )
          .join("")}`
  }
${emojis
  .map(
    (emoji) => `
<div style="position: absolute; left: ${emoji.position.x}px; top: ${emoji.position.y}px; font-size: ${emoji.size}px; transform: rotate(${emoji.rotation}deg); transform-origin: center center; z-index: 5;">
${emoji.emoji}
</div>
`,
  )
  .join("")}
${shapes
  .map(
    (shapeItem) => `
<div style="position: absolute; left: ${shapeItem.position.x}px; top: ${shapeItem.position.y}px; transform: rotate(${shapeItem.rotation}deg); transform-origin: center center; z-index: 5;">
<svg width="${shapeItem.shape.size}" height="${shapeItem.shape.size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="${shapeItem.shape.path}" fill="${shapeItem.shape.color}" fillOpacity="${shapeItem.shape.opacity}" stroke="${shapeItem.shape.borderColor}" strokeWidth="${shapeItem.shape.borderWidth}" />
</svg>
</div>
`,
  )
  .join("")}

// Update the rendering of icons in the preview
// Replace the existing icons.map section in the preview with this:

${icons.map((iconItem) => (
  <div
    key={iconItem.id}
    className="absolute"
    style={{
      left: `${iconItem.position.x}px`,
      top: `${iconItem.position.y}px`,
      transform: `rotate(${iconItem.rotation}deg)`,
      transformOrigin: "center center",
      zIndex: 5,
    }}
  >
    <div style={{ width: `${iconItem.size}px`, height: `${iconItem.size}px` }}>
      {React.createElement(iconItem.IconComponent, {
        size: iconItem.size,
        color: iconItem.color,
      })}
    </div>
  </div>
))}
</div>
</body>
</html>
`

    // Write content to iframe
    iframeDoc.open()
    iframeDoc.write(printContent)
    iframeDoc.close()

    // Wait for content to load then print
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 100)
    }, 250)
  }

  return (
    <Card className="p-4 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold"
          placeholder="Journal Title"
        />
        <div className="flex items-center gap-4">
          <AutoSaveToggle enabled={autoSaveEnabled} onToggle={(enabled) => setAutoSaveEnabled(enabled)} />
          <Button onClick={handleSaveToCloud} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="plain-text">Plain Text</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="focus:outline-none">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={handleAddTextBox}>Add Text Box</Button>

            {/* Reset button */}
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-1" title="Reset editor">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>

            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleUndo}
                disabled={history.past.length === 0}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRedo}
                disabled={history.future.length === 0}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Export and Print buttons */}
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>

            {/* Formatting toolbar */}
            <div className="flex items-center border rounded-md p-1 bg-background overflow-x-auto">
              {/* Always visible tools */}
              <FormatButton format="bold" icon={Bold} activeEditor={activeEditor} />
              <FormatButton format="italic" icon={Italic} activeEditor={activeEditor} />
              <FormatButton format="underline" icon={Underline} activeEditor={activeEditor} />
              <div className="h-6 w-px bg-border mx-1" />
              <FormatButton format="heading-one" icon={Heading1} isBlock activeEditor={activeEditor} />
              <FormatButton format="heading-two" icon={Heading2} isBlock activeEditor={activeEditor} />
              <div className="h-6 w-px bg-border mx-1" />
              <FormatButton format="bulleted-list" icon={List} isBlock activeEditor={activeEditor} />
              <FormatButton format="numbered-list" icon={ListOrdered} isBlock activeEditor={activeEditor} />
              <div className="h-6 w-px bg-border mx-1" />
              <FormatButton format="left" icon={AlignLeft} isAlign activeEditor={activeEditor} />
              <FormatButton format="center" icon={AlignCenter} isAlign activeEditor={activeEditor} />
              <FormatButton format="right" icon={AlignRight} activeEditor={activeEditor} />
              <div className="h-6 w-px bg-border mx-1" />
              {/* Color picker */}
              <ColorPicker onColorChange={handleTextColorChange} />
              {/* Text size slider */}
              <TextResizer
                value={
                  selectedTextBoxId
                    ? textBoxes.find((box) => box.id === selectedTextBoxId)?.fontSize || defaultFontSize
                    : defaultFontSize
                }
                onValueChange={(size) => {
                  if (selectedTextBoxId) {
                    handleFontSizeChange(selectedTextBoxId, size)
                  } else {
                    setDefaultFontSize(size)
                  }
                }}
              />
              <div className="h-6 w-px bg-border mx-1" />
              {/* Font selector */}
              <FontSelector
                onFontChange={(font) => {
                  if (selectedTextBoxId) {
                    handleFontFamilyChange(selectedTextBoxId, font)
                  } else {
                    setFontFamily(font)
                  }
                }}
                value={
                  selectedTextBoxId
                    ? textBoxes.find((box) => box.id === selectedTextBoxId)?.fontFamily || "inherit"
                    : fontFamily
                }
              />
              {/* Template selector */}
              <TemplateSelector onSelectTemplate={applyTemplate} />
              {/* Background selector */}
              <BackgroundUploader onBackgroundChange={(bg) => setBackground(bg)} />
              {/* Emoji picker */}
              <EmojiPicker onEmojiSelect={handleAddEmoji} />
              {/* Shape picker */}
              <ShapePicker onShapeSelect={handleAddShape} />
              {/* Icon picker */}
              <SimplifiedIconPicker onIconSelect={handleAddIcon} />
            </div>
          </div>
          <div
            ref={containerRef}
            className="min-h-[500px] h-[70vh] p-4 border border-gray-200 dark:border-gray-700 rounded-md relative editor-container overflow-auto"
            style={{ position: "relative", zIndex: 1 }}
            onClick={handleContainerClick}
          >
            {background !== "none" && (
              <div
                className="absolute inset-0 background-layer"
                style={background === "none" ? {} : { background: background }}
              />
            )}
            {/* Render all text boxes directly without wrapper divs */}
            {textBoxes.map((box) => (
              <TextBox
                key={box.id}
                id={box.id}
                position={box.position}
                rotation={box.rotation}
                content={box.content}
                onMove={handleMoveTextBox}
                onRotate={handleRotateTextBox}
                onDelete={handleDeleteTextBox}
                onContentChange={handleTextBoxContentChange}
                fontFamily={box.fontFamily}
                fontSize={box.fontSize}
                onFontSizeChange={handleFontSizeChange}
                onFontFamilyChange={handleFontFamilyChange}
                isSelected={selectedTextBoxId === box.id}
                onSelect={handleSelectTextBox}
                onEditorReady={handleEditorReady}
              />
            ))}
            {/* Render all emojis */}
            {emojis.map((emoji) => (
              <DraggableEmoji
                key={emoji.id}
                emoji={emoji.emoji}
                id={emoji.id}
                position={emoji.position}
                rotation={emoji.rotation}
                size={emoji.size}
                onMove={handleMoveEmoji}
                onRotate={handleRotateEmoji}
                onDelete={handleDeleteEmoji}
                onResize={handleResizeEmoji}
                isSelected={selectedEmojiId === emoji.id}
                onSelect={handleSelectEmoji}
              />
            ))}
            {/* Render all shapes */}
            {shapes.map((shapeItem) => (
              <DraggableShape
                key={shapeItem.id}
                id={shapeItem.id}
                shape={shapeItem.shape}
                position={shapeItem.position}
                rotation={shapeItem.rotation}
                onMove={handleMoveShape}
                onRotate={handleRotateShape}
                onDelete={handleDeleteShape}
                onResize={handleResizeShape}
                onUpdateShape={handleUpdateShape}
                isSelected={selectedShapeId === shapeItem.id}
                onSelect={handleSelectShape}
              />
            ))}
            {/* Render all icons */}
            {icons.map((iconItem) => (
              <DraggableIcon
                key={iconItem.id}
                id={iconItem.id}
                IconComponent={iconItem.IconComponent}
                iconName={iconItem.iconName}
                position={iconItem.position}
                rotation={iconItem.rotation}
                size={iconItem.size}
                color={iconItem.color}
                onMove={handleMoveIcon}
                onRotate={handleRotateIcon}
                onDelete={handleDeleteIcon}
                onResize={handleResizeIcon}
                isSelected={selectedIconId === iconItem.id}
                onSelect={handleSelectIcon}
              />
            ))}
            <div className="absolute bottom-2 right-2 no-print">
              <WordCounter content={textBoxes.flatMap((box) => box.content)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plain-text" className="focus:outline-none">
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Formatting toolbar - simplified for plain text */}
            <div className="flex items-center border rounded-md p-1 bg-background overflow-x-auto">
              {/* Basic formatting */}
              <FormatButton format="bold" icon={Bold} activeEditor={activeEditor} />
              <FormatButton format="italic" icon={Italic} activeEditor={activeEditor} />
              <FormatButton format="underline" icon={Underline} activeEditor={activeEditor} />

              <div className="h-6 w-px bg-border mx-1" />

              {/* Font selector */}
              <FontSelector onFontChange={setFontFamily} value={fontFamily} />

              {/* Text size slider */}
              <TextResizer value={defaultFontSize} onValueChange={setDefaultFontSize} />

              <div className="h-6 w-px bg-border mx-1" />

              {/* Background selector */}
              <BackgroundUploader onBackgroundChange={(bg) => setBackground(bg)} />
            </div>
          </div>

          <PlainTextEditor
            initialContent={plainTextContent}
            onContentChange={setPlainTextContent}
            fontFamily={fontFamily}
            fontSize={defaultFontSize}
            background={background}
          />
        </TabsContent>

        <TabsContent value="preview" className="focus:outline-none">
          <div
            className="min-h-[500px] h-[70vh] p-4 border border-gray-200 dark:border-gray-700 rounded-md relative preview-container overflow-auto"
            style={{ position: "relative", zIndex: 1 }}
          >
            {background !== "none" && (
              <div className="absolute inset-0 -z-10" style={background === "none" ? {} : { background: background }} />
            )}
            {/* Preview title */}
            <div className="absolute text-2xl font-bold" style={{ top: "20px", left: "20px" }}>
              {title}
            </div>
            {/* Preview all text boxes */}
            {textBoxes.map((box) => (
              <PreviewTextBox key={box.id} box={box} fontFamily={box.fontFamily} fontSize={defaultFontSize} />
            ))}
            {/* Preview all emojis */}
            {emojis.map((emoji) => (
              <div
                key={emoji.id}
                className="absolute"
                style={{
                  left: `${emoji.position.x}px`,
                  top: `${emoji.position.y}px`,
                  fontSize: `${emoji.size}px`,
                  transform: `rotate(${emoji.rotation}deg)`,
                  transformOrigin: "center center",
                  zIndex: 5,
                }}
              >
                {emoji.emoji}
              </div>
            ))}
            {/* Preview all shapes */}
            {shapes.map((shapeItem) => (
              <div
                key={shapeItem.id}
                className="absolute"
                style={{
                  left: `${shapeItem.position.x}px`,
                  top: `${shapeItem.position.y}px`,
                  transform: `rotate(${shapeItem.rotation}deg)`,
                  transformOrigin: "center center",
                  zIndex: 5,
                }}
              >
                <svg
                  width={shapeItem.shape.size}
                  height={shapeItem.shape.size}
                  viewBox="-10 -10 120 120"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d={shapeItem.shape.path}
                    fill={shapeItem.shape.color}
                    fillOpacity={shapeItem.shape.opacity}
                    stroke={shapeItem.shape.borderColor}
                    strokeWidth={shapeItem.shape.borderWidth}
                  />
                </svg>
              </div>
            ))}
            {/* Preview all icons */}
            {icons.map((iconItem) => (
              <div
                key={iconItem.id}
                className="absolute"
                style={{
                  left: `${iconItem.position.x}px`,
                  top: `${iconItem.position.y}px`,
                  transform: `rotate(${iconItem.rotation}deg)`,
                  transformOrigin: "center center",
                  zIndex: 5,
                }}
              >
                <div style={{ width: `${iconItem.size}px`, height: `${iconItem.size}px` }}>
                  {React.createElement(iconItem.IconComponent, {
                    size: iconItem.size,
                    color: iconItem.color,
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .editor-container, .preview-container {
          position: relative;
          overflow: hidden;
        }

        .dragging-active {
          cursor: grabbing !important;
          user-select: none;
        }

        .dragging-active * {
          user-select: none;
        }

        /* Add this to ensure draggable elements work properly */
        .textbox {
          touch-action: none;
          transform-origin: center center;
          will-change: transform;
          position: absolute !important;
          background-color: transparent !important;
        }

        .textbox .slate-editor-content {
          background-color: transparent !important;
        }

        .drag-handle {
          cursor: move !important;
          user-select: none;
          background-color: rgba(255, 255, 255, 0.2) !important;
        }

        .drag-handle:hover {
          background-color: rgba(255, 255, 255, 0.4) !important;
        }

        .dark .drag-handle:hover {
          background-color: rgba(0, 0, 0, 0.3) !important;
        }

        .emoji-draggable {
          cursor: grab;
          user-select: none;
          touch-action: none;
          will-change: transform;
        }
        
        .emoji-draggable:active {
          cursor: grabbing;
        }

        @media print {
          .no-print {
            display: none;
          }
        }

        .emoji-item {
          touch-action: none;
          user-select: none;
          cursor: grab;
          position: absolute !important;
          z-index: 5;
        }

        .emoji-item:hover {
          z-index: 10;
        }
        
        .emoji-item:active {
          cursor: grabbing;
        }

        .icon-item {
          touch-action: none;
          user-select: none;
          cursor: grab;
          position: absolute !important;
          z-index: 5;
        }

        .icon-item:hover {
          z-index: 10;
        }

        .icon-item:active {
          cursor: grabbing;
        }
      `}</style>
    </Card>
  )
}

export default JournalEditor

