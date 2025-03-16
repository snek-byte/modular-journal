"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Define available Google Fonts
export const googleFonts = [
  { name: "Default", value: "inherit" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Lato", value: "'Lato', sans-serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Poppins", value: "'Poppins', sans-serif" },
  { name: "Raleway", value: "'Raleway', sans-serif" },
  { name: "Ubuntu", value: "'Ubuntu', sans-serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Source Sans Pro", value: "'Source Sans Pro', sans-serif" },
  { name: "Nunito", value: "'Nunito', sans-serif" },
  { name: "Roboto Slab", value: "'Roboto Slab', serif" },
  { name: "Roboto Mono", value: "'Roboto Mono', monospace" },
  { name: "Roboto Condensed", value: "'Roboto Condensed', sans-serif" },
]

interface FontSelectorProps {
  onFontChange: (font: string) => void
  value?: string
}

export function FontSelector({ onFontChange, value }: FontSelectorProps) {
  const [selectedFont, setSelectedFont] = useState(
    value ? googleFonts.find((font) => font.value === value) || googleFonts[0] : googleFonts[0],
  )
  const [fontsLoaded, setFontsLoaded] = useState(false)

  // Update selectedFont when value prop changes
  useEffect(() => {
    if (value) {
      const font = googleFonts.find((font) => font.value === value) || googleFonts[0]
      setSelectedFont(font)
    }
  }, [value])

  // Load Google Fonts
  useEffect(() => {
    if (typeof window !== "undefined" && !fontsLoaded) {
      const link = document.createElement("link")
      link.href =
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Ubuntu:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=Nunito:wght@400;700&family=Roboto+Slab:wght@400;700&family=Roboto+Mono:wght@400;700&family=Roboto+Condensed:wght@400;700&family=Noto+Sans:wght@400;700&display=swap"
      link.rel = "stylesheet"
      document.head.appendChild(link)
      setFontsLoaded(true)
    }
  }, [fontsLoaded])

  const handleFontChange = (font: (typeof googleFonts)[0]) => {
    setSelectedFont(font)
    onFontChange(font.value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 font-normal"
          style={{ fontFamily: selectedFont.value }}
        >
          {selectedFont.name}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
        {googleFonts.map((font) => (
          <DropdownMenuItem
            key={font.name}
            className={cn(
              "flex items-center justify-between",
              selectedFont.name === font.name && "bg-accent text-accent-foreground",
            )}
            onClick={() => handleFontChange(font)}
          >
            <span style={{ fontFamily: font.value }}>{font.name}</span>
            {selectedFont.name === font.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

