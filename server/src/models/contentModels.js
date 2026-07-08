import mongoose from 'mongoose'
import slugify from 'slugify'

/**
 * Hybrid content model.
 *
 * - Types that grow into lists get their OWN collection (projects, skills, …).
 * - Everything that is effectively single-instance shares ONE `content`
 *   collection, distinguished by a `type` field. This keeps the database from
 *   filling up with a dozen one-document collections.
 *
 * The REST API is unchanged: callers still work by `type`; this module hides
 * whether a type lives in its own collection or the shared one.
 *
 * Keep in sync with `contentTypes` in client/src/lib/site.js.
 */

// One collection each — these hold lists that keep growing.
export const STANDALONE_COLLECTIONS = {
  project: 'projects',
  skill: 'skills',
  stat: 'stats',
  socialLink: 'socialLinks',
}

// All of these share the single `content` collection (tagged by `type`).
export const SHARED_COLLECTION = 'content'
export const SHARED_TYPES = [
  'hero',
  'about',
  'contactInfo',
  'resume',
  'seo',
  'siteText',
  'siteSetting',
  'blog',
  'certificate',
  'service',
  'testimonial',
  'experience',
  'education',
]

export const ALL_TYPES = [...Object.keys(STANDALONE_COLLECTIONS), ...SHARED_TYPES]

function baseSchemaDef() {
  return {
    // Always stored so API responses and the shared collection can tell types
    // apart, and the admin UI can group by it.
    type: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  }
}

function attachSlugHook(schema) {
  // Mongoose 9 dropped the callback-style `next`; a sync hook just returns.
  schema.pre('save', function setSlug() {
    if (!this.slug) this.slug = slugify(this.title, { lower: true, strict: true })
  })
}

// Standalone models — slug unique within their (single-type) collection.
const standaloneModels = {}
for (const [type, collection] of Object.entries(STANDALONE_COLLECTIONS)) {
  const schema = new mongoose.Schema(baseSchemaDef(), { timestamps: true, minimize: false })
  attachSlugHook(schema)
  schema.index({ slug: 1 }, { unique: true })
  standaloneModels[type] = mongoose.model(`Content_${type}`, schema, collection)
}

// Shared model — many types in one collection, so slug is unique PER type.
const sharedSchema = new mongoose.Schema(baseSchemaDef(), { timestamps: true, minimize: false })
attachSlugHook(sharedSchema)
sharedSchema.index({ type: 1, slug: 1 }, { unique: true })
const SharedModel = mongoose.model('Content_shared', sharedSchema, SHARED_COLLECTION)

export function isKnownType(type) {
  return ALL_TYPES.includes(type)
}

export function isShared(type) {
  return SHARED_TYPES.includes(type)
}

export function modelForType(type) {
  if (standaloneModels[type]) return standaloneModels[type]
  if (isShared(type)) return SharedModel
  return null
}

/**
 * Extra query scope for a type. Shared types must be filtered by `type` inside
 * the shared collection; standalone types need no extra filter.
 */
export function scopeForType(type) {
  return isShared(type) ? { type } : {}
}

// Every distinct underlying model (standalone ones + the single shared one).
export function allModels() {
  return [...Object.values(standaloneModels), SharedModel]
}

/**
 * Find one document by id across every underlying collection. Update/delete
 * arrive with just an id (and often a partial body without a type), so the
 * collection isn't known up front. Returns { model, doc } or null.
 */
export async function findAcrossModels(id) {
  if (!mongoose.isValidObjectId(id)) return null
  for (const model of allModels()) {
    // eslint-disable-next-line no-await-in-loop
    const doc = await model.findById(id)
    if (doc) return { model, doc }
  }
  return null
}
