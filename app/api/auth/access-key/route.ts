import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, createAccessKey, getAccessKeys, deactivateAccessKey } from '@/lib/database'

// Middleware to verify owner token
const verifyOwnerToken = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded || decoded.role !== 'owner') {
    return null
  }

  return decoded
}

// Create new access key (owner only)
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyOwnerToken(request)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access required' },
        { status: 401 }
      )
    }

    const accessKey = await createAccessKey(decoded.userId)

    return NextResponse.json({
      success: true,
      accessKey: {
        id: accessKey.id,
        key: accessKey.key,
        createdAt: accessKey.createdAt
      }
    })

  } catch (error) {
    console.error('Create access key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all access keys (owner only)
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyOwnerToken(request)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access required' },
        { status: 401 }
      )
    }

    const accessKeys = getAccessKeys()

    return NextResponse.json({
      success: true,
      accessKeys: accessKeys.map(ak => ({
        id: ak.id,
        key: ak.key,
        isActive: ak.isActive,
        createdAt: ak.createdAt,
        lastUsed: ak.lastUsed
      }))
    })

  } catch (error) {
    console.error('Get access keys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Deactivate access key (owner only)
export async function DELETE(request: NextRequest) {
  try {
    const decoded = verifyOwnerToken(request)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access required' },
        { status: 401 }
      )
    }

    const { keyId } = await request.json()
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      )
    }

    const success = deactivateAccessKey(keyId)

    if (!success) {
      return NextResponse.json(
        { error: 'Access key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Access key deactivated successfully'
    })

  } catch (error) {
    console.error('Deactivate access key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 