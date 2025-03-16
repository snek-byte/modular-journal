"use client"

import { useState, useCallback } from "react"
import { createEditor, type Descendant, type Editor } from "slate"
import { Slate, Editable, withReact } from "slate-react"

type CustomEditor = Editor

const JournalEditor = () => {
  const [editor] = useState<CustomEditor>(() => withReact(createEditor()))

  const [plainTextContent, setPlainTextContent] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "Start writing your plain text journal here..." }],
    },
  ])

  const renderElement = useCallback((props) => {
    return <Element {...props} />
  }, [])

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />
  }, [])

  return (
    <Slate editor={editor} value={plainTextContent} onChange={(value) => setPlainTextContent(value)}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
      />
    </Slate>
  )
}

const Element = (props: any) => {
  switch (props.element.type) {
    default:
      return <p {...props.attributes}>{props.children}</p>
  }
}

const Leaf = (props: any) => {
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}>
      {props.children}
    </span>
  )
}

export default JournalEditor

