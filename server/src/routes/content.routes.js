import express from 'express'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { contentSchema, contentUpdateSchema } from '../validators/schemas.js'
import {
  listContent,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js'

const router = express.Router()

router.use(protect)

router.get('/', listContent)
router.post('/', validate(contentSchema), createContent)
router.put('/:id', validate(contentUpdateSchema), updateContent)
router.delete('/:id', deleteContent)

export default router
