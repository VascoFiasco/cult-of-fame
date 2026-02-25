'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function ConfessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pileSize, setPileSize] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miniCount: parseInt(pileSize) }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to confess')
        return
      }

      router.push('/feed')
      router.refresh()
    } catch {
      setError('Something went wrong')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Set Your <span className="text-primary">Inventory Baseline</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            How many minis are currently in your backlog?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="pileSize" className="block text-lg font-medium mb-2 text-center">
                Current mini count
              </label>
              <input
                id="pileSize"
                type="number"
                min="0"
                value={pileSize}
                onChange={(e) => setPileSize(e.target.value)}
                required
                className="w-full px-4 py-3 text-center text-3xl border-2 border-primary/30 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                autoFocus
              />
              <p className="mt-2 text-sm text-muted-foreground text-center">
                You can update this any time.
              </p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}
