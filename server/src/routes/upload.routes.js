import express from 'express'
import { protect } from '../middleware/auth.js'
import { ensureCloudinary, uploadSingle, uploadFile } from '../controllers/upload.controller.js'

const router = express.Router()

router.post('/', protect, ensureCloudinary, uploadSingle, uploadFile)

export default router
