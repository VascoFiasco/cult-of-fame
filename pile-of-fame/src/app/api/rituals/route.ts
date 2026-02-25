import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { miniCount, activityType, durationSeconds, beforeImageUrl, afterImageUrl } = await req.json()

    if (!miniCount || !activityType || !durationSeconds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create ritual session and event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ritual session
      const ritualSession = await tx.ritualSession.create({
        data: {
          userId: session.user.id,
          miniCount,
          activityType,
          durationSeconds,
          beforeImageUrl,
          afterImageUrl,
        },
      })

      // Create event
      const event = await tx.event.create({
        data: {
          type: 'RITUAL',
          userId: session.user.id,
          ritualSessionId: ritualSession.id,
          metadata: {
            canonicalType: 'SESSION_ENDED',
            activityType,
            durationSeconds,
            miniCount,
            legacyType: 'RITUAL',
          },
        },
      })

      return { ritualSession, event }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Ritual error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rituals = await prisma.ritualSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json(rituals)
  } catch (error) {
    console.error('Get rituals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
