import User from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/token.js'

export const login = asyncHandler(async (req, res) => {
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

export const me = (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
  })
}

// Update the signed-in admin's name / email. Uses findByIdAndUpdate (not save) so
// the select:false password field isn't required-validated on an unrelated edit.
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body

  const taken = await User.findOne({ email, _id: { $ne: req.user._id } })
  if (taken) throw new ApiError(409, 'That email is already in use')

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true }
  )
  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  })
})

// Change the signed-in admin's password. Requires the current password; the model's
// pre('save') hook re-hashes the new one.
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  user.password = newPassword
  await user.save()
  res.json({ success: true, message: 'Password updated' })
})
