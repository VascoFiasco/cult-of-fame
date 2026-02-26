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

    const minis = await prisma.mini.findMany({
      where: { userId: session.user.id },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        name: true,
        status: true,
        stage: true,
        progressPercent: true,
      },
    })

    return NextResponse.json(minis)
  } catch (error) {
    console.error('Get minis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
