"use client"

import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { Type } from "lucide-react"

interface TextResizerProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function TextResizer({ value = 16, onValueChange, min = 8, max = 72, step = 1 }: TextResizerProps) {
  const [size, setSize] = useState(value)

  const handleChange = (newValue: number[]) => {
    const value = newValue[0]
    setSize(value)
    onValueChange(value)
  }

  return (
    <div className="flex items-center gap-2 w-32">
      <Type className="h-4 w-4 flex-shrink-0" />
      <Slider value={[size]} min={min} max={max} step={step} onValueChange={handleChange} className="flex-1" />
      <span className="text-xs w-6 text-center">{size}</span>
    </div>
  )
}

