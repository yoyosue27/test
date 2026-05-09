import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(USERS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Get all users
function getUsers() {
  ensureDataDir()
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return []
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

// Save users
function saveUsers(users) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// Find user by email
function findUserByEmail(email) {
  const users = getUsers()
  return users.find(u => u.email === email)
}

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Create JWT token
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
}

// Register user
export async function registerUser(email, password, username) {
  const existingUser = findUserByEmail(email)
  if (existingUser) {
    return { error: 'User already exists', status: 400 }
  }

  const hashedPassword = await hashPassword(password)
  const users = getUsers()
  const newUser = {
    id: Date.now().toString(),
    email,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveUsers(users)

  const token = createToken(newUser)
  return { token, user: { id: newUser.id, email, username }, status: 201 }
}

// Login user
export async function loginUser(email, password) {
  const user = findUserByEmail(email)
  if (!user) {
    return { error: 'User not found', status: 401 }
  }

  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return { error: 'Invalid password', status: 401 }
  }

  const token = createToken(user)
  return { token, user: { id: user.id, email: user.email, username: user.username }, status: 200 }
}

// Verify token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
