import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import app from './app.js'
import { assertEnv, env } from './config/env.js'
import { connectDb } from './config/db.js'
import { findAvailablePort } from './utils/port.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Portfolio repo root (parent of server/) — where the shared .env and the
// dev port-handshake file live.
const rootDir = path.resolve(__dirname, '../../')

async function bootstrap() {
  assertEnv()

  // Connect to Mongo, but don't let a DB hiccup take the whole server down in dev.
  // In production we exit so Render restarts the service; in dev we keep listening
  // (health check + clear API errors) so the frontend isn't hitting a dead socket.
  let dbConnected = false
  try {
    await connectDb()
    dbConnected = true
  } catch (error) {
    logDbFailure(error)
    if (env.nodeEnv === 'production') process.exit(1)
  }

  const preferred = Number(env.port) || 5000
  const port = await findAvailablePort(preferred)

  app.listen(port, () => {
    if (env.nodeEnv !== 'production') writeDevServerFile(port)
    printBanner({ port, preferred, dbConnected })
  })
}

function printBanner({ port, preferred, dbConnected }) {
  const line = '=============================='
  const apiBase = `http://localhost:${port}/api`
  const mongo = dbConnected
    ? `Connected Successfully (db: ${mongoose.connection?.name || 'portfolio'})`
    : 'NOT CONNECTED — see error above'
  const rows = [
    line,
    'Portfolio API Started',
    line,
  ]
  if (port !== preferred) rows.push(`Port ${preferred} busy → using ${port}`)
  rows.push(
    `Backend:  http://localhost:${port}`,
    `API:      ${apiBase}`,
    `MongoDB:  ${mongo}`,
    `Client:   ${env.clientUrl}  (expected)`,
    `Env:      ${env.nodeEnv}`,
    line
  )
  // eslint-disable-next-line no-console
  console.log('\n' + rows.join('\n') + '\n')
}

// Write the actual API port so the Vite dev proxy can target it even when the
// backend fell back to a different port. Best-effort — never throws.
function writeDevServerFile(port) {
  try {
    const payload = { port, apiBase: `http://localhost:${port}/api` }
    fs.writeFileSync(path.join(rootDir, '.dev-server.json'), JSON.stringify(payload, null, 2))
  } catch {
    /* ignore — the proxy falls back to the default port */
  }
}

function logDbFailure(error) {
  const line = '------------------------------'
  // eslint-disable-next-line no-console
  console.error(
    '\n' +
      [
        line,
        'MongoDB connection FAILED',
        line,
        `Reason: ${error?.message || error}`,
        '',
        'Common fixes:',
        '  • Check MONGO_URI in .env (user, password, cluster host).',
        '  • In MongoDB Atlas → Network Access, allow your current IP (or 0.0.0.0/0 for testing).',
        '  • If SRV lookup fails on this machine, set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env.',
        line,
      ].join('\n') +
      '\n'
  )
}

bootstrap().catch((error) => {
  // Only fatal, non-DB startup errors reach here (e.g. assertEnv threw).
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
