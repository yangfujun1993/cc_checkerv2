'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, Download, Settings, 
  CheckCircle, XCircle, AlertCircle, Clock,
  Key, LogOut, Filter, Eye, EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CardResult {
  card: string
  status: 'approved' | 'declined' | 'unknown' | 'error'
  response: string
  timestamp: string
}

interface Session {
  id: string
  accessKeyId: string
  cards: string[]
  status: 'running' | 'paused' | 'completed'
  results: CardResult[]
  currentIndex: number
  createdAt: string
  updatedAt: string
}

export default function HomePage() {
  // Access key state
  const [accessKey, setAccessKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentAccessKey, setCurrentAccessKey] = useState<any>(null)
  const [showAccessKey, setShowAccessKey] = useState(false)

  // Card checking state
  const [cardData, setCardData] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [results, setResults] = useState<CardResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalCards, setTotalCards] = useState(0)
  const [checkedCards, setCheckedCards] = useState(0)

  // Settings
  const [delay, setDelay] = useState(2000)
  const [retries, setRetries] = useState(3)
  const [showSettings, setShowSettings] = useState(false)

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'declined' | 'unknown' | 'error'>('all')
  const [showResults, setShowResults] = useState(true)

  // Stats
  const [stats, setStats] = useState({
    approved: 0,
    declined: 0,
    unknown: 0,
    error: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAccessKey = localStorage.getItem('userAccessKey')
    if (savedAccessKey) {
      validateAccessKey(savedAccessKey)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && currentAccessKey) {
      loadSessions()
    }
  }, [isAuthenticated, currentAccessKey])

  useEffect(() => {
    // Update stats when results change
    const newStats = {
      approved: results.filter(r => r.status === 'approved').length,
      declined: results.filter(r => r.status === 'declined').length,
      unknown: results.filter(r => r.status === 'unknown').length,
      error: results.filter(r => r.status === 'error').length
    }
    setStats(newStats)
  }, [results])

  const validateAccessKey = async (key: string) => {
    try {
      const response = await fetch('/api/auth/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey: key }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setCurrentAccessKey(data.accessKey)
        localStorage.setItem('userAccessKey', key)
        toast.success('Access key validated successfully!')
      } else {
        toast.error(data.error || 'Invalid access key')
        localStorage.removeItem('userAccessKey')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const handleAccessKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (accessKey.trim()) {
      validateAccessKey(accessKey.trim())
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch(`/api/sessions?accessKeyId=${currentAccessKey.id}`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
        
        // Load results from the most recent session
        if (data.sessions.length > 0) {
          const latestSession = data.sessions[0]
          setResults(latestSession.results || [])
          setCurrentSession(latestSession)
          setCheckedCards(latestSession.results?.length || 0)
          setTotalCards(latestSession.cards?.length || 0)
          setCurrentIndex(latestSession.currentIndex || 0)
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const createSession = async (cards: string[]) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: currentAccessKey.id,
          cards
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.session)
        setResults([])
        setCheckedCards(0)
        setTotalCards(cards.length)
        setCurrentIndex(0)
        toast.success('Session created successfully!')
        return data.session
      } else {
        toast.error('Failed to create session')
        return null
      }
    } catch (error) {
      toast.error('Network error')
      return null
    }
  }

  const checkCard = async (card: string, sessionId: string) => {
    try {
      const response = await fetch('/api/check-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card, sessionId }),
      })

      const result = await response.json()
      
      setResults(prev => [...prev, result])
      setCheckedCards(prev => prev + 1)
      setCurrentIndex(prev => prev + 1)

      // Show toast based on status
      if (result.status === 'approved') {
        toast.success(`✅ APPROVED: ${card}`)
      } else if (result.status === 'declined') {
        toast.error(`❌ DECLINED: ${card}`)
      } else if (result.status === 'error') {
        toast.error(`⚠️ ERROR: ${card}`)
      }

      return result
    } catch (error) {
      const errorResult = {
        card,
        status: 'error' as const,
        response: 'Network error',
        timestamp: new Date().toISOString()
      }
      
      setResults(prev => [...prev, errorResult])
      setCheckedCards(prev => prev + 1)
      setCurrentIndex(prev => prev + 1)
      
      toast.error(`⚠️ ERROR: ${card}`)
      return errorResult
    }
  }

  const startChecking = async () => {
    if (!cardData.trim()) {
      toast.error('Please enter card data')
      return
    }

    const cards = cardData.trim().split('\n').filter(card => card.trim())
    if (cards.length === 0) {
      toast.error('No valid cards found')
      return
    }

    setIsChecking(true)
    setIsPaused(false)

    // Create new session
    const session = await createSession(cards)
    if (!session) {
      setIsChecking(false)
      return
    }

    // Start checking cards
    for (let i = 0; i < cards.length; i++) {
      if (isPaused) break
      
      await checkCard(cards[i], session.id)
      
      if (i < cards.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    setIsChecking(false)
    toast.success('Card checking completed!')
  }

  const pauseChecking = () => {
    setIsPaused(true)
    toast('Card checking paused', { icon: '⏸️' })
  }

  const resumeChecking = () => {
    setIsPaused(false)
    toast('Card checking resumed', { icon: '▶️' })
  }

  const resetChecking = () => {
    setIsChecking(false)
    setIsPaused(false)
    setResults([])
    setCheckedCards(0)
    setCurrentIndex(0)
    setCurrentSession(null)
    toast('Reset completed', { icon: '🔄' })
  }

  const exportResults = () => {
    const filteredResults = filterStatus === 'all' 
      ? results 
      : results.filter(r => r.status === filterStatus)

    if (filteredResults.length === 0) {
      toast.error('No results to export')
      return
    }

    const csv = [
      'Card,Status,Response,Timestamp',
      ...filteredResults.map(r => 
        `"${r.card}","${r.status}","${r.response.replace(/"/g, '""')}","${r.timestamp}"`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cc-results-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Results exported successfully!')
  }

  const handleLogout = () => {
    localStorage.removeItem('userAccessKey')
    setIsAuthenticated(false)
    setCurrentAccessKey(null)
    setResults([])
    setSessions([])
    setCurrentSession(null)
    toast.success('Logged out successfully')
  }

  const filteredResults = filterStatus === 'all' 
    ? results 
    : results.filter(r => r.status === filterStatus)

  const progress = totalCards > 0 ? (checkedCards / totalCards) * 100 : 0

  // Access Key Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,215,0,0.05),transparent_50%)] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <Key className="w-12 h-12 text-yellow-400 mr-3" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Black Panther
                </h1>
              </div>
              <p className="text-gray-300 text-lg">CC Checker Access</p>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-4 rounded-full"></div>
            </motion.div>

            {/* Access Key Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-8 shadow-2xl"
            >
              <form onSubmit={handleAccessKeySubmit} className="space-y-6">
                <div>
                  <label className="block text-yellow-400 text-sm font-semibold mb-2">
                    Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showAccessKey ? 'text' : 'password'}
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 pr-12"
                      placeholder="Enter your access key"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessKey(!showAccessKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-yellow-400/50 hover:text-yellow-400 transition-colors"
                    >
                      {showAccessKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 flex items-center justify-center"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Access Checker
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-6 text-center"
              >
                <p className="text-gray-400 text-sm">
                  Enter your access key to use the Black Panther CC Checker
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main Checker Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,215,0,0.05),transparent_50%)] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-lg border-b border-yellow-400/30 p-6"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Black Panther CC Checker</h1>
                <p className="text-gray-400">Quantum Technology • Wakanda Forever</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                Access Key: {currentAccessKey?.key.substring(0, 8)}...
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Declined</p>
                  <p className="text-3xl font-bold text-red-400">{stats.declined}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unknown</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.unknown}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Errors</p>
                  <p className="text-3xl font-bold text-orange-400">{stats.error}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Card Input */}
              <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Card Data Input</h2>
                <textarea
                  value={cardData}
                  onChange={(e) => setCardData(e.target.value)}
                  placeholder="Paste your card data here (one per line)&#10;Format: 1234567890123456|MM|YYYY|CVV"
                  className="w-full h-48 px-4 py-3 bg-black/50 border border-yellow-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 resize-none"
                  disabled={isChecking}
                />
              </div>

              {/* Controls */}
              <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Controls</h2>
                <div className="flex flex-wrap gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startChecking}
                    disabled={isChecking || !cardData.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isPaused ? resumeChecking : pauseChecking}
                    disabled={!isChecking}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetChecking}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportResults}
                    disabled={results.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </motion.button>
                </div>

                {/* Progress Bar */}
                {isChecking && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progress: {checkedCards}/{totalCards}</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6 overflow-hidden"
                  >
                    <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-yellow-400 text-sm font-semibold mb-2">
                          Delay between checks (ms)
                        </label>
                        <input
                          type="number"
                          value={delay}
                          onChange={(e) => setDelay(Number(e.target.value))}
                          min="1000"
                          max="10000"
                          className="w-full px-4 py-2 bg-black/50 border border-yellow-400/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-yellow-400 text-sm font-semibold mb-2">
                          Retry attempts
                        </label>
                        <input
                          type="number"
                          value={retries}
                          onChange={(e) => setRetries(Number(e.target.value))}
                          min="1"
                          max="10"
                          className="w-full px-4 py-2 bg-black/50 border border-yellow-400/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Filter Controls */}
              <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Results</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 bg-black/50 border border-yellow-400/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="all">All Results</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="unknown">Unknown</option>
                      <option value="error">Error</option>
                    </select>
                    <button
                      onClick={() => setShowResults(!showResults)}
                      className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                    >
                      {showResults ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showResults ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                </div>

                {/* Results Table */}
                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-black/80">
                            <tr className="border-b border-yellow-400/30">
                              <th className="text-left py-2 text-yellow-400">Card</th>
                              <th className="text-left py-2 text-yellow-400">Status</th>
                              <th className="text-left py-2 text-yellow-400">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredResults.map((result, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-800 hover:bg-black/30"
                              >
                                <td className="py-2 text-white font-mono text-xs">
                                  {result.card}
                                </td>
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    result.status === 'approved' 
                                      ? 'bg-green-600/20 text-green-400 border border-green-400/30'
                                      : result.status === 'declined'
                                      ? 'bg-red-600/20 text-red-400 border border-red-400/30'
                                      : result.status === 'error'
                                      ? 'bg-orange-600/20 text-orange-400 border border-orange-400/30'
                                      : 'bg-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                                  }`}>
                                    {result.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-2 text-gray-400 text-xs">
                                  {new Date(result.timestamp).toLocaleTimeString()}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {filteredResults.length === 0 && (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No results to display</p>
                            <p className="text-gray-500 text-sm">Start checking cards to see results</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 