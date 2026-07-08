import { ZodError } from 'zod'
import { env } from '../config/env.js'

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500
  const payload = {
    success: false,
    message: error.message || 'Something went wrong',
  }

  if (error instanceof ZodError) {
    payload.message = 'Validation failed'
    payload.details = error.flatten()
    return res.status(422).json(payload)
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    payload.message = 'Duplicate value already exists'
    return res.status(409).json(payload)
  }

  // Malformed ObjectId in :id params -> 404 (not a 500)
  if (error.name === 'CastError') {
    payload.message = 'Resource not found'
    return res.status(404).json(payload)
  }

  if (env.nodeEnv !== 'production') {
    payload.stack = error.stack
    if (error.details) payload.details = error.details
  }

  return res.status(statusCode).json(payload)
}
