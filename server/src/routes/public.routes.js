import express from 'express'
import { validate } from '../middleware/validate.js'
import { messageSchema } from '../validators/schemas.js'
import { getSite, contact } from '../controllers/public.controller.js'

const router = express.Router()

router.get('/site', getSite)
router.post('/contact', validate(messageSchema), contact)

export default router
