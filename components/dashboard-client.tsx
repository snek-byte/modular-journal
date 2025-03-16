"use client"

import { useState, useEffect } from "react"
import { JournalEditor } from "@/components/journal-editor"
import { JournalList } from "@/components/journal-list"
import { SupabaseAuth } from "@/components/supabase-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { supabase, type JournalEntry } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"
import type { User } from "@supabase/supabase-js"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { setupDatabase } from "@/lib/setup-database"

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentJournal, setCurrentJournal] = useState<JournalEntry | null>(null)

  useEffect(() => {
    // Check for current session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)

      // If user is authenticated, try to set up the database
      if (session?.user) {
        try {
          await setupDatabase()
        } catch (error) {
          console.error("Error setting up database:", error)
        }
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleNewJournal = () => {
    const newJournal: JournalEntry = {
      id: uuidv4(),
      user_id: user?.id || "",
      title: "Untitled Journal",
      content: [
        {
          type: "paragraph",
          children: [{ text: "Start writing your journal here..." }],
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setCurrentJournal(newJournal)
  }

  const handleSelectJournal = (journal: JournalEntry) => {
    setCurrentJournal(journal)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Modular Journal</h1>
          <SupabaseAuth />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Modular Journal</h1>
          <div className="flex items-center gap-4">
            {user && (
              <Button variant="outline" asChild>
                <Link href="/subscription">Subscription</Link>
              </Button>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <JournalList onSelect={handleSelectJournal} onNew={handleNewJournal} />
          </div>
          <div className="md:col-span-3">
            {currentJournal ? (
              <JournalEditor
                journalId={currentJournal.id}
                initialTitle={currentJournal.title}
                initialContent={currentJournal.content}
                isAuthenticated={!!user}
                onSaved={() => {
                  // Refresh the journal list after saving
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] border rounded-lg p-8">
                <h2 className="text-2xl font-semibold mb-4">No Journal Selected</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Select a journal from the list or create a new one to get started
                </p>
                <Button onClick={handleNewJournal}>Create New Journal</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

