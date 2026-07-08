import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { loginSchema } from '../validators/schemas.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/token.js'

const router = express.Router()

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password')
    }

    res.json({
      success: true,
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  })
)

router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
  })
})

export default router
