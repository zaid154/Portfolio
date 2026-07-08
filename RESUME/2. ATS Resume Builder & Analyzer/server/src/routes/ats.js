import { Router } from "express";
import { analyze } from "../controllers/atsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { analyzeSchema } from "../utils/schemas.js";

const router = Router();

router.post("/analyze", requireAuth, validate(analyzeSchema), analyze);

export default router;
