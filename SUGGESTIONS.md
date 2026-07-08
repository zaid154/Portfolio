# Project Review — Bugs, Errors & Improvement Suggestions

**Project:** Mohd Zaid — MERN Portfolio CMS
**Status:** ✅ Build passes · ✅ Admin CRUD verified · ✅ Code-split (admin is a separate chunk) · ✅ ESLint 0 errors · ✅ 0 npm vulnerabilities

Severity: 🔴 High · 🟠 Medium · 🟢 Low · Status: ✅ done · ⬜ open

---

## 1. Bugs & Correctness

- ✅ 🔴 **1.1 Render deploy now builds the frontend** — `render.yaml` installs all workspaces + `npm run build`, and `VITE_API_URL=/api` so the single service serves site + API.
- ✅ 🟠 **1.2 Draft-only sections no longer show demo content** — `useSite` now treats the DB as source of truth once it has any content (fallback only for an empty/unseeded DB).
- ✅ 🟠 **1.3 React ErrorBoundary added** — a component crash shows a friendly reload screen instead of a blank page.
- ✅ 🟢 **1.4 `Heading` gradient helper** now ignores unbalanced `*`.
- ✅ 🟢 **1.5 `accentColor`** also sets `--accent-soft` via `color-mix`, so soft tints follow the chosen color.
- ✅ 🟢 **1.6 `gh-pages` deploy script removed** from `client/package.json`.

---

## 2. Security

- ✅ 🔴 **2.1 Cloudinary upgraded to v2** — the high-severity argument-injection advisory is resolved (`npm audit` = 0 vulnerabilities).
- ✅ 🟠 **2.3 Contact form spam protection** — dedicated rate limit (8/hour) + a hidden honeypot field that silently drops bots.
- ✅ 🟠 **2.4 Login brute-force protection** — dedicated rate limit (15 attempts / 15 min).
- ✅ 🟢 **2.5 Config guard** — server refuses to boot with the insecure default `JWT_SECRET` and warns on missing Cloudinary keys / short secret in prod. **Still to do:** change the seeded admin password from `ChangeMe123!`.
- ⬜ 🟠 **2.2 JWT in `localStorage`** (XSS token-theft risk). Optional hardening: move the token to an `httpOnly`/`Secure`/`SameSite` cookie. *(Deferred — larger refactor.)*

---

## 3. Performance

- ✅ 🟠 **3.1 Admin bundle is code-split** — `Login`/`Dashboard` are `React.lazy()`-loaded, so public visitors no longer download the CMS code (admin is a separate ~21 KB chunk).
- ✅ 🟢 **3.4 Preloader shows once per session** (`sessionStorage`).
- ⬜ 🟢 **3.2 Image optimization** — add intrinsic `width`/`height` (reduce CLS) and Cloudinary `f_auto,q_auto` + sized variants.
- ⬜ 🟢 **3.3 Bulk reorder endpoint** — `move()` still does N writes; a `PATCH /reorder` (`bulkWrite`) would be cheaper.

---

## 4. Accessibility

- ✅ 🟠 **4.1 Modals close on Esc** (project/blog modal + confirm dialog) and lock body scroll; delete/search controls have aria-labels.
- ⬜ 🟢 **4.2 Contrast** — verify `--muted` text meets WCAG AA, especially in light mode.
- ⬜ 🟢 **4.3 Reduced motion** — CSS animations honor `prefers-reduced-motion`; the few Framer Motion *loops* (floating chips) still run — gate them with `useReducedMotion()`.
- ⬜ 🟢 **4.4 Focus trap** inside modals (return focus on close).

---

## 5. SEO

- ✅ 🟢 **5.2 `robots.txt` + `sitemap.xml`** added in `client/public` (update the domain after deploying).
- ✅ 🟢 **5.3 JSON-LD** `Person` schema added to `index.html`.
- ⬜ 🟠 **5.1 No SSR/pre-render** — meta is set via JS; for best ranking consider Vite SSG or Next.js later. *(Deferred — architectural.)*

---

## 6. Code Quality & Maintainability

- ✅ 🟠 **6.2 ESLint added** (flat config + react/react-hooks/react-refresh) with a `lint` script — 0 errors. It already catches real issues (e.g. missing imports).
- ✅ 🟢 **6.5 Env validation** expanded (`assertEnv` checks the default secret + warns on missing prod vars).
- ⬜ 🟠 **6.1 No tests** — add backend route tests (supertest) + a few React smoke tests (Vitest). *(Deferred.)*
- ⬜ 🟢 **6.3 CI** — a GitHub Action: install → lint → build. *(Deferred.)*
- ⬜ 🟢 **6.6 Structured logging** (pino) instead of `console.log`. *(Deferred.)*

---

## 7. Features / UX (open, nice-to-have)

- ⬜ Password reset / change-password in admin
- ⬜ Token refresh ("stay signed in")
- ⬜ Bulk actions (multi-select publish/delete)
- ⬜ Media library (reuse uploaded images)
- ⬜ Email/webhook notification on new contact message
- ⬜ Real `/blog/:slug` pages (better sharing + SEO) — currently a modal reader
- ⬜ Branded favicon set + a real Open Graph share image
- ✅ Proper **404 page** (router no longer blindly redirects everything to `/`)

---

## 8. Remaining quick wins (open)

1. 🟢 Change the seeded admin password from `ChangeMe123!`.
2. 🟠 Add a minimal test + GitHub Actions CI.
3. 🟢 Add image dimensions + Cloudinary auto-format for faster loads.
4. 🟢 Gate Framer Motion loops on `prefers-reduced-motion`.

---

*Everything in sections 1–6 marked ✅ is implemented and verified. Remaining ⬜ items are deferred (larger or lower priority) — say the word and I'll take any of them.*
