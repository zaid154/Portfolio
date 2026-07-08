import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    grade: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    link: String,
    tech: { type: [String], default: [] },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: String,
    issuer: String,
    date: String,
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled Resume", trim: true },
    template: {
      type: String,
      enum: ["modern", "classic", "minimal", "elegant"],
      default: "modern",
    },
    accent: { type: String, default: "#2563eb" },
    personal: {
      fullName: { type: String, default: "" },
      jobTitle: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      website: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    lastScore: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);
