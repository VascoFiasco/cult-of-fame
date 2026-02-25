'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { VOCABULARY } from '@/lib/domain-config'

type HomeContract = {
  progressAnchor: {
    type: 'FAME_COUNT'
    value: number
    meta: {
      totalMinis: number
      completionPercent: number
    }
  }
  currentProject: {
    id: string
    name: string
    system: string | null
    stage: string
    progressPercent: number
  } | null
  personalizationState:
    | 'NO_MINIS'
    | 'HAS_ACTIVE_SESSION'
    | 'HAS_WIP_MINIS'
    | 'ONLY_SHAME_MINIS'
    | 'DEFAULT'
  primaryCta: {
    label: string
    href: string
    kind: string
  }
}

export default function HomePage() {
  const { status } = useSession()
  const [home, setHome] = useState<HomeContract | null>(null)
  const [loadingHome, setLoadingHome] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoadingHome(false)
      return
    }

    const fetchHome = async () => {
      try {
        const res = await fetch('/api/home')
        if (!res.ok) return
        const data = await res.json()
        setHome(data)
      } catch (error) {
        console.error('Failed to load home data', error)
      } finally {
        setLoadingHome(false)
      }
    }

    fetchHome()
  }, [status])

  if (status === 'authenticated' && loadingHome) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading your progress…</p>
      </main>
    )
  }

  if (status === 'authenticated' && home) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <div className="max-w-2xl mx-auto space-y-6 pt-4">
          <header className="space-y-1">
            <h1 className="text-3xl font-bold">{VOCABULARY.appName}</h1>
            <p className="text-muted-foreground">Progress</p>
          </header>

          <section className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Fame minis</p>
            <p className="text-4xl font-bold text-primary">{home.progressAnchor.value}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {home.progressAnchor.meta.completionPercent}% complete ({home.progressAnchor.meta.totalMinis} total)
            </p>
          </section>

          <section className="rounded-lg border bg-card p-5 space-y-2">
            <h2 className="font-semibold">Current project</h2>
            {home.currentProject ? (
              <>
                <p className="text-lg font-medium">{home.currentProject.name}</p>
                <p className="text-sm text-muted-foreground">
                  {home.currentProject.stage} · {home.currentProject.progressPercent}%
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No active mini yet.</p>
            )}
          </section>

          <Link href={home.primaryCta.href}>
            <Button className="w-full" size="lg">
              {home.primaryCta.label}
            </Button>
          </Link>

          <div className="flex gap-2">
            <Link href="/profile" className="flex-1">
              <Button variant="outline" className="w-full">Profile</Button>
            </Link>
            <Link href="/feed" className="flex-1">
              <Button variant="outline" className="w-full">Legacy Feed</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">{VOCABULARY.appName}</h1>
          <p className="text-xl text-muted-foreground">Paint more consistently with less friction</p>
        </div>

        <div className="space-y-2">
          <p className="text-lg">See progress, know what’s next, and start painting in one tap.</p>
          <p className="text-muted-foreground">Action first. Logging second. Pride always.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">Continue</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
