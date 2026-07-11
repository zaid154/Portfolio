import Message from '../models/Message.js'
import { ALL_TYPES, modelForType, scopeForType } from '../models/contentModels.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getSite = asyncHandler(async (_req, res) => {
  // Pull published items for every type (scoped so shared types read only their
  // own docs from the `content` collection) and group them by type, keeping the
  // exact `{ site: { hero: [...], project: [...] } }` shape the frontend uses.
  const groups = await Promise.all(
    ALL_TYPES.map((type) =>
      modelForType(type)
        .find({ ...scopeForType(type), status: 'published' })
        .sort({ order: 1 })
        .lean()
        .then((items) => [type, items])
    )
  )
  const site = {}
  for (const [type, items] of groups) if (items.length) site[type] = items

  res.json({ success: true, site })
})

export const contact = asyncHandler(async (req, res) => {
  const { website, ...clean } = req.body
  // Bot filled the hidden honeypot field — pretend success, save nothing.
  if (website) return res.status(201).json({ success: true, message: 'Message sent successfully' })
  const message = await Message.create(clean)
  res.status(201).json({ success: true, message: 'Message sent successfully', id: message._id })
})
