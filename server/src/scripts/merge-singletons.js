/**
 * One-off migration: fold the single-instance content collections (heroes,
 * about, seo, blogs, testimonials, …) into ONE shared `content` collection,
 * tagged by `type`, then drop the now-empty per-type collections. The growing
 * lists (projects, skills, stats, socialLinks) are left in their own collections.
 *
 * Safe to re-run: upserts by _id and skips collections that are already gone.
 *
 * Run:  node src/scripts/merge-singletons.js   (from the server folder)
 */
import mongoose from 'mongoose'
import { assertEnv } from '../config/env.js'
import { connectDb } from '../config/db.js'
import { SHARED_TYPES, SHARED_COLLECTION } from '../models/contentModels.js'

// The per-type collection names created by the earlier split, keyed by type.
const OLD_COLLECTIONS = {
  hero: 'heroes',
  about: 'about',
  contactInfo: 'contactInfo',
  resume: 'resume',
  seo: 'seo',
  siteText: 'siteText',
  siteSetting: 'siteSettings',
  blog: 'blogs',
  certificate: 'certificates',
  service: 'services',
  testimonial: 'testimonials',
  experience: 'experiences',
  education: 'education',
}

async function run() {
  assertEnv()
  await connectDb()
  const db = mongoose.connection.db
  const existing = (await db.listCollections().toArray()).map((c) => c.name)
  const target = db.collection(SHARED_COLLECTION)

  let moved = 0
  for (const type of SHARED_TYPES) {
    const src = OLD_COLLECTIONS[type]
    if (src === SHARED_COLLECTION) continue
    if (!existing.includes(src)) {
      console.log(`  (skip ${src} — not present)`)
      continue
    }
    const docs = await db.collection(src).find({}).toArray()
    for (const doc of docs) {
      const { _id, ...fields } = doc
      fields.type = type // make sure the shared collection can tell them apart
      // eslint-disable-next-line no-await-in-loop
      await target.updateOne({ _id }, { $set: fields }, { upsert: true })
      moved++
    }
    await db.collection(src).drop()
    console.log(`  ${src.padEnd(14)} -> ${SHARED_COLLECTION}: ${docs.length} doc(s), dropped ${src}`)
  }

  console.log(`Done. Moved ${moved} document(s) into '${SHARED_COLLECTION}'.`)
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
