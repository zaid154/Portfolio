# MERN Portfolio CMS

Modern full-stack developer portfolio with a secure admin dashboard. It works like a small WordPress-style CMS: log in, edit content, upload images/resume, manage messages, and publish changes without touching source code.

> **Developer reference:** every endpoint, function, and component is documented in **[FUNCTIONS.md](FUNCTIONS.md)** (with usage examples).

## Features

- React + Vite public portfolio — **100% CMS-driven, zero hardcoded copy**: every heading, nav label, button, form label/placeholder and toast is editable content (empty DB → empty sections), with **dark/light mode** and scroll reveals
- Admin login with JWT (Bearer), bcrypt password hashing, and protected dashboard routes
- Self-service **Account** page — the admin can update their name/email and change their password from the dashboard (no `.env` edit or re-seed)
- Full CRUD for **17 content types** — Hero, Stats, About, Skills, Projects, Experience, Education, Certificates, Blogs, Services, Testimonials, Contact Info, Resume, Social Links, SEO, Section Titles, Site Settings
- Admin dashboard with three sections — **Overview** (stats + recent messages), **Content** (per-type editor), **Messages** (click-to-open inbox)
- Power tools: image previews, reorder, duplicate, publish/draft toggle, search, confirm-delete, unsaved-changes guard, theme toggle
- Contact form saves to MongoDB + dashboard inbox (rate limiting + honeypot spam protection)
- **Cloudinary** uploads (via Multer) for images and resume PDFs
- Express REST API with Mongoose, Zod validation, Helmet, CORS, rate limiting, NoSQL-injection sanitization, compression, and central error handling
- Seed command + idempotent migration scripts

## Tech Stack

- **Frontend:** React, React Router, Framer Motion, Lucide icons, React Hot Toast, Axios (Vite)
- **Backend:** Node.js, Express 5, MongoDB, Mongoose 9, JWT, bcrypt, Multer, Cloudinary, Zod
- **Deploy:** env-based config — backend on Render, frontend on Vercel (cross-origin, CORS-aware)

## Setup

1. **Install** (root + client + server):
   ```bash
   npm run install:all
   ```
2. **Env** — create one root `.env` and fill in your values:
   ```bash
   copy .env.example .env
   ```
   Set `MONGO_URI`, `JWT_SECRET`, admin creds, and `CLOUDINARY_*`. Leave `VITE_API_URL` **unset** for local dev (the Vite dev server proxies `/api` to the backend).
3. **Seed** the first admin + starter content:
   ```bash
   npm run seed
   ```
4. **Run** API + client:
   ```bash
   npm run dev
   ```

On start the terminal prints a clear banner with the actual **Backend**, **API**, and **Frontend** URLs and the MongoDB status:

Frontend `http://localhost:5173` · API `http://localhost:5000/api` · Admin `http://localhost:5173/admin`

> **Ports auto-resolve.** The backend prefers **5000** and the frontend prefers **5173**; if either port is busy, that service automatically uses the next free port and prints the real URL — a collision never stops the app from starting. In dev the client always reaches the API through the Vite `/api` proxy, so there is no CORS setup and no port to keep in sync.

### Admin login

After `npm run seed`, sign in at **`/admin`** (`http://localhost:5173/admin`) with the credentials from your `.env`:

| Field | Value |
|---|---|
| **Email** | `zaidm1323@gmail.com` &nbsp;(the `ADMIN_EMAIL` in `.env`) |
| **Password** | `ChangeMe123!` &nbsp;(the `ADMIN_PASSWORD` in `.env`) |

> **⚠ Change these after first login.** In the dashboard open **Account** (sidebar) to update your name/email and change your password directly — no `.env` edit or re-seed needed. New passwords must be at least 8 characters. Do not commit real production credentials.

## Scripts

```bash
npm run dev          # client + server together
npm run dev:client   # Vite only
npm run dev:server   # Express API only
npm run seed         # create admin + default CMS content (idempotent)
npm run build        # production frontend build
npm start            # production server (also serves the built client)
npm run lint         # ESLint the client
```

**One-off migrations** (from the `server/` folder — all idempotent):
```bash
node src/scripts/migrate-split-content.js       # legacy: split single `contents` -> per-type collections
node src/scripts/merge-singletons.js            # fold single-instance types into the shared `content` collection
node src/scripts/migrate-media-to-cloudinary.js # move local /images & /resume.pdf into Cloudinary, rewrite URLs
```

