import { NextRequest, NextResponse } from 'next/server'
import { createCardSession, getSessionsByAccessKey, updateCardSession, getCardSession } from '@/lib/database'

// Create new card session
export async function POST(request: NextRequest) {
  try {
    const { accessKeyId, cards } = await request.json()

    if (!accessKeyId || !cards || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: 'Access key ID and cards array are required' },
        { status: 400 }
      )
    }

    const session = await createCardSession(accessKeyId, cards)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        accessKeyId: session.accessKeyId,
        cards: session.cards,
        status: session.status,
        currentIndex: session.currentIndex,
        createdAt: session.createdAt
      }
    })

  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get sessions by access key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessKeyId = searchParams.get('accessKeyId')
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get specific session
      const session = getCardSession(sessionId)
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          accessKeyId: session.accessKeyId,
          cards: session.cards,
          status: session.status,
          results: session.results,
          currentIndex: session.currentIndex,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      })
    }

    if (!accessKeyId) {
      return NextResponse.json(
        { error: 'Access key ID is required' },
        { status: 400 }
      )
    }

    const sessions = getSessionsByAccessKey(accessKeyId)

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        accessKeyId: s.accessKeyId,
        cards: s.cards,
        status: s.status,
        results: s.results,
        currentIndex: s.currentIndex,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update session status
export async function PATCH(request: NextRequest) {
  try {
    const { sessionId, status } = await request.json()

    if (!sessionId || !status) {
      return NextResponse.json(
        { error: 'Session ID and status are required' },
        { status: 400 }
      )
    }

    const success = updateCardSession(sessionId, { status })

    if (!success) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    })

  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 