import { Resume } from "../models/Resume.js";
import { asyncHandler } from "../middleware/error.js";

async function findOwned(id, userId) {
  const resume = await Resume.findOne({ _id: id, user: userId });
  return resume;
}

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select("title template accent lastScore createdAt updatedAt personal.fullName personal.jobTitle");
  res.json({ resumes });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await findOwned(req.params.id, req.user._id);
  if (!resume) return res.status(404).json({ message: "Resume not found" });
  res.json({ resume });
});

export const createResume = asyncHandler(async (req, res) => {
  const resume = await Resume.create({ ...req.body, user: req.user._id });
  res.status(201).json({ resume });
});

export const updateResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!resume) return res.status(404).json({ message: "Resume not found" });
  res.json({ resume });
});

export const duplicateResume = asyncHandler(async (req, res) => {
  const original = await findOwned(req.params.id, req.user._id);
  if (!original) return res.status(404).json({ message: "Resume not found" });
  const clone = original.toObject();
  delete clone._id;
  delete clone.createdAt;
  delete clone.updatedAt;
  clone.title = `${clone.title} (copy)`;
  const resume = await Resume.create({ ...clone, user: req.user._id });
  res.status(201).json({ resume });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!resume) return res.status(404).json({ message: "Resume not found" });
  res.json({ message: "Resume deleted" });
});
