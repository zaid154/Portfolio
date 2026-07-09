# MERN Portfolio CMS

Modern full-stack developer portfolio with a secure admin dashboard. It works like a small WordPress-style CMS: log in, edit content, upload images/resume, manage messages, and publish changes without touching source code.

> **Developer reference:** every endpoint, function, and component is documented in **[FUNCTIONS.md](FUNCTIONS.md)** (with usage examples).

## Features

- React + Vite public portfolio — **100% CMS-driven, zero hardcoded copy**: every heading, nav label, button, form label/placeholder and toast is editable content (empty DB → empty sections), with **dark/light mode** and scroll reveals
- Admin login with JWT (Bearer), bcrypt password hashing, and protected dashboard routes
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
- **Deploy:** env-based config, Render-ready single-service (server serves the built client)

## Setup

1. **Install** (root + client + server):
   ```bash
   npm run install:all
   ```
2. **Env** — create one root `.env` and fill in your values:
   ```bash
   copy .env.example .env
   ```
   Set `MONGO_URI`, `JWT_SECRET`, admin creds, `CLOUDINARY_*`, `CLIENT_URL`, `VITE_API_URL`.
3. **Seed** the first admin + starter content:
   ```bash
   npm run seed
   ```
4. **Run** API + client:
   ```bash
   npm run dev
   ```

Frontend `http://localhost:5060` · API `http://localhost:5050/api/health` · Admin `http://localhost:5060/admin`

> **Local ports:** this repo's `.env` runs the API on **5050** and the client on **5060** — moved off the conventional 5000/5173 to coexist with another local dev server occupying those ports. To change them, edit `PORT` / `VITE_API_URL` / `CLIENT_URL` in `.env` and `server.port` in `client/vite.config.js` (keep `CLIENT_URL` in sync with the client port, since CORS only allows that origin).

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
| `VITE_API_URL` | browser API URL (this repo: `http://localhost:5050/api` locally; `/api` on single-service deploy) |
| `CLIENT_URL` | frontend origin allowed by CORS (this repo: `http://localhost:5060`) |
| `PORT` | server port (code default `5000`; this repo's `.env` uses `5050`) |
| `DNS_SERVERS` | *(optional)* comma-separated DNS resolvers (e.g. `8.8.8.8,1.1.1.1`) — auto-used if your machine's resolver can't do `mongodb+srv://` SRV lookups |

## Deployment

Single-service deploy (recommended): the Node server serves both the API and the built `client/dist` on one port. `render.yaml` installs all workspaces, runs `npm run build`, and starts the server. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_*` in the environment, and `VITE_API_URL=/api`. Run `npm run seed` once in production to create the first admin and default content.

---

See **[FUNCTIONS.md](FUNCTIONS.md)** for the full API/function reference, and `SUGGESTIONS.md` for further improvements.
