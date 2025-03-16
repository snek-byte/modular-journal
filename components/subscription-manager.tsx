"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X } from "lucide-react"

interface UserProfile {
  plan: string
  plan_active: boolean
}

export function SubscriptionManager() {
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Get user profile from metadata
        const profile = user.user_metadata as UserProfile

        if (profile) {
          setUserProfile({
            plan: profile.plan || "free",
            plan_active: profile.plan_active || true,
          })
        } else {
          // Fallback to free plan if no profile exists
          setUserProfile({
            plan: "free",
            plan_active: true,
          })
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError("Failed to load subscription information")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleUpgrade = async () => {
    try {
      setUpgrading(true)

      // In a real app, this would redirect to a payment processor
      // For this demo, we'll just update the user's plan directly

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not found")
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          plan: "premium",
          plan_active: true,
        },
      })

      if (error) throw error

      // Update local state
      setUserProfile({
        plan: "premium",
        plan_active: true,
      })

      // In a real app, you would also update the user's profile in the database
    } catch (error) {
      console.error("Error upgrading plan:", error)
      setError("Failed to upgrade plan. Please try again.")
    } finally {
      setUpgrading(false)
    }
  }

  const handleDowngrade = async () => {
    try {
      setUpgrading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not found")
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          plan: "free",
          plan_active: true,
        },
      })

      if (error) throw error

      // Update local state
      setUserProfile({
        plan: "free",
        plan_active: true,
      })
    } catch (error) {
      console.error("Error downgrading plan:", error)
      setError("Failed to downgrade plan. Please try again.")
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>Please sign in to manage your subscription.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>Manage your journal subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Current Plan</h3>
              <div className="flex items-center mt-1">
                <span className="capitalize">{userProfile.plan}</span>
                <Badge variant={userProfile.plan === "premium" ? "default" : "secondary"} className="ml-2">
                  {userProfile.plan === "premium" ? "Premium" : "Free"}
                </Badge>
              </div>
            </div>
            {userProfile.plan === "premium" ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Basic journal features</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">Forever free</p>

                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Up to 5 journals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Basic formatting options</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Export to PDF</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <span className="text-muted-foreground">Premium modules</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {userProfile.plan === "premium" ? (
                  <Button variant="outline" className="w-full" onClick={handleDowngrade} disabled={upgrading}>
                    {upgrading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Downgrade"
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>Premium Plan</CardTitle>
                <CardDescription>Advanced features for serious journaling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$5.99</p>
                <p className="text-sm text-muted-foreground">per month</p>

                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Unlimited journals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Advanced formatting options</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Export to PDF and other formats</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Access to all premium modules</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {userProfile.plan === "premium" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleUpgrade} disabled={upgrading}>
                    {upgrading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upgrade Now"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <a href="#" className="underline">
            Contact support
          </a>
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  )
}

