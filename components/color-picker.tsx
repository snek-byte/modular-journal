"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  onColorChange: (color: string) => void
}

export function ColorPicker({ onColorChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customColor, setCustomColor] = useState("#000000")

  const colors = [
    { name: "Default", value: "inherit" },
    { name: "Black", value: "#000000" },
    { name: "Gray", value: "#6b7280" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
  ]

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    setOpen(false)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
  }

  const handleCustomColorApply = () => {
    onColorChange(customColor)
    setOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)} title="Text color">
        <Palette className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Choose Text Color</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value === "inherit" ? "#ffffff" : color.value }}
                  onClick={() => handleColorSelect(color.value)}
                  title={color.name}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <div className="text-sm font-medium">Custom Color:</div>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="#RRGGBB"
                />
              </div>
              <Button onClick={handleCustomColorApply}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

