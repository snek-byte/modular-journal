"use client"

import { useState, useEffect } from "react"
import { JournalEditor } from "@/components/journal-editor"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export function EditorClientWrapper() {
  const [journalId] = useState(uuidv4())
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Modular Journal</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        {isAuthenticated === false && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>You are not logged in. Your journal will be saved locally only.</AlertDescription>
          </Alert>
        )}

        <JournalEditor
          journalId={journalId}
          initialTitle="New Journal"
          initialContent={[
            {
              type: "paragraph",
              children: [{ text: "Start writing your journal here..." }],
            },
          ]}
          isAuthenticated={isAuthenticated}
          onAuthNeeded={() => setAuthModalOpen(true)}
        />
      </main>
    </div>
  )
}

