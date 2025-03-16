"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { X, RotateCcw, RotateCw } from "lucide-react"

interface DraggableEmojiProps {
  id: string
  emoji: string
  position: { x: number; y: number }
  rotation: number
  size: number
  onMove: (id: string, position: { x: number; y: number }) => void
  onRotate: (id: string, rotation: number) => void
  onDelete: (id: string) => void
  onResize: (id: string, size: number) => void
  isSelected: boolean
  onSelect: (id: string) => void
}

export function DraggableEmoji({
  id,
  emoji,
  position,
  rotation,
  size,
  onMove,
  onRotate,
  onDelete,
  onResize,
  isSelected,
  onSelect,
}: DraggableEmojiProps) {
  const emojiRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Set up HTML5 drag and drop
  useEffect(() => {
    const element = emojiRef.current
    if (!element) return

    // Make the element draggable
    element.setAttribute("draggable", "true")

    const handleDragStart = (e: DragEvent) => {
      if (!e.dataTransfer) return

      // Set drag image to be transparent (we'll handle visual feedback ourselves)
      const img = new Image()
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      e.dataTransfer.setDragImage(img, 0, 0)

      // Store the emoji ID in the dataTransfer
      e.dataTransfer.setData("text/plain", id)

      // Calculate offset from the mouse position to the emoji's top-left corner
      const rect = element.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      // Select this emoji
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

  // Handle emoji click to select it
  const handleEmojiClick = (e: React.MouseEvent) => {
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
    const newSize = increase ? size + 4 : Math.max(16, size - 4)
    onResize(id, newSize)
  }

  return (
    <div
      ref={emojiRef}
      className={`emoji-item ${isSelected ? "ring-1 ring-blue-500/30" : ""}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: isSelected ? 10 : 5,
        userSelect: "none",
        touchAction: "none",
        padding: "8px",
        cursor: "grab",
      }}
      onClick={handleEmojiClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isSelected && setShowControls(false)}
    >
      <span className="select-none">{emoji}</span>

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
            title="Delete emoji"
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

