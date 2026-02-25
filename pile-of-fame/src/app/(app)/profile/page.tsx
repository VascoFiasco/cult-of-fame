'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { VOCABULARY } from '@/lib/domain-config'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      // Get rituals
      const ritualsRes = await fetch('/api/rituals')
      const rituals = await ritualsRes.json()
      
      // Calculate stats
      const totalRituals = rituals.length || 0
      const totalMinutes = rituals.reduce((acc: number, r: any) => acc + Math.floor(r.durationSeconds / 60), 0)
      
      // Simple streak calculation (consecutive days)
      let streak = 0
      if (rituals.length > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const ritualDates = rituals.map((r: any) => new Date(r.createdAt).setHours(0, 0, 0, 0))
        const uniqueDates = Array.from(new Set(ritualDates)) as number[]
        
        // Check if there's a ritual today or yesterday
        const lastRitualDate = Math.max(...uniqueDates)
        const daysDiff = Math.floor((today.getTime() - lastRitualDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 1) {
          // Count consecutive days
          let checkDate = new Date(today)
          for (let i = 0; i < 365; i++) {
            const checkTimestamp = checkDate.getTime()
            if (uniqueDates.includes(checkTimestamp)) {
              streak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else if (i === 0) {
              // If no ritual today, check yesterday
              checkDate.setDate(checkDate.getDate() - 1)
              if (uniqueDates.includes(checkDate.getTime())) {
                streak++
                checkDate.setDate(checkDate.getDate() - 1)
              } else {
                break
              }
            } else {
              break
            }
          }
        }
      }

      setStats({
        totalSessions: totalRituals,
        totalMinutes,
        currentStreak: streak,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/feed" className="text-xl font-bold">
            {VOCABULARY.appName}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Info */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-4xl font-bold">
            {session?.user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <h1 className="text-2xl font-bold mt-4">{session?.user?.username}</h1>
          <p className="text-muted-foreground">{session?.user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-3xl font-bold text-primary">{stats.currentStreak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-3xl font-bold text-primary">{stats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Sessions</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-3xl font-bold text-primary">{Math.floor(stats.totalMinutes / 60)}h</p>
            <p className="text-sm text-muted-foreground">Total Time</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link href="/ritual" className="block">
            <Button className="w-full">{VOCABULARY.primaryAction}</Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign out
          </Button>
        </div>
      </main>
    </div>
  )
}
