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

    const { eventId, type } = await req.json()

    if (!eventId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    })

    if (existingReaction) {
      // Update existing reaction
      const reaction = await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type },
      })
      return NextResponse.json(reaction)
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        eventId,
        userId: session.user.id,
        type,
      },
    })

    return NextResponse.json(reaction)
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    }

    await prisma.reaction.deleteMany({
      where: {
        eventId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
