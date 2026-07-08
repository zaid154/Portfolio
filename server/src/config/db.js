import mongoose from 'mongoose'
import { env } from './env.js'
import { configureDns } from './dns.js'

export async function connectDb() {
  configureDns()
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongoUri)
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}
