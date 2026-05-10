import http from 'http'
import { createServer as createViteServer } from 'vite'

const PORT = Number(process.env.PORT || 5173)
const HOST = process.env.HOST || '127.0.0.1'

const routes = {
  '/api/login': () => import('../api/login.js'),
  '/api/posts': () => import('../api/posts.js')
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', chunk => {
      body += chunk
    })

    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    req.on('error', reject)
  })
}

function createResponseAdapter(res) {
  return {
    setHeader(name, value) {
      res.setHeader(name, value)
      return this
    },
    status(code) {
      res.statusCode = code
      return this
    },
    json(payload) {
      if (!res.hasHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json')
      }
      res.end(JSON.stringify(payload))
      return this
    }
  }
}

async function handleApi(req, res, pathname) {
  const loadRoute = routes[pathname]

  if (!loadRoute) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'API route not found' }))
    return
  }

  try {
    const body = await readBody(req)
    const { default: handler } = await loadRoute()
    await handler({ method: req.method, headers: req.headers, body }, createResponseAdapter(res))
  } catch (error) {
    const statusCode = error.message === 'Invalid JSON body' ? 400 : 500
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: statusCode === 400 ? error.message : 'Internal server error' }))
  }
}

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa'
})

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`)

  if (url.pathname.startsWith('/api/')) {
    await handleApi(req, res, url.pathname)
    return
  }

  vite.middlewares(req, res)
})

server.listen(PORT, HOST, () => {
  console.log(`Local app and API running at http://${HOST}:${PORT}`)
})
