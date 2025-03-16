"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SupabaseAuthProps {
  onSuccess?: () => void
}

export function SupabaseAuth({ onSuccess }: SupabaseAuthProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [signupStep, setSignupStep] = useState(1)
  const [showConfirmationHelp, setShowConfirmationHelp] = useState(false)
  const [signupEmail, setSignupEmail] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signupStep === 1) {
      // Validate email and password
      if (!email || !password || password.length < 6) {
        setError("Please enter a valid email and password (min 6 characters)")
        return
      }

      // Move to plan selection
      setSignupStep(2)
      setError("")
      return
    }

    // Handle final signup
    setLoading(true)
    setError("")
    setMessage("")

    try {
      // Create the user account
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan: selectedPlan,
            plan_active: true,
          },
        },
      })

      if (signupError) throw signupError

      // Store the user's plan in a profile table - but don't fail if this doesn't work
      if (data.user) {
        try {
          // First, check if the user_profiles table exists
          const { error: tableCheckError } = await supabase.from("user_profiles").select("count").limit(1).single()

          // If the table exists, try to insert the profile
          if (!tableCheckError) {
            await supabase.from("user_profiles").upsert({
              user_id: data.user.id,
              email: email,
              plan: selectedPlan,
              created_at: new Date().toISOString(),
            })
          } else {
            console.log("user_profiles table may not exist, skipping profile creation")
          }
        } catch (profileError) {
          // Log the error but don't fail the signup
          console.error("Error saving user profile:", profileError)
        }
      }

      // Save the email for potential resend
      setSignupEmail(email)

      // Check if email confirmation is needed
      if (data.session) {
        // User is immediately signed in (email confirmation disabled)
        setMessage("Account created and signed in successfully!")

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Email confirmation is required
        setMessage("Account created! Check your email for the confirmation link.")
        setShowConfirmationHelp(true)
      }

      setSignupStep(1) // Reset to first step
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if the error is about email confirmation
        if (error.message.includes("Email not confirmed") || error.message.includes("Invalid login credentials")) {
          setSignupEmail(email)
          setShowConfirmationHelp(true)
          throw new Error("Please confirm your email before signing in. Check your inbox and spam folder.")
        }
        throw error
      }

      setMessage("Signed in successfully!")

      // Call onSuccess callback if provided
      if (onSuccess && data.session) {
        onSuccess()
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!signupEmail) return

    setResendingEmail(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: signupEmail,
      })

      if (error) throw error

      setMessage(`Confirmation email resent to ${signupEmail}. Please check your inbox and spam folder.`)
    } catch (error: any) {
      setError(error.message || "Failed to resend confirmation email")
    } finally {
      setResendingEmail(false)
    }
  }

  const handleBackToCredentials = () => {
    setSignupStep(1)
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            {signupStep === 1 ? (
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            ) : (
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-medium mb-2">Choose a Plan</h3>
                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
                    <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                      <RadioGroupItem value="free" id="free-plan" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="free-plan" className="font-medium">
                          Free Plan
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Basic journal features with limited cloud storage (5 journals)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                      <RadioGroupItem value="premium" id="premium-plan" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="premium-plan" className="font-medium">
                          Premium Plan
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Unlimited journals, advanced formatting, and all premium modules
                        </p>
                        <p className="text-sm font-medium">$5.99/month</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToCredentials} className="flex-1">
                    Back
                  </Button>
                  <Button type="button" onClick={handleSignUp} className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {showConfirmationHelp && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>Please check your email to confirm your account before signing in.</p>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or click below to resend.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="mt-2"
              >
                {resendingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
      <CardFooter className="flex justify-center pt-4">
        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  )
}

