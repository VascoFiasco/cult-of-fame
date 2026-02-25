import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')

    const events = await prisma.event.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        ritualSession: true,
        confession: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    const hasMore = events.length > limit
    const nextCursor = hasMore ? events[events.length - 1].id : null
    const result = hasMore ? events.slice(0, -1) : events

    return NextResponse.json({
      events: result,
      nextCursor,
      hasMore,
    })
  } catch (error) {
    console.error('Feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
