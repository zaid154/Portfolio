import express from 'express'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, profileSchema, passwordSchema } from '../validators/schemas.js'
import { login, me, updateProfile, changePassword } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/login', validate(loginSchema), login)
router.get('/me', protect, me)
router.put('/profile', protect, validate(profileSchema), updateProfile)
router.put('/password', protect, validate(passwordSchema), changePassword)

export default router
