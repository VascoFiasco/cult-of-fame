import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [totalMinis, fameMinis, currentProject, latestSession] = await Promise.all([
      prisma.mini.count({ where: { userId } }),
      prisma.mini.count({ where: { userId, status: 'FAME' } }),
      prisma.mini.findFirst({
        where: { userId, status: 'WIP' },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          system: true,
          status: true,
          stage: true,
          progressPercent: true,
          coverImageUrl: true,
          updatedAt: true,
        },
      }),
      prisma.ritualSession.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          targetMiniId: true,
          startedAt: true,
          endedAt: true,
          durationMinutes: true,
          durationSeconds: true,
        },
      }),
    ])

    const completionPercent = totalMinis > 0 ? Math.round((fameMinis / totalMinis) * 100) : 0

    return NextResponse.json({
      progressAnchor: {
        type: 'FAME_COUNT',
        value: fameMinis,
        meta: {
          totalMinis,
          completionPercent,
        },
      },
      currentProject,
      session: {
        latestSession,
      },
      primaryCta: {
        label: 'Start Painting',
        href: '/ritual',
      },
    })
  } catch (error) {
    console.error('Home API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
