"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DevAuthHelper() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const confirmUserManually = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage("")
    setError("")

    try {
      // This requires RLS to be disabled on auth.users or admin privileges
      const { error: queryError } = await supabase.rpc("confirm_user_email", {
        user_email: email,
      })

      if (queryError) {
        // Try alternative method if RPC fails
        const { error: sqlError } = await supabase.auth.admin.updateUserById(
          "email", // This is a placeholder, we're actually using email to find the user
          {
            email_confirmation_token: null,
            email_confirmed_at: new Date().toISOString(),
          },
        )

        if (sqlError) {
          throw new Error("Could not confirm user. You may need admin privileges.")
        }
      }

      setMessage(`User ${email} has been manually confirmed. You can now sign in.`)
    } catch (err: any) {
      setError(err.message || "Failed to confirm user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Development Auth Helper</CardTitle>
        <CardDescription>For development use only. Manually confirm users without email.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This tool is for development purposes only. In production, users should confirm their email through the
            normal process.
          </AlertDescription>
        </Alert>

        <form onSubmit={confirmUserManually} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter email to confirm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Manually Confirm User"
            )}
          </Button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Alternative: Go to Supabase dashboard → Authentication → Users → Select user → Confirm user
        </p>
      </CardFooter>
    </Card>
  )
}

