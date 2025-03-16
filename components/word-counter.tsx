"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getWordCount, getCharacterCount } from "@/lib/editor-utils"
import type { Descendant } from "slate"

interface WordCounterProps {
  content: Descendant[]
}

export function WordCounter({ content }: WordCounterProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setWordCount(getWordCount(content))
    setCharCount(getCharacterCount(content))
  }, [content])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-xs text-muted-foreground">{wordCount} words</div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p>{wordCount} words</p>
            <p>{charCount} characters</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

