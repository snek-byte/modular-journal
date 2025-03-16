"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Square, Circle, Triangle, Star, Hexagon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Define available shapes
const shapes = [
  { name: "Rectangle", icon: Square, svg: "M 0,0 L 100,0 L 100,100 L 0,100 Z" },
  { name: "Circle", icon: Circle, svg: "M 50,50 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0" },
  { name: "Triangle", icon: Triangle, svg: "M 50,0 L 100,100 L 0,100 Z" },
  { name: "Star", icon: Star, svg: "M 50,0 L 61,35 L 98,35 L 68,57 L 79,91 L 50,70 L 21,91 L 32,57 L 2,35 L 39,35 Z" },
  { name: "Hexagon", icon: Hexagon, svg: "M 25,0 L 75,0 L 100,50 L 75,100 L 25,100 L 0,50 Z" },
  {
    name: "Diamond",
    icon: ({ className }) => (
      <div className={className}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      </div>
    ),
    svg: "M 50,0 L 100,50 L 50,100 L 0,50 Z",
  },
  { name: "Oval", icon: Circle, svg: "M 50,25 m -50,0 a 50,25 0 1,0 100,0 a 50,25 0 1,0 -100,0" },
  {
    name: "Rounded Rectangle",
    icon: Square,
    svg: "M 10,0 L 90,0 Q 100,0 100,10 L 100,90 Q 100,100 90,100 L 10,100 Q 0,100 0,90 L 0,10 Q 0,0 10,0 Z",
  },
]

interface ShapePickerProps {
  onShapeSelect: (shape: {
    type: string
    path: string
    color: string
    opacity: number
    size: number
  }) => void
}

export function ShapePicker({ onShapeSelect }: ShapePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedShape, setSelectedShape] = useState(shapes[0])
  const [color, setColor] = useState("#ffffff")
  const [opacity, setOpacity] = useState(0.8)
  const [size, setSize] = useState(100)
  const [borderColor, setBorderColor] = useState("#000000")
  const [borderWidth, setBorderWidth] = useState(2)

  const handleShapeClick = (shape) => {
    setSelectedShape(shape)
  }

  const handleAddShape = () => {
    onShapeSelect({
      type: selectedShape.name,
      path: selectedShape.svg,
      color,
      opacity,
      size,
      borderColor,
      borderWidth,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Add shape">
          <Square className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Shape</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Shapes</TabsTrigger>
            <TabsTrigger value="settings">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-4 gap-4 py-4">
              {shapes.map((shape) => (
                <div
                  key={shape.name}
                  className={`flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedShape.name === shape.name ? "bg-accent border-primary" : ""
                  }`}
                  onClick={() => handleShapeClick(shape)}
                >
                  <div className="h-10 w-10 mb-2 flex items-center justify-center">
                    {typeof shape.icon === "function" ? (
                      <shape.icon className="h-10 w-10" />
                    ) : (
                      <shape.icon className="h-10 w-10" />
                    )}
                  </div>
                  <span className="text-xs text-center">{shape.name}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddShape}>Add Shape</Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fill-color">Fill Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: color }} />
                  <Input
                    id="fill-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-color">Border Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: borderColor }} />
                  <Input
                    id="border-color"
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="opacity">Opacity: {Math.round(opacity * 100)}%</Label>
                </div>
                <Slider
                  id="opacity"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="size">Size: {size}px</Label>
                </div>
                <Slider
                  id="size"
                  min={20}
                  max={300}
                  step={10}
                  value={[size]}
                  onValueChange={(value) => setSize(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="border-width">Border Width: {borderWidth}px</Label>
                </div>
                <Slider
                  id="border-width"
                  min={0}
                  max={10}
                  step={1}
                  value={[borderWidth]}
                  onValueChange={(value) => setBorderWidth(value[0])}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddShape}>Add Shape</Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 border rounded-md">
          <div className="text-center mb-2 text-sm font-medium">Preview</div>
          <div className="flex justify-center items-center h-32 bg-gray-100 dark:bg-gray-800 rounded-md">
            <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d={selectedShape.svg}
                fill={color}
                fillOpacity={opacity}
                stroke={borderColor}
                strokeWidth={borderWidth}
              />
            </svg>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

