import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeEvent } from '@/lib/events/write-event'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { miniCount } = await req.json()

    if (!miniCount || miniCount < 0) {
      return NextResponse.json({ error: 'Invalid mini count' }, { status: 400 })
    }

    // Create confession and event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create confession
      const confession = await tx.confession.create({
        data: {
          userId: session.user.id,
          miniCount,
        },
      })

      // Create event (contract-enforced through centralized writer)
      const event = await writeEvent(tx, {
        type: 'CONFESSION',
        actorUserId: session.user.id,
        confessionId: confession.id,
        entityRef: {
          entityType: 'CONFESSION',
          entityId: confession.id,
        },
        eventVersion: 1,
        metadata: {
          canonicalType: 'MINI_UPDATED',
          miniCount,
          legacyType: 'CONFESSION',
        },
      })

      return { confession, event }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Confession error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const confessions = await prisma.confession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    return NextResponse.json(confessions)
  } catch (error) {
    console.error('Get confession error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
