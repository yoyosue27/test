import { registerUser, loginUser } from './auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'POST') {
    const { action, email, password, username } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Action required (register or login)' })
    }

    try {
      if (action === 'register') {
        if (!email || !password || !username) {
          return res.status(400).json({ error: 'Email, password, and username required' })
        }
        const result = await registerUser(email, password, username)
        if (result.error) {
          return res.status(result.status).json({ error: result.error })
        }
        return res.status(result.status).json(result)
      }

      if (action === 'login') {
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password required' })
        }
        const result = await loginUser(email, password)
        if (result.error) {
          return res.status(result.status).json({ error: result.error })
        }
        return res.status(result.status).json(result)
      }

      return res.status(400).json({ error: 'Invalid action' })
    } catch (error) {
      console.error('Auth error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
