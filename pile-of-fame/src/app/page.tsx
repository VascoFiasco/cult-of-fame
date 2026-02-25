import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { VOCABULARY } from '@/lib/domain-config'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            {VOCABULARY.appName}
          </h1>
          <p className="text-xl text-muted-foreground">
            Paint more consistently with less friction
          </p>
        </div>

        {/* North-star summary */}
        <div className="space-y-2">
          <p className="text-lg">
            See progress, know what’s next, and start painting in one tap.
          </p>
          <p className="text-muted-foreground">
            Action first. Logging second. Pride always.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Continue
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Progress</h3>
            <p className="text-sm text-muted-foreground">
              Track inventory and move minis from SHAME to FAME.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">🎨 Paint</h3>
            <p className="text-sm text-muted-foreground">
              Start sessions quickly and log updates in seconds.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Share</h3>
            <p className="text-sm text-muted-foreground">
              Export milestones and recap your recent momentum.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 text-sm text-muted-foreground">
          <p>Built for consistent progress, not endless scrolling.</p>
        </footer>
      </div>
    </main>
  )
}
