import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import contentRoutes from './routes/content.routes.js'
import messageRoutes from './routes/message.routes.js'
import publicRoutes from './routes/public.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import { errorHandler, notFound } from './middleware/error.js'
import { sanitize } from './middleware/sanitize.js'

const app = express()

// CORS allow-list. Requests with no Origin (curl, health checks, same-origin) always
// pass. In development any localhost/127.0.0.1 origin is allowed, so the client can
// run on 5173, 5174, … without CORS breaking. In production we allow the origins in
// CLIENT_URL (comma-separated) plus any *.vercel.app host, covering the production
// Vercel domain and its preview deployments.
const clientAllowList = env.clientUrl
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean)

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true)

  let host = ''
  try {
    host = new URL(origin).hostname
  } catch {
    return callback(new Error(`Invalid Origin: ${origin}`))
  }

  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1'
  if (env.nodeEnv !== 'production' && isLocalhost) return callback(null, true)

  const normalized = origin.replace(/\/$/, '')
  const allowed = clientAllowList.includes(normalized) || /\.vercel\.app$/i.test(host)
  if (allowed) return callback(null, true)

  return callback(new Error(`Origin not allowed by CORS: ${origin}`))
}

// Behind a reverse proxy in production (e.g. Render) the socket IP is the proxy, not
// the visitor. Trust the first hop so req.ip is the real client IP — otherwise every
// request shares one key and the rate limiters throttle all users together (and a
// handful of failed logins would lock everyone out). Use 1, not `true`, which
// express-rate-limit rejects as too permissive.
if (env.nodeEnv === 'production') app.set('trust proxy', 1)

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // The CMS renders uploaded images from Cloudinary, and admins can paste any
        // https image URL. Helmet's default `img-src 'self' data:` would block them
        // all in the single-service production deploy, breaking the core feature.
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
  })
)
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

// Tighter limits on the two abuse-prone endpoints (brute-force / spam).
const strict = (limit, windowMs, message) =>
  rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { success: false, message } })
app.use('/api/auth/login', strict(15, 15 * 60 * 1000, 'Too many login attempts. Please try again later.'))
app.use('/api/public/contact', strict(8, 60 * 60 * 1000, 'Too many messages sent. Please try again later.'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(sanitize)
app.use(compression())
app.use(cookieParser())
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (_req, res) => {
  res.json({ success: true, service: 'portfolio-cms-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin/content', contentRoutes)
app.use('/api/admin/messages', messageRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/public', publicRoutes)

// Serve the built React frontend if it exists (so `npm run build` + `npm start`
// serves the whole app — site + API — from this one server on port 5000).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.resolve(__dirname, '../../client/dist')
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use(notFound)
app.use(errorHandler)

export default app
