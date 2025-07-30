import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { initializeDatabaseFiles } from './init-database'

const JWT_SECRET = process.env.JWT_SECRET || 'black-panther-secret-key-2024'

// File paths for persistent storage
const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const ACCESS_KEYS_FILE = path.join(DATA_DIR, 'access_keys.json')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Helper functions for file operations
const readJsonFile = (filePath: string, defaultValue: any = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
  }
  return defaultValue
}

const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error)
    return false
  }
}

// In-memory storage with file persistence
let users: User[] = readJsonFile(USERS_FILE, [])
let accessKeys: AccessKey[] = readJsonFile(ACCESS_KEYS_FILE, [])
let cardSessions: CardSession[] = readJsonFile(SESSIONS_FILE, [])

// Save data to files
const saveUsers = () => writeJsonFile(USERS_FILE, users)
const saveAccessKeys = () => writeJsonFile(ACCESS_KEYS_FILE, accessKeys)
const saveSessions = () => writeJsonFile(SESSIONS_FILE, cardSessions)

// Initialize with owner account if no users exist
const initializeDatabase = () => {
  if (users.length === 0) {
    const hashedPassword = bcrypt.hashSync('Adarshkosta@@1212', 10)
    const ownerUser: User = {
      id: uuidv4(),
      username: 'adarsh',
      password: hashedPassword,
      role: 'owner',
      createdAt: new Date()
    }
    users.push(ownerUser)
    saveUsers()
  }
}

// Initialize database files and data
initializeDatabaseFiles()
initializeDatabase()

// User management
export const createUser = async (username: string, password: string, role: 'owner' | 'user' = 'user'): Promise<User> => {
  const existingUser = users.find(u => u.username === username)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user: User = {
    id: uuidv4(),
    username,
    password: hashedPassword,
    role,
    createdAt: new Date()
  }

  users.push(user)
  saveUsers()
  return user
}

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const user = users.find(u => u.username === username)
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  return isValid ? user : null
}

export const generateToken = (user: User): string => {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Access key management
export const createAccessKey = async (createdBy: string): Promise<AccessKey> => {
  const key = `BP-${uuidv4().substring(0, 8).toUpperCase()}`
  const accessKey: AccessKey = {
    id: uuidv4(),
    key,
    createdBy,
    isActive: true,
    createdAt: new Date()
  }

  accessKeys.push(accessKey)
  saveAccessKeys()
  return accessKey
}

export const validateAccessKey = async (key: string): Promise<AccessKey | null> => {
  const accessKey = accessKeys.find(ak => ak.key === key && ak.isActive)
  if (accessKey) {
    accessKey.lastUsed = new Date()
    saveAccessKeys()
  }
  return accessKey || null
}

export const getAccessKeys = (): AccessKey[] => {
  return accessKeys.filter(ak => ak.isActive)
}

export const deactivateAccessKey = (keyId: string): boolean => {
  const accessKey = accessKeys.find(ak => ak.id === keyId)
  if (accessKey) {
    accessKey.isActive = false
    saveAccessKeys()
    return true
  }
  return false
}

// Card session management
export const createCardSession = async (accessKeyId: string, cards: string[]): Promise<CardSession> => {
  const session: CardSession = {
    id: uuidv4(),
    accessKeyId,
    cards,
    status: 'running',
    results: [],
    currentIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  cardSessions.push(session)
  saveSessions()
  return session
}

export const getCardSession = (sessionId: string): CardSession | null => {
  return cardSessions.find(s => s.id === sessionId) || null
}

export const getSessionsByAccessKey = (accessKeyId: string): CardSession[] => {
  return cardSessions.filter(s => s.accessKeyId === accessKeyId)
}

export const updateCardSession = (sessionId: string, updates: Partial<CardSession>): boolean => {
  const session = cardSessions.find(s => s.id === sessionId)
  if (session) {
    Object.assign(session, updates, { updatedAt: new Date() })
    saveSessions()
    return true
  }
  return false
}

export const addCardResult = (sessionId: string, result: CardResult): boolean => {
  const session = cardSessions.find(s => s.id === sessionId)
  if (session) {
    session.results.push(result)
    session.currentIndex++
    session.updatedAt = new Date()
    saveSessions()
    return true
  }
  return false
}

export const getRunningSessions = (): CardSession[] => {
  return cardSessions.filter(s => s.status === 'running')
}

export const getAllSessions = (): CardSession[] => {
  return cardSessions
}

// Cleanup old sessions (older than 24 hours)
export const cleanupOldSessions = () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const originalLength = cardSessions.length
  cardSessions = cardSessions.filter(s => s.updatedAt > twentyFourHoursAgo)
  
  if (cardSessions.length !== originalLength) {
    saveSessions()
  }
}

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000)

// Export interfaces
export interface User {
  id: string
  username: string
  password: string
  role: 'owner' | 'user'
  createdAt: Date
}

export interface AccessKey {
  id: string
  key: string
  createdBy: string
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}

export interface CardSession {
  id: string
  accessKeyId: string
  cards: string[]
  status: 'running' | 'paused' | 'completed'
  results: CardResult[]
  currentIndex: number
  createdAt: Date
  updatedAt: Date
}

export interface CardResult {
  card: string
  status: 'approved' | 'declined' | 'unknown' | 'error'
  response: string
  timestamp: string
} 