import express from 'express'
import { upload } from '../config/cloudinary.js'
import { env } from '../config/env.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

const router = express.Router()

// Fail early with a clear message if Cloudinary isn't configured.
function ensureCloudinary(_req, _res, next) {
  const c = env.cloudinary
  if (!c.cloudName || !c.apiKey || !c.apiSecret) {
    return next(new ApiError(503, 'Image uploads are not set up. Add your CLOUDINARY_* keys to the .env file.'))
  }
  next()
}

// Turn multer/cloudinary errors into clean API errors instead of opaque 500s.
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 8MB).' : err.message || 'Upload failed'
      return next(new ApiError(400, msg))
    }
    next()
  })
}

router.post(
  '/',
  protect,
  ensureCloudinary,
  uploadSingle,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file uploaded')

    res.status(201).json({
      success: true,
      file: {
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype,
      },
    })
  })
)

export default router
