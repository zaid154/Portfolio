import express from 'express'
import slugify from 'slugify'
import {
  modelForType,
  isKnownType,
  scopeForType,
  allModels,
  findAcrossModels,
} from '../models/contentModels.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { contentSchema, contentUpdateSchema } from '../validators/schemas.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

const router = express.Router()

router.use(protect)

// Generate a slug that doesn't collide within the given scope (whole collection
// for standalone types, or {type} within the shared collection).
async function uniqueSlug(model, base, scope, excludeId) {
  const root = (base && base.trim()) || 'item'
  let slug = root
  let n = 2
  // eslint-disable-next-line no-await-in-loop
  while (await model.exists({ ...scope, slug, _id: { $ne: excludeId || null } })) {
    slug = `${root}-${n++}`
  }
  return slug
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.query.type) {
      if (!isKnownType(req.query.type)) return res.json({ success: true, items: [] })
      const items = await modelForType(req.query.type)
        .find(scopeForType(req.query.type))
        .sort({ order: 1, createdAt: -1 })
      return res.json({ success: true, items })
    }
    // No type filter → the admin dashboard fetches everything at once and groups
    // it client-side, so union every underlying collection into one list.
    const groups = await Promise.all(allModels().map((m) => m.find()))
    const items = groups.flat().sort((a, b) => {
      if (a.type !== b.type) return a.type < b.type ? -1 : 1
      if (a.order !== b.order) return a.order - b.order
      return b.createdAt - a.createdAt
    })
    res.json({ success: true, items })
  })
)

router.post(
  '/',
  validate(contentSchema),
  asyncHandler(async (req, res) => {
    const { type } = req.body
    const model = modelForType(type)
    if (!model) throw new ApiError(400, `Unknown content type: ${type}`)
    const base = req.body.slug || slugify(req.body.title, { lower: true, strict: true })
    const slug = await uniqueSlug(model, base, scopeForType(type))
    const item = await model.create({ ...req.body, type, slug })
    res.status(201).json({ success: true, item })
  })
)

router.put(
  '/:id',
  validate(contentUpdateSchema),
  asyncHandler(async (req, res) => {
    const found = await findAcrossModels(req.params.id)
    if (!found) throw new ApiError(404, 'Content item not found')
    const { model, doc } = found

    const payload = { ...req.body }
    // Type is fixed by where the doc lives — never move it between types.
    delete payload.type
    if ((payload.title && !payload.slug) || payload.slug) {
      const base = payload.slug || slugify(payload.title, { lower: true, strict: true })
      payload.slug = await uniqueSlug(model, base, scopeForType(doc.type), doc._id)
    }

    const item = await model.findByIdAndUpdate(doc._id, payload, {
      new: true,
      runValidators: true,
    })
    res.json({ success: true, item })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const found = await findAcrossModels(req.params.id)
    if (!found) throw new ApiError(404, 'Content item not found')
    await found.model.findByIdAndDelete(found.doc._id)
    res.json({ success: true })
  })
)

export default router
