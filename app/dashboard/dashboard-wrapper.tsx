"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the client component with no SSR
const DashboardClient = dynamic(() => import("@/components/dashboard-client"), { ssr: false })

export default function DashboardWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardClient />
    </Suspense>
  )
}

