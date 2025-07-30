import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const ACCESS_KEYS_FILE = path.join(DATA_DIR, 'access_keys.json')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

export const initializeDatabaseFiles = () => {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    console.log('Created data directory:', DATA_DIR)
  }

  // Initialize users file if it doesn't exist
  if (!fs.existsSync(USERS_FILE)) {
    const hashedPassword = bcrypt.hashSync('Adarshkosta@@1212', 10)
    const ownerUser = {
      id: uuidv4(),
      username: 'adarsh',
      password: hashedPassword,
      role: 'owner',
      createdAt: new Date().toISOString()
    }
    
    fs.writeFileSync(USERS_FILE, JSON.stringify([ownerUser], null, 2))
    console.log('Created users file with owner account')
  }

  // Initialize access keys file if it doesn't exist
  if (!fs.existsSync(ACCESS_KEYS_FILE)) {
    fs.writeFileSync(ACCESS_KEYS_FILE, JSON.stringify([], null, 2))
    console.log('Created access keys file')
  }

  // Initialize sessions file if it doesn't exist
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2))
    console.log('Created sessions file')
  }

  console.log('Database files initialized successfully!')
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabaseFiles()
} 