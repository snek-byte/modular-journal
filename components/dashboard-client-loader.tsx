"use client"

import { Suspense, useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Import the loading component directly
import LoadingScreen from "@/components/loading-screen"

// Create a new component that dynamically imports the dashboard client
const DashboardClientComponent = dynamic(() => import("@/components/dashboard-client"), {
  loading: () => <LoadingScreen />,
  // Remove ssr: false and handle loading on the client side
})

export function DashboardClientLoader() {
  // Use client-side only rendering
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingScreen />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardClientComponent />
    </Suspense>
  )
}

