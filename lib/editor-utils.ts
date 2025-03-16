import { Editor, Transforms, Element as SlateElement, Text } from "slate"
import type { Descendant } from "slate"

// Check if a block format is active
export const isBlockActive = (editor: Editor, format: string, blockType = "type") => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
  })

  return !!match
}

// Check if a mark is active
export const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

// Toggle a block format
export const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format)
  const isList = format === "bulleted-list" || format === "numbered-list"

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && ["bulleted-list", "numbered-list"].includes(n.type as string),
    split: true,
  })

  const newProperties: Partial<SlateElement> = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  }

  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

// Toggle a mark
export const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

// Toggle text alignment
export const toggleAlign = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format, "align")

  Transforms.setNodes(editor, {
    align: isActive ? undefined : format,
  })
}

// Get the word count of the editor content
export const getWordCount = (nodes: Descendant[]): number => {
  const text = nodes
    .map((node) => {
      if (SlateElement.isElement(node)) {
        return node.children.map((child) => (Text.isText(child) ? child.text : "")).join(" ")
      }
      return ""
    })
    .join(" ")
    .trim()

  return text ? text.split(/\s+/).length : 0
}

// Get the character count of the editor content
export const getCharacterCount = (nodes: Descendant[]): number => {
  const text = nodes
    .map((node) => {
      if (SlateElement.isElement(node)) {
        return node.children.map((child) => (Text.isText(child) ? child.text : "")).join("")
      }
      return ""
    })
    .join("")

  return text.length
}

