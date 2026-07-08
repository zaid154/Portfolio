import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) throw new ApiError(401, 'Authentication required')

  let decoded
  try {
    decoded = jwt.verify(token, env.jwtSecret)
  } catch {
    // Expired or tampered token -> 401 (not a 500)
    throw new ApiError(401, 'Session expired. Please sign in again.')
  }

  const user = await User.findById(decoded.id)
  if (!user) throw new ApiError(401, 'Invalid authentication token')

  req.user = user
  next()
})
