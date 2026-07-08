# ATS Resume Builder & Analyzer

A full-stack **MERN** app to build professional resumes, score them against real job
descriptions with an ATS engine, get keyword suggestions, switch templates, and export a
clean, ATS-friendly PDF.

> Part of the RESUME projects collection · ⭐⭐⭐⭐⭐

## ✨ Features

- **Resume builder** — guided sections (personal, experience, education, skills, projects,
  certifications, languages) with a **live preview** and **auto-save**.
- **ATS score** — a heuristic engine scores your resume 0–100 against any job description:
  keyword match, section coverage, measurable impact, action verbs, contact info and length.
- **Keyword suggestions** — see the exact matched vs. missing keywords the job asks for.
- **Multiple templates** — Modern, Classic, Minimal and Elegant, each with an accent-colour picker.
- **PDF export** — one click prints a **text-based** PDF (stays parseable by real ATS software).
- **Authentication** — email/password with JWT + bcrypt; every resume is tied to your account.

## 🧱 Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, React Router, Framer Motion, Lucide, Axios, React Hot Toast |
| Backend  | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Zod, Helmet, CORS |
| Auth     | JWT (Bearer token) + hashed passwords |
| Export   | Browser print-to-PDF (text stays selectable → ATS-friendly) |

## 📁 Structure

```
2. ATS Resume Builder & Analyzer/
├── server/                 # Express + MongoDB API
│   └── src/
│       ├── config/         # db connection
│       ├── models/         # User, Resume
│       ├── middleware/     # auth, validation, errors
│       ├── controllers/    # auth, resume, ats
│       ├── services/       # atsAnalyzer (scoring engine)
│       ├── routes/         # /auth /resumes /ats
│       └── index.js
└── client/                 # React + Vite SPA
    └── src/
        ├── context/        # AuthContext
        ├── api/            # axios client
        ├── components/     # navbar, builder blocks, templates, score ring
        ├── pages/          # Landing, Login, Register, Dashboard, Builder, Analyzer
        └── lib/            # score helpers
```

## 🚀 Getting started

**Prerequisites:** Node 18+ and a MongoDB instance (local or MongoDB Atlas).

1. **Install everything** (root + server + client):

   ```bash
   npm run install:all
   ```

2. **Configure the server** — copy the env file and fill it in:

   ```bash
   cp server/.env.example server/.env
   ```

   | Var          | Example |
   |--------------|---------|
   | `PORT`       | `5001` |
   | `MONGO_URI`  | `mongodb://127.0.0.1:27017/ats_resume` |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES`| `7d` |
   | `CLIENT_URL` | `http://localhost:5173` |

3. **Run both apps together:**

   ```bash
   npm run dev
   ```

   - Client → http://localhost:5173
   - API    → http://localhost:5001/api/health

   (In dev, Vite proxies `/api` to the server, so no client env is needed.)

## 🔌 API

| Method | Route                       | Auth | Purpose |
|--------|-----------------------------|------|---------|
| POST   | `/api/auth/register`        | –    | Create account, returns JWT |
| POST   | `/api/auth/login`           | –    | Login, returns JWT |
| GET    | `/api/auth/me`              | ✓    | Current user |
| GET    | `/api/resumes`              | ✓    | List your resumes |
| POST   | `/api/resumes`              | ✓    | Create resume |
| GET    | `/api/resumes/:id`          | ✓    | Get one resume |
| PUT    | `/api/resumes/:id`          | ✓    | Update resume (auto-save) |
| POST   | `/api/resumes/:id/duplicate`| ✓    | Duplicate resume |
| DELETE | `/api/resumes/:id`          | ✓    | Delete resume |
| POST   | `/api/ats/analyze`          | ✓    | `{ resumeId, jobDescription }` → score, breakdown, keywords, suggestions |

## 🧠 How the ATS score works

The analyzer (`server/src/services/atsAnalyzer.js`) needs **no external AI**. It:

1. Flattens the structured resume into text.
2. Extracts the most frequent meaningful keywords from the job description (stop-words removed).
3. Computes weighted sub-scores — keyword match (40%), section coverage (15%),
   measurable impact (15%), action verbs (12%), contact info (10%), length (8%).
4. Returns an overall 0–100 score, a per-category breakdown, matched/missing keywords,
   and prioritized suggestions.

## 📦 Production build

```bash
npm run build            # builds client to client/dist
npm start                # runs the API (serve client/dist behind any static host or reverse proxy)
```

## 📝 Notes

- PDF export uses the browser's print-to-PDF so the output text stays selectable — this is
  what keeps it parseable by real Applicant Tracking Systems (image-based PDFs score poorly).
- Dates are free-text (e.g. `Jan 2022`) so you control the exact formatting shown.
