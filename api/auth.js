import fs from 'fs'
import crypto from 'crypto'
import { ensureDataFileDir, getDataFilePath } from './storage.js'

const USERS_FILE = getDataFilePath('users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const HASH_ITERATIONS = 120000
const HASH_LENGTH = 64
const HASH_DIGEST = 'sha512'

function ensureDataDir() {
  ensureDataFileDir(USERS_FILE)
}

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

function saveUsers(users) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function normalizeUsername(username) {
  return String(username || '').trim()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9._-]{3,30}$/.test(username)
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt
  }
}

function findUserByLogin(login) {
  const normalizedLogin = normalizeEmail(login)
  const users = getUsers()

  return users.find(user => {
    return user.email === normalizedLogin || user.username.toLowerCase() === normalizedLogin
  })
}

export function findUserById(id) {
  const users = getUsers()
  const user = users.find(item => item.id === id)

  return user ? publicUser(user) : null
}

function userExists(email, username) {
  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = normalizeUsername(username).toLowerCase()
  const users = getUsers()

  return users.some(user => {
    return user.email === normalizedEmail || user.username.toLowerCase() === normalizedUsername
  })
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url')
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST)
    .toString('base64url')

  return `pbkdf2:${HASH_DIGEST}:${HASH_ITERATIONS}:${salt}:${hash}`
}

function verifyPassword(password, storedHash) {
  const [scheme, digest, iterations, salt, hash] = String(storedHash || '').split(':')

  if (scheme !== 'pbkdf2' || !digest || !iterations || !salt || !hash) {
    return false
  }

  const candidate = crypto
    .pbkdf2Sync(password, salt, Number(iterations), HASH_LENGTH, digest)
    .toString('base64url')

  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash))
}

function base64UrlJson(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function sign(value) {
  return crypto.createHmac('sha256', JWT_SECRET).update(value).digest('base64url')
}

function createToken(user) {
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' })
  const payload = base64UrlJson({
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
  })
  const unsignedToken = `${header}.${payload}`

  return `${unsignedToken}.${sign(unsignedToken)}`
}

export async function registerUser(email, password, username) {
  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = normalizeUsername(username)

  if (!isValidEmail(normalizedEmail)) {
    return { error: 'Enter a valid email address.', status: 400 }
  }

  if (!isValidUsername(normalizedUsername)) {
    return { error: 'Username must be 3-30 characters and use only letters, numbers, dots, underscores, or hyphens.', status: 400 }
  }

  if (String(password || '').length < 8) {
    return { error: 'Password must be at least 8 characters.', status: 400 }
  }

  if (userExists(normalizedEmail, normalizedUsername)) {
    return { error: 'Email or username already exists.', status: 400 }
  }

  const users = getUsers()
  const newUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    username: normalizedUsername,
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveUsers(users)

  return { token: createToken(newUser), user: publicUser(newUser), status: 201 }
}

export async function loginUser(login, password) {
  const user = findUserByLogin(login)

  if (!user || !verifyPassword(password, user.password)) {
    return { error: 'Invalid email/username or password.', status: 401 }
  }

  return { token: createToken(user), user: publicUser(user), status: 200 }
}

export function verifyToken(token) {
  try {
    const [header, payload, signature] = String(token || '').split('.')
    const unsignedToken = `${header}.${payload}`

    if (!header || !payload || !signature || sign(unsignedToken) !== signature) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}
