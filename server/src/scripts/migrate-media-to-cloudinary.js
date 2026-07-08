/**
 * Upload every local media file referenced by content (e.g. "/images/x.png",
 * "/resume.pdf" living in client/public) to Cloudinary, and rewrite the stored
 * value to the returned Cloudinary URL. Idempotent: already-uploaded files and
 * values that are already http(s) URLs are left alone.
 *
 * Run:  node src/scripts/migrate-media-to-cloudinary.js   (from the server folder)
 */
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import { assertEnv, env } from '../config/env.js'
import { connectDb } from '../config/db.js'
import { allModels } from '../models/contentModels.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT_PUBLIC = path.resolve(__dirname, '../../../client/public')

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
})

// Map a stored value like "/images/x.png" to a real file under client/public.
function localFileFor(value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  const abs = path.resolve(CLIENT_PUBLIC, value.replace(/^\/+/, ''))
  if (!abs.startsWith(CLIENT_PUBLIC)) return null // stay inside client/public
  return fs.existsSync(abs) ? abs : null
}

const uploadCache = new Map() // absPath -> secure_url
let uploadedCount = 0

async function uploadOnce(absPath) {
  if (uploadCache.has(absPath)) return uploadCache.get(absPath)
  const isPdf = path.extname(absPath).toLowerCase() === '.pdf'
  const res = await cloudinary.uploader.upload(absPath, {
    folder: env.cloudinary.folder,
    resource_type: isPdf ? 'raw' : 'image',
    use_filename: true,
    unique_filename: false,
    overwrite: false, // re-runs return the existing asset instead of duplicating
  })
  uploadCache.set(absPath, res.secure_url)
  uploadedCount++
  return res.secure_url
}

async function run() {
  assertEnv()
  const c = env.cloudinary
  if (!c.cloudName || !c.apiKey || !c.apiSecret) {
    console.error('Cloudinary keys missing in .env — aborting.')
    process.exit(1)
  }
  await connectDb()

  let updatedDocs = 0
  for (const model of allModels()) {
    const docs = await model.find()
    for (const doc of docs) {
      const data = doc.data || {}
      let dirty = false
      for (const [key, value] of Object.entries(data)) {
        const abs = localFileFor(value)
        if (!abs) continue
        const url = await uploadOnce(abs)
        data[key] = url
        dirty = true
        console.log(`  ${doc.type}/${doc.title}  .${key}:  ${value}  ->  ${url}`)
      }
      if (dirty) {
        doc.data = data
        doc.markModified('data')
        await doc.save()
        updatedDocs++
      }
    }
  }

  console.log(`\nUploaded ${uploadedCount} file(s) to Cloudinary; updated ${updatedDocs} document(s).`)
}

run()
  .then(async () => {
    await mongoose.disconnect()
    process.exit(0)
  })
  .catch(async (err) => {
    console.error(err)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  })
