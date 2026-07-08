# MockMate AI

> Practice interviews with an AI interviewer and get instant, actionable feedback.

A single project that runs a **React (Vite + TypeScript) client** and an
**Express (TypeScript + Google Gemini) server** together, from **one command**,
using **one shared `.env`**.

---

## Prerequisites

| Tool               | Version         | Notes                                                        |
| ------------------ | --------------- | ------------------------------------------------------------ |
| **Node.js**        | ≥ 18            | Required by Vite 6. Check with `node -v`.                    |
| **npm**            | ≥ 9             | Ships with Node 18+.                                          |
| **MongoDB**        | any recent      | Local (`mongod`) or a MongoDB Atlas URI. Needed for seeding + DB features. |
| **Gemini API key** | —               | Free key from [Google AI Studio](https://aistudio.google.com/app/apikey). |

---

## Quick start

```bash
cd 01-ai-mock-interview

npm run setup          # 1) install root + client + server deps
cp .env.example .env   # 2) create your env (fill in the secrets)
npm run dev            # 3) run client + server together
```

- Client → http://localhost:5173
- Server → http://localhost:5000  (health check: `GET /api/health`)

The Vite dev server proxies `/api` to the backend, so the client can call
`/api/...` directly with no CORS setup in development.

---

## One shared environment

There is a **single `.env`** at the project root — both apps read it:

- The **server** loads it via [`server/src/config/env.ts`](server/src/config/env.ts)
  (`dotenv`, pointed at `../../../.env`).
- The **client** loads it via Vite's `envDir: '..'` in
  [`client/vite.config.ts`](client/vite.config.ts).

> **Security:** Vite only exposes variables prefixed with `VITE_` to the browser
> bundle. Server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `MONGODB_URI`) are
> **not** shipped to the client even though they live in the same file.

| Variable         | Used by | Purpose                                  |
| ---------------- | ------- | ---------------------------------------- |
| `PORT`           | server  | API port (default 5000)                  |
| `NODE_ENV`       | server  | `development` / `production`             |
| `CLIENT_URL`     | server  | CORS origin for the frontend             |
| `MONGODB_URI`    | server  | MongoDB connection string                |
| `JWT_SECRET`     | server  | Signing secret for auth tokens           |
| `JWT_EXPIRES_IN` | server  | Token lifetime (e.g. `7d`)               |
| `GEMINI_API_KEY` | server  | Google Gemini API key                    |
| `VITE_API_URL`   | client  | Base URL of the API (browser-exposed)    |

---

## Commands

All commands are run from the project root:

| Command           | What it does                                             |
| ----------------- | ------------------------------------------------------- |
| `npm run setup`   | Install deps for root **+ client + server** in one go   |
| `npm run dev`     | Run client and server together (via `concurrently`)     |
| `npm run dev:client` | Run only the client                                  |
| `npm run dev:server` | Run only the server                                  |
| `npm run build`   | Build server (`tsc`) then client (`vite build`)         |
| `npm run start`   | Start the built server                                  |
| `npm run seed`    | Seed the database with sample interview questions       |

---

## Seeding the database

Make sure `MONGODB_URI` in `.env` points at a running MongoDB, then:

```bash
npm run seed
```

This runs [`server/src/seed.ts`](server/src/seed.ts), which connects to MongoDB,
clears the `questions` collection, and inserts a small set of sample interview
questions (Frontend / Backend / Full Stack / Behavioral). Use it as the template
for seeding real data as models are added under `server/src/models`.

---

## Project structure

```
01-ai-mock-interview/
├── .env.example            # single shared env for client + server
├── package.json            # root orchestrator — runs both with one command
│
├── client/                 # React + Vite + TypeScript frontend
│   ├── public/             # static assets (favicon, etc.)
│   ├── src/
│   │   ├── components/     # reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # custom hooks
│   │   ├── lib/            # API client, helpers
│   │   ├── pages/          # route-level pages
│   │   ├── App.tsx         # root component (placeholder)
│   │   └── main.tsx        # entry point
│   ├── index.html
│   ├── vite.config.ts      # envDir: '..' → uses the shared root .env
│   ├── tsconfig.json
│   └── package.json
│
└── server/                 # Express + TypeScript + Gemini backend
    ├── src/
    │   ├── config/
    │   │   └── env.ts      # loads the shared root .env
    │   ├── middleware/     # auth, error handling, validation
    │   ├── models/         # Mongoose models
    │   ├── routes/         # Express routers
    │   ├── services/       # business logic (Gemini, scoring, …)
    │   ├── types/          # shared TypeScript types
    │   ├── utils/          # helpers
    │   ├── app.ts          # Express app setup + /api/health
    │   ├── index.ts        # entry point
    │   └── seed.ts         # database seed script
    ├── tsconfig.json
    └── package.json
```

> **Status:** scaffold. Structure, configs, the shared-env wiring, the
> one-command runner, and the seed script are in place. Feature code (auth,
> resume upload, the Gemini interview flow, feedback/scoring) is **not**
> implemented yet — the `src/*` feature subfolders are intentionally empty.

---

## Roadmap

What's done vs. what's left to build:

- [x] Project structure + configs (client, server, root)
- [x] Single shared `.env` wiring (client + server)
- [x] One-command dev runner (`concurrently`)
- [x] Database seed script
- [ ] Auth — register / login with JWT (`routes/`, `models/User`, `middleware/auth`)
- [ ] Resume upload + parsing (Multer + pdf-parse)
- [ ] AI interview flow (Gemini question generation in `services/`)
- [ ] Answer scoring + feedback
- [ ] Frontend pages + UI (`client/src/pages`, `components`)

---

## Troubleshooting

| Symptom                                    | Fix                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `EADDRINUSE` / port already in use         | Change `PORT` (server) or Vite `server.port`, or stop whatever is using 5000 / 5173. |
| `MongooseServerSelectionError` on seed     | MongoDB isn't running or `MONGODB_URI` is wrong. Start `mongod` or fix the URI.      |
| `process.env.X` is `undefined`             | No `.env` at the project root. Run `cp .env.example .env` and fill it in.            |
| Client calls fail / 404 on `/api/...`      | Server not running, or `VITE_API_URL` is wrong. Ensure the server is up on 5000.     |
| `GEMINI_API_KEY` errors                    | Key missing/invalid. Get one from Google AI Studio and set it in `.env`.             |
| Env change not picked up                   | Restart `npm run dev` — env is read at startup, not hot-reloaded.                    |

---

## Tech stack

- **Client:** React 18, Vite 6, TypeScript, React Router, Framer Motion, Recharts, Axios, react-hot-toast, lucide-react
- **Server:** Express, TypeScript, MongoDB (Mongoose), JWT auth, Multer + pdf-parse (resume upload), Google Gemini, Zod
- **Tooling:** concurrently (one-command dev), tsx (server dev/seed)
