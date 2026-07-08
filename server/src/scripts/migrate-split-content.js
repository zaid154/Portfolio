/**
 * One-off migration: split the legacy single `contents` collection into one
 * collection per content type (projects, skills, …). Copies each document into
 * its type's collection (preserving _id), then drops `contents`.
 *
 * Safe to re-run: it upserts by _id and no-ops if `contents` is already gone.
 *
 * Run:  node src/scripts/migrate-split-content.js   (from the server folder)
 */
import mongoose from 'mongoose'
import { assertEnv } from '../config/env.js'
import { connectDb } from '../config/db.js'
import { modelForType, isKnownType } from '../models/contentModels.js'

async function run() {
  assertEnv()
  await connectDb()
  const db = mongoose.connection.db

  const exists = await db.listCollections({ name: 'contents' }).toArray()
  if (!exists.length) {
    console.log('No `contents` collection found — already migrated. Nothing to do.')
    return
  }

  const docs = await db.collection('contents').find({}).toArray()
  console.log(`Found ${docs.length} documents in \`contents\`.`)

  let migrated = 0
  let skipped = 0
  for (const doc of docs) {
    if (!isKnownType(doc.type)) {
      console.log(`  ! skipping unknown type "${doc.type}" (${doc.title})`)
      skipped++
      continue
    }
    const { _id, ...fields } = doc
    // eslint-disable-next-line no-await-in-loop
    await modelForType(doc.type).updateOne({ _id }, { $set: fields }, { upsert: true })
    migrated++
  }

  console.log(`Migrated ${migrated} documents into per-type collections.`)
  if (skipped) console.log(`Skipped ${skipped} documents with unknown types (left in place).`)

  if (!skipped) {
    await db.collection('contents').drop()
    console.log('Dropped legacy `contents` collection.')
  } else {
    console.log('Kept `contents` because some docs were skipped — review before dropping.')
  }
}

run()
  .then(async () => {
    await mongoose.disconnect()
    console.log('Done.')
    process.exit(0)
  })
  .catch(async (err) => {
    console.error(err)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  })
