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
    origin: env.clientUrl,
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
