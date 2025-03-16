"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SupabaseAuth } from "@/components/supabase-auth"
import { LogIn } from "lucide-react"

interface AuthModalProps {
  trigger?: React.ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AuthModal({ trigger, defaultOpen = false, onOpenChange }: AuthModalProps) {
  const [open, setOpen] = useState(defaultOpen)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Sign In / Sign Up</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to save your journals to the cloud.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <SupabaseAuth onSuccess={() => handleOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

