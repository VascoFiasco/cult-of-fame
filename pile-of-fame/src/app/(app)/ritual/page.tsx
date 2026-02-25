'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ACTIVITY_TYPES, VOCABULARY } from '@/lib/domain-config'

export default function RitualPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [miniCount, setMiniCount] = useState(1)
  const [activityType, setActivityType] = useState('BASE')
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleStart = () => {
    setIsRunning(true)
    setSeconds(0)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleSubmit = async () => {
    if (seconds < 60) {
      alert('Session must be at least 1 minute')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/rituals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          miniCount,
          activityType,
          durationSeconds: seconds,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to log session')
        return
      }

      router.push('/feed')
      router.refresh()
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Start</span> Your Session
          </h1>
          <p className="text-muted-foreground mt-2">
            Focus on your painting. We'll track the time.
          </p>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div 
            className="text-7xl font-bold font-mono py-8"
            role="timer"
            aria-live={isRunning ? 'polite' : 'off'}
            aria-label={`Timer: ${formatTime(seconds)}`}
          >
            {formatTime(seconds)}
          </div>
          
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="px-8 min-h-[44px]">
              {VOCABULARY.primaryAction}
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive" size="lg" className="px-8 min-h-[44px]">
              End Session
            </Button>
          )}
        </div>

        {/* Log Form */}
        {seconds > 0 && !isRunning && (
          <div className="space-y-6 bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-center">Log Your Progress</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Minis Progressed
              </label>
              <input
                type="number"
                min="1"
                value={miniCount}
                onChange={(e) => setMiniCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? 'Logging...' : 'Log Session'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
