"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserJournals, deleteJournal, type JournalEntry } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash2, Edit, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function JournalList({
  onSelect,
  onNew,
}: {
  onSelect: (journal: JournalEntry) => void
  onNew: () => void
}) {
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setLoading(true)
        const data = await getUserJournals()
        setJournals(data)
      } catch (err) {
        console.error("Error fetching journals:", err)
        setError("Failed to load journals")
      } finally {
        setLoading(false)
      }
    }

    fetchJournals()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this journal?")) {
      try {
        await deleteJournal(id)
        setJournals(journals.filter((journal) => journal.id !== id))
      } catch (err) {
        console.error("Error deleting journal:", err)
        setError("Failed to delete journal")
      }
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Your Journals</span>
          <Button size="sm" onClick={onNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> New
          </Button>
        </CardTitle>
        <CardDescription>Select a journal to edit or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : journals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No journals found</p>
            <Button variant="outline" className="mt-4" onClick={onNew}>
              Create your first journal
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {journals.map((journal) => (
                <Card
                  key={journal.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onSelect(journal)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{journal.title || "Untitled Journal"}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(journal.updated_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelect(journal)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(journal.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

