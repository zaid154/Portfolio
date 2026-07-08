import express from 'express'
import Message from '../models/Message.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { messageUpdateSchema } from '../validators/schemas.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

const router = express.Router()

router.use(protect)

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Message.find().sort({ createdAt: -1 })
    res.json({ success: true, items })
  })
)

router.put(
  '/:id',
  validate(messageUpdateSchema),
  asyncHandler(async (req, res) => {
    const item = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) throw new ApiError(404, 'Message not found')
    res.json({ success: true, item })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await Message.findByIdAndDelete(req.params.id)
    if (!item) throw new ApiError(404, 'Message not found')
    res.json({ success: true })
  })
)

export default router