## Content model (hybrid collections)

Content types are stored in one of two ways, but the REST API is uniform — you always work by **`type`** string and never care which collection it lives in:

- **List-like types** get their own collection: `projects`, `skills`, `stats`, `socialLinks`
- **Single-instance types** share one **`content`** collection, tagged by a `type` field: hero, about, contactInfo, resume, seo, siteText, siteSetting, blog, certificate, service, testimonial, experience, education

This is all handled by `server/src/models/contentModels.js` (`modelForType`, `scopeForType`, `findAcrossModels`, …). See [FUNCTIONS.md §4](FUNCTIONS.md#4-content-model-registry-contentmodelsjs).

> **No hardcoded copy:** every visible string on the public site — section headings/eyebrows, **nav labels**, **contact-form labels & placeholders**, button text, the success toast, even the "Syncing…" banner — lives in the **Section Titles** (`siteText`) singleton and is edited from the dashboard. Components render only DB values; nothing user-facing is baked into the source (an empty field renders nothing, an empty section disappears). The browser-frame address bar on project cards shows only the real `liveUrl` (or the project title) — no fabricated domains.

## Cloudinary uploads

Dashboard image/PDF uploads go straight to Cloudinary. Set in `.env`:
```
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
CLOUDINARY_FOLDER=portfolio-cms
```
If these are missing, `POST /api/upload` returns **503** (the rest of the app still works).

> **PDF gotcha:** new Cloudinary accounts block PDF/ZIP delivery by default (URLs return **401** with `x-cld-error: deny or ACL failure`). Enable it once at **Cloudinary Console → Settings → Security → "Allow delivery of PDF and ZIP files"**.

## Theming (design tokens)

All colors are CSS custom properties in `client/src/index.css` — `:root` (dark) and `:root[data-theme='light']`. The palette is **Slate & Indigo**: a comfortable elevated dark (not near-black), an indigo-blue accent (`#5a63e0` dark / `#4850d8` light), and WCAG-AA/AAA contrast in both themes. Change the whole app's look by editing those two blocks.

The admin can also override the brand color at runtime via **Site Settings → Accent color** (`settings.accentColor`), which `PublicSite.jsx` applies to `--accent` on the public site.

## Environment values (root `.env`)

| Var | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas/local connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | admin token secret / expiry (default `7d`) |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin created by `npm run seed` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` / `_FOLDER` | dashboard uploads |
| `VITE_API_URL` | browser API URL. **Unset in dev** (Vite proxies `/api`). In production set it on the frontend host (Vercel) to the backend, e.g. `https://<render-service>.onrender.com/api` |
| `CLIENT_URL` | production frontend origin(s) allowed by CORS, comma-separated. Dev allows any localhost automatically; `*.vercel.app` is always allowed |
| `PORT` | preferred backend port (default `5000`; auto-falls-back if busy). Render injects its own `PORT` |
| `DNS_SERVERS` | *(optional)* comma-separated DNS resolvers (e.g. `8.8.8.8,1.1.1.1`) — auto-used if your machine's resolver can't do `mongodb+srv://` SRV lookups |

## Deployment (Render backend + Vercel frontend)

The API and the site deploy as two services with the frontend calling the backend cross-origin. The API's CORS allows the origins in `CLIENT_URL` plus any `*.vercel.app` host.

**Backend → Render** (config in `render.yaml`):
- Build `npm install --prefix server`, start `npm start`.
- Set in the Render dashboard: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLIENT_URL` = your Vercel production URL (e.g. `https://<project>.vercel.app`). `NODE_ENV=production` is already set.
- Run `npm run seed` once (Render Shell) to create the first admin + default content.

**Frontend → Vercel** (config in `client/vercel.json`):
- Set the Vercel project **Root Directory** to `client/` (build `npm run build`, output `dist` — both already in `vercel.json`).
- Set one env var: `VITE_API_URL` = `https://<your-render-service>.onrender.com/api` (baked in at build time).

After both deploy, the site loads data from the Render API, and CORS accepts the Vercel origin. If data doesn't load, check the browser console/network tab: a CORS error means `CLIENT_URL` on Render doesn't match the Vercel origin; a 404/`ERR_NETWORK` means `VITE_API_URL` on Vercel is wrong.

---

See **[FUNCTIONS.md](FUNCTIONS.md)** for the full API/function reference, and `SUGGESTIONS.md` for further improvements.
