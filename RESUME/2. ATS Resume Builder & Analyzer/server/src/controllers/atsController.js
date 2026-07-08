import { Resume } from "../models/Resume.js";
import { analyzeResume } from "../services/atsAnalyzer.js";
import { asyncHandler } from "../middleware/error.js";

export const analyze = asyncHandler(async (req, res) => {
  const { resumeId, resume: resumeBody, jobDescription } = req.body;

  let resume = resumeBody;
  if (resumeId) {
    const doc = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!doc) return res.status(404).json({ message: "Resume not found" });
    resume = doc.toObject();
  }
  if (!resume) {
    return res.status(400).json({ message: "Provide a resume or resumeId to analyze" });
  }

  const result = analyzeResume(resume, jobDescription);

  // Persist the latest score when analyzing a saved resume.
  if (resumeId) {
    await Resume.updateOne({ _id: resumeId, user: req.user._id }, { lastScore: result.score });
  }

  res.json({ result });
});
