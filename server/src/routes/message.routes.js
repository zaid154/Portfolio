import express from 'express'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { messageUpdateSchema } from '../validators/schemas.js'
import { listMessages, updateMessage, deleteMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.use(protect)

router.get('/', listMessages)
router.put('/:id', validate(messageUpdateSchema), updateMessage)
router.delete('/:id', deleteMessage)

export default router
