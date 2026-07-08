import './config/env'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mockmate'

// Minimal inline schema for seed data. Once real models land in src/models,
// import and use them here instead of this local schema.
const questionSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
)

const Question = mongoose.models.Question ?? mongoose.model('Question', questionSchema)

const questions = [
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'Explain the difference between let, const, and var in JavaScript.' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: "How does React's virtual DOM work, and why is it useful?" },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'What are the trade-offs between SQL and NoSQL databases?' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'Design a rate limiter for a public REST API. Walk through your approach.' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How would you secure a JWT-based authentication flow end to end?' },
  { role: 'Behavioral', difficulty: 'easy', prompt: 'Tell me about a time you resolved a conflict with a teammate.' },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log(`Connected: ${MONGODB_URI}`)

  await Question.deleteMany({})
  const inserted = await Question.insertMany(questions)
  console.log(`Seeded ${inserted.length} interview questions.`)

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(async (err) => {
  console.error('Seed failed:', err)
  process.exitCode = 1
  await mongoose.disconnect()
})
