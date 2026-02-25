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

    const [
      totalMinis,
      fameMinis,
      wipMinis,
      shameMinis,
      currentProject,
      latestSession,
      activeSession,
    ] = await Promise.all([
      prisma.mini.count({ where: { userId } }),
      prisma.mini.count({ where: { userId, status: 'FAME' } }),
      prisma.mini.count({ where: { userId, status: 'WIP' } }),
      prisma.mini.count({ where: { userId, status: 'SHAME' } }),
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
      prisma.ritualSession.findFirst({
        where: {
          userId,
          endedAt: null,
          durationSeconds: 0,
        },
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          targetMiniId: true,
          startedAt: true,
          endedAt: true,
        },
      }),
    ])

    const completionPercent = totalMinis > 0 ? Math.round((fameMinis / totalMinis) * 100) : 0

    const hasNoMinis = totalMinis === 0
    const hasActiveSession = Boolean(activeSession)
    const hasWipMinis = wipMinis > 0
    const onlyShameMinis = totalMinis > 0 && shameMinis === totalMinis

    const personalizationState = hasNoMinis
      ? 'NO_MINIS'
      : hasActiveSession
        ? 'HAS_ACTIVE_SESSION'
        : hasWipMinis
          ? 'HAS_WIP_MINIS'
          : onlyShameMinis
            ? 'ONLY_SHAME_MINIS'
            : 'DEFAULT'

    const primaryCta =
      personalizationState === 'NO_MINIS'
        ? {
            label: 'Add your first mini',
            href: '/confess',
            kind: 'ADD_FIRST_MINI',
          }
        : personalizationState === 'HAS_ACTIVE_SESSION'
          ? {
              label: 'Resume Session',
              href: '/ritual',
              kind: 'RESUME_SESSION',
            }
          : personalizationState === 'HAS_WIP_MINIS'
            ? {
                label: 'Continue Last Mini',
                href: '/ritual',
                kind: 'CONTINUE_LAST_MINI',
              }
            : {
                label: 'Pick Something to Start',
                href: '/ritual',
                kind: 'PICK_SOMETHING_TO_START',
              }

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
        activeSession,
      },
      personalizationState,
      primaryCta,
    })
  } catch (error) {
    console.error('Home API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
