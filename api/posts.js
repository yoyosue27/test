import fs from 'fs'
import crypto from 'crypto'
import { verifyToken } from './auth.js'
import { ensureDataFileDir, getDataFilePath } from './storage.js'

const POSTS_FILE = getDataFilePath('posts.json')

function ensureDataDir() {
  ensureDataFileDir(POSTS_FILE)
}

function getPosts() {
  ensureDataDir()

  try {
    if (!fs.existsSync(POSTS_FILE)) {
      return []
    }

    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function savePosts(posts) {
  ensureDataDir()
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))
}

function getBearerToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || ''
  const [scheme, token] = authHeader.split(' ')

  return scheme === 'Bearer' ? token : ''
}

function getCurrentUser(req) {
  const decoded = verifyToken(getBearerToken(req))

  if (!decoded?.id || !decoded?.email || !decoded?.username) {
    return null
  }

  return {
    id: decoded.id,
    email: decoded.email,
    username: decoded.username,
    createdAt: decoded.createdAt
  }
}

function validateImageData(imageData) {
  if (!imageData) {
    return ''
  }

  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return null
  }

  if (imageData.length > 1024 * 1024 * 2) {
    return null
  }

  return imageData
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET') {
    const posts = getPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return res.status(200).json({ posts })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = getCurrentUser(req)

  if (!user) {
    return res.status(401).json({ error: 'Please log in again.' })
  }

  const { action, postId, text, imageData } = req.body || {}
  const posts = getPosts()

  if (action === 'create') {
    const cleanText = String(text || '').trim()
    const cleanImageData = validateImageData(imageData)

    if (!cleanText && !cleanImageData) {
      return res.status(400).json({ error: 'Add text or a photo before posting.' })
    }

    if (cleanImageData === null) {
      return res.status(400).json({ error: 'Photo must be an image under 2 MB.' })
    }

    const post = {
      id: crypto.randomUUID(),
      author: user,
      text: cleanText,
      imageData: cleanImageData,
      comments: [],
      createdAt: new Date().toISOString()
    }

    posts.push(post)
    savePosts(posts)

    return res.status(201).json({ post })
  }

  if (action === 'comment') {
    const cleanText = String(text || '').trim()
    const post = posts.find(item => item.id === postId)

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' })
    }

    if (!cleanText) {
      return res.status(400).json({ error: 'Write a comment first.' })
    }

    const comment = {
      id: crypto.randomUUID(),
      author: user,
      text: cleanText,
      createdAt: new Date().toISOString()
    }

    post.comments.push(comment)
    savePosts(posts)

    return res.status(201).json({ comment, post })
  }

  return res.status(400).json({ error: 'Invalid action.' })
}
