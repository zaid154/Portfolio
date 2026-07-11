import mongoose from 'mongoose'
import { env } from './env.js'
import { configureDns } from './dns.js'

let listenersBound = false

export async function connectDb() {
  configureDns()
  mongoose.set('strictQuery', true)
  bindConnectionListeners()

  // Fail fast (8s) instead of hanging on an unreachable cluster, so the boxed
  // error in index.js surfaces quickly instead of a silent stall.
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 })
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}

// After the initial connect, Mongoose auto-reconnects on transient drops. These
// listeners make those state changes visible instead of silent.
function bindConnectionListeners() {
  if (listenersBound) return
  listenersBound = true

  const conn = mongoose.connection
  conn.on('error', (err) => {
    console.error(`MongoDB connection error: ${err?.message || err}`)
  })
  conn.on('disconnected', () => {
    console.warn('MongoDB disconnected — Mongoose will attempt to reconnect.')
  })
  conn.on('reconnected', () => {
    console.log('MongoDB reconnected.')
  })
}
