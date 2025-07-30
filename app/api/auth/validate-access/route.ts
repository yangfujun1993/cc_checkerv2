import { NextRequest, NextResponse } from 'next/server'
import { validateAccessKey } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { accessKey } = await request.json()

    if (!accessKey) {
      return NextResponse.json(
        { error: 'Access key is required' },
        { status: 400 }
      )
    }

    const validKey = await validateAccessKey(accessKey)
    
    if (!validKey) {
      return NextResponse.json(
        { error: 'Invalid or inactive access key' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Access key validated successfully',
      accessKey: {
        id: validKey.id,
        key: validKey.key,
        lastUsed: validKey.lastUsed
      }
    })

  } catch (error) {
    console.error('Validate access key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 