import Message from '../models/Message.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

export const listMessages = asyncHandler(async (_req, res) => {
  const items = await Message.find().sort({ createdAt: -1 })
  res.json({ success: true, items })
})

export const updateMessage = asyncHandler(async (req, res) => {
  const item = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) throw new ApiError(404, 'Message not found')
  res.json({ success: true, item })
})

export const deleteMessage = asyncHandler(async (req, res) => {
  const item = await Message.findByIdAndDelete(req.params.id)
  if (!item) throw new ApiError(404, 'Message not found')
  res.json({ success: true })
})
