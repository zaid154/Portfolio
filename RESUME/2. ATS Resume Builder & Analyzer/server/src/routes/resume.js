import { Router } from "express";
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  duplicateResume,
  deleteResume,
} from "../controllers/resumeController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { resumeSchema } from "../utils/schemas.js";

const router = Router();

router.use(requireAuth);

router.get("/", listResumes);
router.post("/", validate(resumeSchema), createResume);
router.get("/:id", getResume);
router.put("/:id", validate(resumeSchema), updateResume);
router.post("/:id/duplicate", duplicateResume);
router.delete("/:id", deleteResume);

export default router;
