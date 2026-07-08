# Functions & API Reference

A developer reference for the **MERN Portfolio CMS** — every developer-facing function, endpoint, module, and component, with a short "what it does" and a "how to use" example.

> Paths are relative to the project root (`email-outbox/abc/`). Server runs on `:5000`, client (Vite) on `:5173`.

**Contents**

1. [HTTP API — endpoints](#1-http-api--endpoints)
2. [Server middleware](#2-server-middleware)
3. [Config & services](#3-config--services)
4. [Content model registry (`contentModels.js`)](#4-content-model-registry-contentmodelsjs)
5. [Mongoose models](#5-mongoose-models)
6. [Utils](#6-utils)
7. [Scripts (seed + migrations)](#7-scripts-seed--migrations)
8. [Frontend lib & helpers](#8-frontend-lib--helpers)
9. [Frontend components](#9-frontend-components)

---

## 1. HTTP API — endpoints

All routes are mounted under `/api/*` (see `server/src/app.js`). Admin routes require `Authorization: Bearer <token>` (from `POST /api/auth/login`). Errors funnel through the central handler: **ZodError → 422**, **duplicate key → 409**, **CastError → 404**.

### Auth — `server/src/routes/auth.routes.js`

| Endpoint | Auth | Body | Returns |
|---|---|---|---|
| `POST /api/auth/login` | none (15/15min) | `{ email, password(min 8) }` | `{ success, token, user }` · 401 on bad creds |
| `GET /api/auth/me` | Bearer | — | `{ success, user }` · 401 if token invalid |

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@site.com","password":"secret123"}'
# -> { token }  ; then send:  Authorization: Bearer <token>
```

### Content — `server/src/routes/content.routes.js` (all Bearer-guarded)

| Endpoint | Body | Notes |
|---|---|---|
| `GET /api/admin/content?type=<type>` | — | With `type`: that collection sorted `{order,createdAt:-1}`. Without: **every** collection unioned. Unknown type → `{ items: [] }`. |
| `POST /api/admin/content` | `{ type, title, slug?, status?, order?, featured?, data? }` | Routes to the right collection by `type`; auto-generates a collision-free slug. 400 on unknown type. |
| `PUT /api/admin/content/:id` | partial body (`type` ignored) | Found by id across all collections; `type` immutable; slug re-generated if title/slug changes. |
| `DELETE /api/admin/content/:id` | — | Located across every collection. |

Valid types: `project skill stat socialLink` (own collections) + `hero about contactInfo resume seo siteText siteSetting blog certificate service testimonial experience education` (shared `content` collection).

```bash
# create a project
curl -X POST http://localhost:5000/api/admin/content \
  -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' \
  -d '{"type":"project","title":"My App","data":{"liveUrl":"https://x.com","stack":["React"]}}'
```

### Messages — `server/src/routes/message.routes.js` (all Bearer-guarded)

| Endpoint | Body | Returns |
|---|---|---|
| `GET /api/admin/messages` | — | `{ items }` newest first |
| `PUT /api/admin/messages/:id` | `{ status: 'new'|'read'|'archived' }` | `{ success, item }` |
| `DELETE /api/admin/messages/:id` | — | `{ success: true }` |

### Upload — `server/src/routes/upload.routes.js` (Bearer)

`POST /api/upload` — `multipart/form-data` field **`file`** (image or PDF, max 8 MB) → uploads to Cloudinary, returns `{ success, file: { url, publicId, type } }`. Returns **503** if `CLOUDINARY_*` env is not set.

```js
const fd = new FormData(); fd.append('file', file)
const { data } = await api.post('/upload', fd)   // -> data.file.url (Cloudinary URL)
```

### Public — `server/src/routes/public.routes.js` (no auth)

| Endpoint | Body | Returns |
|---|---|---|
| `GET /api/public/site` | — | `{ site: { [type]: [items] } }` — every **published** item grouped by type (the shape the portfolio renders from). |
| `POST /api/public/contact` | `{ name, email, subject, message, website? }` (8/hour) | `{ success, id }`. `website` is a honeypot — if filled (bot), returns success but saves nothing. |

```bash
curl http://localhost:5000/api/public/site   # -> { site: { hero:[...], project:[...] } }
```

---

## 2. Server middleware — `server/src/middleware/`

| Function | File | What it does / how to use |
|---|---|---|
| `protect` | `auth.js` | JWT Bearer guard → attaches `req.user`. `router.use(protect)` (whole router) or `router.get('/me', protect, handler)`. Throws 401 if missing/expired. |
| `validate(schema)` | `validate.js` | Zod validator for `{ body, params, query }`; merges parsed values back (Express-5-safe). `router.post('/login', validate(loginSchema), handler)`. Schemas in `validators/schemas.js`. |
| `sanitize` | `sanitize.js` | NoSQL-injection defense: recursively strips keys starting with `$` or containing `.` from body/params/query. Applied globally in `app.js`. |
| `errorHandler` / `notFound` | `error.js` | Central error funnel + 404 catch-all. Registered **last**: `app.use(notFound); app.use(errorHandler)`. Hides stack traces in production. |
| rate limiters | `app.js` | Global 300/15min + `strict()` on `/api/auth/login` (15/15min) and `/api/public/contact` (8/60min). Over-limit → 429. |
| `ensureCloudinary` / `uploadSingle` | `upload.routes.js` | 503 if Cloudinary keys missing; wraps multer/Cloudinary errors into clean 400s. |

---

## 3. Config & services — `server/src/config/`

### `env` + `assertEnv` — `env.js`

```js
import { assertEnv, env } from './config/env.js'
// env = { nodeEnv, port, mongoUri, jwtSecret, jwtExpiresIn, clientUrl,
//         cloudinary: { cloudName, apiKey, apiSecret, folder } }
assertEnv()          // throws if MONGO_URI/JWT_SECRET missing or secret is the insecure default;
                     // warns (non-fatal) on short prod secret / missing Cloudinary keys
```
`dotenv` loads both `./.env` and `../.env`. Every script/boot starts with `assertEnv()`.

### `connectDb` — `db.js`

```js
import { connectDb } from './config/db.js'
await connectDb()    // runs configureDns(), sets strictQuery, then mongoose.connect(env.mongoUri)
```

### `configureDns` — `dns.js`

One-shot, idempotent DNS fixup so `mongodb+srv://` SRV lookups work on machines whose resolver is a dead loopback. Honors `DNS_SERVERS=8.8.8.8,1.1.1.1` if set; otherwise falls back to public resolvers only when the OS resolver is loopback/none. **You don't call it directly — `connectDb()` calls it.**

### Cloudinary — `cloudinary.js`

```js
import { upload, cloudinary } from './config/cloudinary.js'
// upload = multer + CloudinaryStorage (8MB, image or raw-for-pdf); use upload.single('file')
// cloudinary = the configured v2 SDK for direct calls:
await cloudinary.uploader.upload(remoteUrl, { folder: env.cloudinary.folder })
await cloudinary.uploader.destroy(publicId)
```

---

## 4. Content model registry (`contentModels.js`)

The hybrid content layer. **List-like** types (`project skill stat socialLink`) each get their own collection; **single-instance** types share one `content` collection tagged by `type`. This module hides that so callers work purely by `type` string.

```js
import {
  modelForType, scopeForType, isKnownType, isShared,
  allModels, findAcrossModels,
  ALL_TYPES, STANDALONE_COLLECTIONS, SHARED_TYPES, SHARED_COLLECTION,
} from '../models/contentModels.js'
```

| Export | Signature | Use |
|---|---|---|
| `modelForType(type)` | `→ Model | null` | The Mongoose model for a type (standalone model, or the shared model). |
| `scopeForType(type)` | `→ { type } | {}` | Extra query filter — shared types **must** be filtered by `{ type }`. Spread into every query. |
| `isKnownType(type)` | `→ boolean` | Reject unknown `?type` / skip stray docs. |
| `isShared(type)` | `→ boolean` | True if the type lives in the shared `content` collection. |
| `allModels()` | `→ Model[]` (5) | Fan a query across the whole content layer. |
| `findAcrossModels(id)` | `→ Promise<{model,doc}|null>` | Locate a doc by id when the collection is unknown (update/delete). |
| `ALL_TYPES` | `string[]` (17) | Canonical type list — keep in sync with `client/src/lib/site.js`. |
| `STANDALONE_COLLECTIONS` | `{ project:'projects', ... }` | type → collection name for the standalone types. |
| `SHARED_TYPES` / `SHARED_COLLECTION` | `string[]` / `'content'` | The shared types and their collection. |

```js
// read a type (works whether standalone or shared):
const items = await modelForType(type).find({ ...scopeForType(type), status: 'published' }).sort({ order: 1 })

// update/delete by id across every collection:
const found = await findAcrossModels(req.params.id)
if (!found) throw new ApiError(404, 'Not found')
await found.model.updateOne({ _id: found.doc._id }, { $set: payload })
```

---

## 5. Mongoose models — `server/src/models/`

### `User` — `User.js`

`{ name, email(unique, lowercase), password(select:false), role:'admin' }`. Pre-save hook bcrypt-hashes the password (cost 12) on change. Instance method `comparePassword(candidate) → Promise<boolean>`.

```js
const user = await User.findOne({ email }).select('+password')   // password is select:false
if (!user || !(await user.comparePassword(password)))
  throw new ApiError(401, 'Invalid email or password')
await User.create({ name, email, password })                     // hook hashes automatically
```

### `Message` — `Message.js`

`{ name, email, subject, message, status:'new'|'read'|'archived', source:'website', timestamps }`.

```js
await Message.create({ name, email, subject, message })          // public contact form
const inbox = await Message.find().sort({ createdAt: -1 })        // admin inbox
```

---

## 6. Utils — `server/src/utils/`

| Helper | File | Use |
|---|---|---|
| `asyncHandler(fn)` | `asyncHandler.js` | Wrap an async route so rejections go to the error handler: `router.post('/x', asyncHandler(async (req,res)=>{...}))`. |
| `ApiError` | `apiError.js` | `throw new ApiError(401, 'Invalid email or password')` — carries an HTTP status the error middleware reads. |
| `signToken(user)` | `token.js` | `res.json({ token: signToken(user) })` — signs `{ id, role }` with `JWT_SECRET` / `JWT_EXPIRES_IN` (default `7d`). |

---

## 7. Scripts (seed + migrations) — `server/src/`

Run from the **server** folder (each boots `assertEnv()` → `connectDb()`, and DNS auto-fixes for Atlas). All are **idempotent / safe to re-run**.

| Script | Command | What it does |
|---|---|---|
| **Seed** | `npm run seed` (or `node src/seed.js`) | Creates the admin user + upserts ~30 demo content items + a demo message. Only inserts missing docs. Admin from `ADMIN_NAME/EMAIL/PASSWORD` env. |
| **Split content** | `node src/scripts/migrate-split-content.js` | Legacy: splits a single `contents` collection into one collection per type, then drops `contents`. No-ops if already migrated. |
| **Merge singletons** | `node src/scripts/merge-singletons.js` | Folds the single-instance per-type collections into the shared `content` collection (tagged by `type`), then drops the sources. Run **after** split. |
| **Media → Cloudinary** | `node src/scripts/migrate-media-to-cloudinary.js` | Finds local media paths (`/images/x.png`, `/resume.pdf`) in content `data`, uploads each to Cloudinary, rewrites the value to the hosted URL. Needs `CLOUDINARY_*` env. |

---

## 8. Frontend lib & helpers — `client/src/lib/`

### `api` + `getErrorMessage` — `api.js`

```js
import { api, getErrorMessage } from '../lib/api'
// api = axios instance (baseURL from VITE_API_URL || http://localhost:5000/api)
// - request:  adds Authorization: Bearer <localStorage 'portfolio_admin_token'>
// - response: on 401 clears token and (on /admin) redirects to /admin
const { data } = await api.get('/admin/content')
try { await api.post('/auth/login', form) } catch (e) { toast.error(getErrorMessage(e)) }
```

### Content helpers — `site.js`

| Export | Use |
|---|---|
| `contentTypes` | The 17-type schema (`{ key, label, singleton?, desc, fields }`) that drives the admin sidebar + editor fields. |
| `fallbackSite` | Rich default content (by type) so the public site looks complete before the DB loads. |
| `first(site, key)` | Safe first entry of a type: `first(site,'hero') → { title, data }` (never throws). |
| `text(site, key, fallback)` | Editable label from the `siteText` singleton: `text(site,'workEyebrow','Selected Work')`. |
| `asArray(value)` | Coerce to array — real array passes through, else splits comma text: `asArray(project.data.stack)`. |

---

## 9. Frontend components — `client/src/`

| Component | File | What it is |
|---|---|---|
| `CmsApp` | `CmsApp.jsx` | Root: router + chrome (Preloader, ScrollProgress, Toaster, ErrorBoundary). `/` → PublicSite, `/admin` → Login (lazy), `/admin/dashboard` → `<RequireAuth><Dashboard/></RequireAuth>`. |
| `RequireAuth` | `CmsApp.jsx` / `Admin.jsx` | Redirects to `/admin` if no admin token. |
| `Login` | `Admin.jsx` | Sign-in → stores JWT → navigates to dashboard. |
| `Dashboard` | `Admin.jsx` | Admin shell: sidebar (**Overview / Content / Messages**), loads content + messages, hosts the three views, unsaved-changes guard, reorder, publish toggle. |
| `Overview` | `Admin.jsx` | Landing: stat cards + 5 most-recent messages; cards deep-link into a view. |
| `Editor` | `Admin.jsx` | Content form built from the type's `fields`; multiline/comma fields, Cloudinary upload, image previews, save/duplicate/delete. |
| `MessageManager` | `Admin.jsx` | Inbox: searchable list → click-to-open modal (auto-marks read), status select, mailto reply, delete. |
| `PublicSite` | `PublicSite.jsx` | The whole public portfolio (Nav, Hero, Stats, Projects, Skills, Services, Timeline, Testimonials, Blog, Contact, Footer). Reads content via `first/text/asArray`; applies SEO meta + `settings.accentColor` → `--accent`. |

---

*Generated from the codebase. See [README.md](README.md) for setup, and the CSS design tokens in `client/src/index.css` (`:root` dark + `:root[data-theme='light']`).*
