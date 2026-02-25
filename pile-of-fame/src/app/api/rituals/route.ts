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

    const {
      action,
      sessionId,
      targetMiniId,
      miniCount,
      activityType,
      durationSeconds,
      beforeImageUrl,
      afterImageUrl,
      notes,
      photos,
      stage,
      progressPercent,
      status,
    } = await req.json()

    const parsedProgressPercent =
      progressPercent === undefined || progressPercent === null || progressPercent === ''
        ? undefined
        : Number(progressPercent)

    if (
      parsedProgressPercent !== undefined &&
      (!Number.isFinite(parsedProgressPercent) || parsedProgressPercent < 0 || parsedProgressPercent > 100)
    ) {
      return NextResponse.json(
        { error: 'progressPercent must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    const normalizedPhotos = Array.isArray(photos)
      ? photos.map((photo: unknown) => String(photo).trim()).filter(Boolean)
      : []

    const autoSetFame =
      stage === 'FINISHED' ||
      (parsedProgressPercent !== undefined && parsedProgressPercent >= 100)
    const resolvedStatus = autoSetFame ? 'FAME' : status
    const photoSuggestionTriggered =
      normalizedPhotos.length > 0 && !stage && parsedProgressPercent === undefined && !status

    if (action === 'start') {
      const result = await prisma.$transaction(async (tx) => {
        const existingActive = await tx.ritualSession.findFirst({
          where: {
            userId: session.user.id,
            endedAt: null,
            durationSeconds: 0,
          },
          orderBy: { startedAt: 'desc' },
        })

        if (existingActive) {
          return { ritualSession: existingActive, event: null }
        }

        const ritualSession = await tx.ritualSession.create({
          data: {
            userId: session.user.id,
            targetMiniId: targetMiniId || null,
            startedAt: new Date(),

            // legacy-compatible defaults
            miniCount: 1,
            activityType: 'BASE',
            durationSeconds: 0,
          },
        })

        const event = await writeEvent(tx, {
          type: 'SESSION_STARTED',
          actorUserId: session.user.id,
          ritualSessionId: ritualSession.id,
          entityRef: {
            entityType: 'RITUAL_SESSION',
            entityId: ritualSession.id,
          },
          eventVersion: 1,
          metadata: {
            canonicalType: 'SESSION_STARTED',
            targetMiniId: targetMiniId || null,
          },
        })

        return { ritualSession, event }
      })

      return NextResponse.json(result)
    }

    if (!miniCount || !activityType || !durationSeconds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!stage && parsedProgressPercent === undefined && !status) {
      return NextResponse.json(
        { error: 'Update at least one: stage, progressPercent, or status' },
        { status: 400 }
      )
    }

    // End active session (or create one if missing) and emit event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const activeSession = await tx.ritualSession.findFirst({
        where: {
          userId: session.user.id,
          endedAt: null,
          durationSeconds: 0,
          ...(sessionId ? { id: sessionId } : {}),
        },
        orderBy: { startedAt: 'desc' },
      })

      const now = new Date()
      const ritualSession = activeSession
        ? await tx.ritualSession.update({
            where: { id: activeSession.id },
            data: {
              miniCount,
              activityType,
              durationSeconds,
              durationMinutes: Math.max(1, Math.floor(durationSeconds / 60)),
              beforeImageUrl,
              afterImageUrl,
              targetMiniId: targetMiniId || activeSession.targetMiniId,
              notes: notes || null,
              photos: normalizedPhotos,
              delta: {
                stage: stage || undefined,
                progressPercent: parsedProgressPercent ?? undefined,
                status: resolvedStatus || undefined,
              },
              endedAt: now,
            },
          })
        : await tx.ritualSession.create({
            data: {
              userId: session.user.id,
              startedAt: new Date(now.getTime() - durationSeconds * 1000),
              endedAt: now,
              durationMinutes: Math.max(1, Math.floor(durationSeconds / 60)),
              miniCount,
              activityType,
              durationSeconds,
              beforeImageUrl,
              afterImageUrl,
              targetMiniId: targetMiniId || null,
              notes: notes || null,
              photos: normalizedPhotos,
              delta: {
                stage: stage || undefined,
                progressPercent: parsedProgressPercent ?? undefined,
                status: resolvedStatus || undefined,
              },
            },
          })

      const resolvedTargetMiniId = ritualSession.targetMiniId || targetMiniId || null

      if (resolvedTargetMiniId) {
        const mini = await tx.mini.findFirst({
          where: { id: resolvedTargetMiniId, userId: session.user.id },
        })

        if (mini) {
          await tx.mini.update({
            where: { id: mini.id },
            data: {
              ...(stage ? { stage } : {}),
              ...(parsedProgressPercent !== undefined ? { progressPercent: parsedProgressPercent } : {}),
              ...(resolvedStatus ? { status: resolvedStatus } : {}),
              updatedAt: now,
            },
          })
        }
      }

      // Create event (contract-enforced through centralized writer)
      const event = await writeEvent(tx, {
        type: 'RITUAL',
        actorUserId: session.user.id,
        ritualSessionId: ritualSession.id,
        entityRef: {
          entityType: 'RITUAL_SESSION',
          entityId: ritualSession.id,
        },
        eventVersion: 1,
        metadata: {
          canonicalType: 'SESSION_ENDED',
          activityType,
          durationSeconds,
          miniCount,
          targetMiniId: resolvedTargetMiniId,
          notes: ritualSession.notes,
          photosCount: ritualSession.photos.length,
          stage: stage || null,
          progressPercent: parsedProgressPercent ?? null,
          status: resolvedStatus || null,
          heuristics: {
            autoSetFame,
            photoSuggestionTriggered,
          },
          legacyType: 'RITUAL',
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = new URL(req.url).searchParams
    const activeOnly = searchParams.get('active')

    if (activeOnly === '1' || activeOnly === 'true') {
      const activeSession = await prisma.ritualSession.findFirst({
        where: {
          userId: session.user.id,
          endedAt: null,
          durationSeconds: 0,
        },
        orderBy: { startedAt: 'desc' },
      })

      return NextResponse.json(activeSession)
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
