"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { disableEmailConfirmation, enableEmailConfirmation } from "@/lib/auth-config"

export function AuthSettings() {
  const [loading, setLoading] = useState(false)
  const [emailConfirmationEnabled, setEmailConfirmationEnabled] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const toggleEmailConfirmation = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      if (emailConfirmationEnabled) {
        // Disable email confirmation
        const result = await disableEmailConfirmation()
        if (result.success) {
          setEmailConfirmationEnabled(false)
          setMessage("Email confirmation disabled. Users can now sign in immediately after registration.")
        } else {
          throw new Error("Failed to disable email confirmation. You may not have admin privileges.")
        }
      } else {
        // Enable email confirmation
        const result = await enableEmailConfirmation()
        if (result.success) {
          setEmailConfirmationEnabled(true)
          setMessage("Email confirmation enabled. Users will need to confirm their email before signing in.")
        } else {
          throw new Error("Failed to enable email confirmation. You may not have admin privileges.")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Settings</CardTitle>
        <CardDescription>Configure authentication settings for testing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-confirmation">Email Confirmation</Label>
              <p className="text-sm text-muted-foreground">
                {emailConfirmationEnabled
                  ? "Users must confirm their email before signing in"
                  : "Users can sign in immediately after registration"}
              </p>
            </div>
            <Switch
              id="email-confirmation"
              checked={emailConfirmationEnabled}
              onCheckedChange={toggleEmailConfirmation}
              disabled={loading}
            />
          </div>

          {message && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md">
              <p className="text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: Changing these settings requires admin privileges in Supabase.
        </p>
      </CardFooter>
    </Card>
  )
}

