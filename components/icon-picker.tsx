"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search, Image } from "lucide-react"

// Import icon sets from react-icons
import * as Fa from "react-icons/fa"
import * as Fi from "react-icons/fi"
import * as Md from "react-icons/md"
import * as Bs from "react-icons/bs"
import * as Hi from "react-icons/hi"
import * as Hi2 from "react-icons/hi2"
import * as Ai from "react-icons/ai"
import * as Bi from "react-icons/bi"
import * as Ci from "react-icons/ci"
import * as Fc from "react-icons/fc"
import * as Gi from "react-icons/gi"
import * as Go from "react-icons/go"
import * as Ri from "react-icons/ri"
import * as Si from "react-icons/si"
import * as Ti from "react-icons/ti"
import * as Vsc from "react-icons/vsc"
import * as Wi from "react-icons/wi"

// Define icon categories
const iconSets = [
  { name: "Feather", icons: Fi, type: "outline" },
  { name: "Font Awesome", icons: Fa, type: "color" },
  { name: "Material Design", icons: Md, type: "color" },
  { name: "Bootstrap", icons: Bs, type: "outline" },
  { name: "Heroicons", icons: Hi, type: "color" },
  { name: "Heroicons 2", icons: Hi2, type: "outline" },
  { name: "Ant Design", icons: Ai, type: "outline" },
  { name: "BoxIcons", icons: Bi, type: "outline" },
  { name: "CircumIcons", icons: Ci, type: "outline" },
  { name: "Flat Color Icons", icons: Fc, type: "color" },
  { name: "Game Icons", icons: Gi, type: "color" },
  { name: "Github Octicons", icons: Go, type: "outline" },
  { name: "Remix Icons", icons: Ri, type: "outline" },
  { name: "Simple Icons", icons: Si, type: "color" },
  { name: "Typicons", icons: Ti, type: "outline" },
  { name: "VS Code Icons", icons: Vsc, type: "outline" },
  { name: "Weather Icons", icons: Wi, type: "color" },
]

interface IconPickerProps {
  onIconSelect: (IconComponent: any, iconName: string, size: number, color?: string) => void
}

export function IconPicker({ onIconSelect }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"outline" | "color">("outline")
  const [iconSize, setIconSize] = useState(24)
  const [iconColor, setIconColor] = useState("#000000")
  const [selectedIconSet, setSelectedIconSet] = useState<string | null>(null)
  const [filteredIcons, setFilteredIcons] = useState<Array<{ name: string; component: any }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filter icons based on search term and active tab
  useEffect(() => {
    if (!searchTerm && !selectedIconSet) {
      setFilteredIcons([])
      return
    }

    setIsLoading(true)

    // Use setTimeout to prevent UI freezing when filtering large icon sets
    const timer = setTimeout(() => {
      const results: Array<{ name: string; component: any }> = []

      // Filter icon sets based on the active tab
      const filteredSets = selectedIconSet
        ? iconSets.filter((set) => set.name === selectedIconSet)
        : iconSets.filter((set) => set.type === activeTab)

      // Search through the filtered icon sets
      filteredSets.forEach((set) => {
        Object.entries(set.icons).forEach(([name, Icon]) => {
          // Skip non-icon entries (like default exports)
          if (typeof Icon !== "function" || name === "default") return

          // Check if the icon name matches the search term
          if (!searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase())) {
            try {
              results.push({
                name: `${set.name}.${name}`,
                component: Icon,
              })
            } catch (error) {
              console.error(`Error with icon ${name}:`, error)
            }
          }
        })
      })

      // Limit results to prevent performance issues
      setFilteredIcons(results.slice(0, 100))
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, activeTab, selectedIconSet, iconSize, iconColor])

  const handleIconClick = (IconComponent: any, iconName: string) => {
    // Create the actual icon element with the current size and color
    const iconElement = <IconComponent size={iconSize} color={activeTab === "color" ? iconColor : undefined} />

    // Pass both the component and the rendered element
    onIconSelect(IconComponent, iconName, iconSize, activeTab === "color" ? iconColor : undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Add icon">
          <Image className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Icon Picker</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="outline"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "outline" | "color")}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="outline">Outline Icons</TabsTrigger>
              <TabsTrigger value="color">Color Icons</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Label htmlFor="icon-size" className="text-sm">
                Size: {iconSize}px
              </Label>
              <Slider
                id="icon-size"
                min={16}
                max={64}
                step={4}
                value={[iconSize]}
                onValueChange={(value) => setIconSize(value[0])}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search icons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {activeTab === "color" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="icon-color" className="text-sm">
                  Color:
                </Label>
                <Input
                  id="icon-color"
                  type="color"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="w-12 h-8 p-1"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
            <Button
              variant={selectedIconSet === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedIconSet(null)}
            >
              All Sets
            </Button>
            {iconSets
              .filter((set) => set.type === activeTab)
              .map((set) => (
                <Button
                  key={set.name}
                  variant={selectedIconSet === set.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIconSet(set.name)}
                >
                  {set.name}
                </Button>
              ))}
          </div>

          <TabsContent value="outline" className="mt-0">
            <ScrollArea className="h-[400px] border rounded-md p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredIcons.length > 0 ? (
                <div className="grid grid-cols-6 gap-4">
                  {filteredIcons.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleIconClick(item.component, item.name)}
                      title={item.name}
                    >
                      <div className="h-10 flex items-center justify-center">
                        {React.createElement(item.component, {
                          size: iconSize,
                          color: activeTab === "color" ? iconColor : undefined,
                        })}
                      </div>
                      <span className="text-xs text-center mt-1 truncate w-full">{item.name.split(".")[1]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedIconSet
                    ? "No icons found. Try a different search term or icon set."
                    : "Type to search for icons or select an icon set."}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="color" className="mt-0">
            <ScrollArea className="h-[400px] border rounded-md p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredIcons.length > 0 ? (
                <div className="grid grid-cols-6 gap-4">
                  {filteredIcons.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleIconClick(item.component, item.name)}
                      title={item.name}
                    >
                      <div className="h-10 flex items-center justify-center">
                        {React.createElement(item.component, {
                          size: iconSize,
                          color: activeTab === "color" ? iconColor : undefined,
                        })}
                      </div>
                      <span className="text-xs text-center mt-1 truncate w-full">{item.name.split(".")[1]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedIconSet
                    ? "No icons found. Try a different search term or icon set."
                    : "Type to search for icons or select an icon set."}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

