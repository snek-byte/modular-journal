"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { X, RotateCcw, RotateCw } from "lucide-react"

interface DraggableShapeProps {
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
  onMove: (id: string, position: { x: number; y: number }) => void
  onRotate: (id: string, rotation: number) => void
  onDelete: (id: string) => void
  onResize: (id: string, size: number) => void
  onUpdateShape: (id: string, updates: Partial<DraggableShapeProps["shape"]>) => void
  isSelected: boolean
  onSelect: (id: string) => void
}

export function DraggableShape({
  id,
  shape,
  position,
  rotation,
  onMove,
  onRotate,
  onDelete,
  onResize,
  onUpdateShape,
  isSelected,
  onSelect,
}: DraggableShapeProps) {
  const shapeRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [localColor, setLocalColor] = useState(shape.color)
  const [localOpacity, setLocalOpacity] = useState(shape.opacity)
  const [localBorderColor, setLocalBorderColor] = useState(shape.borderColor)
  const [localBorderWidth, setLocalBorderWidth] = useState(shape.borderWidth)

  // Set up HTML5 drag and drop
  useEffect(() => {
    const element = shapeRef.current
    if (!element) return

    // Make the element draggable
    element.setAttribute("draggable", "true")

    const handleDragStart = (e: DragEvent) => {
      if (!e.dataTransfer) return

      // Set drag image to be transparent (we'll handle visual feedback ourselves)
      const img = new Image()
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      e.dataTransfer.setDragImage(img, 0, 0)

      // Store the shape ID in the dataTransfer
      e.dataTransfer.setData("text/plain", id)

      // Calculate offset from the mouse position to the shape's top-left corner
      const rect = element.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      // Select this shape
      onSelect(id)

      // Add a class to the body for styling during drag
      document.body.classList.add("dragging-active")
    }

    const handleDrag = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) return // Ignore events with no coordinates

      // Update the element's position for visual feedback during drag
      if (e.clientX > 0 && e.clientY > 0) {
        const container = element.parentElement
        if (!container) return

        const containerRect = container.getBoundingClientRect()
        const newX = e.clientX - containerRect.left - dragOffset.x
        const newY = e.clientY - containerRect.top - dragOffset.y

        element.style.left = `${newX}px`
        element.style.top = `${newY}px`
      }
    }

    const handleDragEnd = (e: DragEvent) => {
      // Calculate final position
      const container = element.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      // Update the parent component's state
      onMove(id, { x: newX, y: newY })

      // Remove the dragging class
      document.body.classList.remove("dragging-active")
    }

    // Add event listeners
    element.addEventListener("dragstart", handleDragStart)
    element.addEventListener("drag", handleDrag)
    element.addEventListener("dragend", handleDragEnd)

    // Clean up
    return () => {
      element.removeEventListener("dragstart", handleDragStart)
      element.removeEventListener("drag", handleDrag)
      element.removeEventListener("dragend", handleDragEnd)
    }
  }, [id, onMove, onSelect, dragOffset])

  // Handle shape click to select it
  const handleShapeClick = (e: React.MouseEvent) => {
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
  }

  // Handle size change
  const handleSizeChange = (increase: boolean) => {
    const newSize = increase ? shape.size + 10 : Math.max(20, shape.size - 10)
    onResize(id, newSize)
  }

  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value)
    onUpdateShape(id, { color: e.target.value })
  }

  // Handle opacity change
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = Number.parseFloat(e.target.value)
    setLocalOpacity(newOpacity)
    onUpdateShape(id, { opacity: newOpacity })
  }

  // Handle border color change
  const handleBorderColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBorderColor(e.target.value)
    onUpdateShape(id, { borderColor: e.target.value })
  }

  // Handle border width change
  const handleBorderWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number.parseInt(e.target.value)
    setLocalBorderWidth(newWidth)
    onUpdateShape(id, { borderWidth: newWidth })
  }

  return (
    <div
      ref={shapeRef}
      className={`shape-item ${isSelected ? "ring-1 ring-blue-500/30" : ""}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: isSelected ? 10 : 5,
        userSelect: "none",
        touchAction: "none",
        padding: "8px",
        cursor: "grab",
      }}
      onClick={handleShapeClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isSelected && setShowControls(false)}
    >
      <svg
        width={shape.size}
        height={shape.size}
        viewBox="-10 -10 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        <path
          d={shape.path}
          fill={shape.color}
          fillOpacity={shape.opacity}
          stroke={shape.borderColor}
          strokeWidth={shape.borderWidth}
        />
      </svg>

      {/* Controls that appear on hover or selection */}
      {(showControls || isSelected) && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
          {/* Size buttons */}
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleSizeChange(false)
            }}
            title="Decrease size"
          >
            <span className="text-sm font-bold">-</span>
          </button>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleSizeChange(true)
            }}
            title="Increase size"
          >
            <span className="text-sm font-bold">+</span>
          </button>

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
            title="Delete shape"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Rotation indicator */}
      {isSelected && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 bg-background/80 backdrop-blur-sm rounded px-1">
          {rotation}°
        </div>
      )}
    </div>
  )
}

