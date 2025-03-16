import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Modular Journal</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Journal, Your Way</h1>
          <p className="text-xl mb-8 text-muted-foreground">
            A modular journaling app with rich text editing, cloud sync, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/editor">Try Without Account</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Modular Journal. All rights reserved.</p>
      </footer>
    </div>
  )
}

