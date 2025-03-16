"use client"

import { SubscriptionManager } from "@/components/subscription-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function SubscriptionClientWrapper() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your journal subscription plan</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <SubscriptionManager />
      </div>
    </div>
  )
}

