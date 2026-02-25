'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatRelativeTime, getActivityLabel } from '@/lib/utils'
import { EVENT_COPY, getCanonicalEventType, REACTION_DEFINITIONS, VOCABULARY } from '@/lib/domain-config'

type EventWithRelations = {
  id: string
  type: string
  metadata?: { canonicalType?: string } | null
  userId: string
  createdAt: string
  user: {
    id: string
    username: string | null
    name: string | null
    image: string | null
  }
  ritualSession: {
    id: string
    miniCount: number
    activityType: string
    durationSeconds: number
  } | null
  confession: {
    id: string
    miniCount: number
  } | null
  reactions: {
    id: string
    type: string
    user: {
      id: string
      username: string | null
    }
  }[]
}

export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<EventWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents()
    }
  }, [status])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events/feed')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReact = useCallback(async (eventId: string, type: string) => {
    if (!session) return
    
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, type }),
      })
      
      if (res.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to react:', error)
    }
  }, [session])

  const getReactionCounts = useCallback((event: EventWithRelations) => {
    const counts: Record<string, number> = Object.fromEntries(
      REACTION_DEFINITIONS.map((reaction) => [reaction.type, 0])
    )

    event.reactions.forEach((r) => {
      if (counts[r.type] !== undefined) {
        counts[r.type]++
      }
    })
    return counts
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {VOCABULARY.appName}
          </h1>
          <div className="flex gap-2">
            <Link href="/ritual">
              <Button size="sm">{VOCABULARY.primaryAction}</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                {session?.user?.username || 'Profile'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sessions yet. Start your first one.</p>
            <Link href="/ritual" className="inline-block mt-4">
              <Button>{VOCABULARY.primaryAction}</Button>
            </Link>
          </div>
        ) : (
          events.map((event) => {
            const counts = getReactionCounts(event)
            const canonicalType = getCanonicalEventType(event)
            return (
              <div key={event.id} className="border rounded-lg p-4 space-y-3">
                {/* User info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {event.user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{event.user.username || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(event.createdAt))}
                    </p>
                  </div>
                </div>

                {/* Event content */}
                {event.type === 'CONFESSION' && event.confession && (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-lg">
                      Updated baseline inventory to{' '}
                      <span className="text-primary font-bold">{event.confession.miniCount}</span> minis
                    </p>
                  </div>
                )}

                {(canonicalType === 'SESSION_ENDED' || event.type === 'RITUAL') && event.ritualSession && (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-lg">
                      {EVENT_COPY[canonicalType] || EVENT_COPY[event.type] || 'updated progress'}:{' '}
                      <span className="text-primary font-bold">{getActivityLabel(event.ritualSession.activityType)}</span>
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>⏱️ {Math.floor(event.ritualSession.durationSeconds / 60)}m</span>
                      <span>🎨 {event.ritualSession.miniCount} minis</span>
                    </div>
                  </div>
                )}

                {/* Reactions */}
                <div className="flex gap-2" role="group" aria-label="React to this post">
                  {REACTION_DEFINITIONS.map((reaction) => {
                    const active = event.reactions.some(
                      (r) => r.user.id === session?.user?.id && r.type === reaction.type
                    )

                    return (
                      <button
                        key={reaction.type}
                        onClick={() => handleReact(event.id, reaction.type)}
                        aria-label={`${reaction.label} ${event.user.username || 'Anonymous'}, ${counts[reaction.type] ?? 0} total`}
                        className={`px-3 py-1 rounded-full text-sm min-w-[44px] min-h-[44px] ${
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {reaction.emoji} {counts[reaction.type] ?? 0}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
