import { loginOrRegisterWithGoogle } from './auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'POST') {
    const { idToken } = req.body || {}

    if (!idToken) {
      return res.status(400).json({ error: 'ID token required' })
    }

    try {
      // Decode the Google ID token (JWT format)
      const parts = idToken.split('.')
      if (parts.length !== 3) {
        return res.status(400).json({ error: 'Invalid token format' })
      }

      // Decode the payload (second part)
      let payload
      try {
        payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
      } catch {
        return res.status(400).json({ error: 'Invalid token payload' })
      }

      // Validate token expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ error: 'Token has expired' })
      }

      // Extract user info from payload
      const googleProfile = {
        email: payload.email,
        name: payload.name || 'User',
        picture: payload.picture
      }

      const result = await loginOrRegisterWithGoogle(googleProfile)

      if (result.error) {
        return res.status(result.status).json({ error: result.error })
      }

      return res.status(result.status).json(result)
    } catch (error) {
      console.error('Google auth error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
