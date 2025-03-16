"use client"

import { AuthSettings } from "@/components/auth-settings"
import { DevAuthHelper } from "@/components/dev-auth-helper"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function AdminClientWrapper() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Configure application settings</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <DevAuthHelper />
        <AuthSettings />
      </div>
    </div>
  )
}

