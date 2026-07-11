// Barrel: keeps the `./components/Admin` import path stable (CmsApp lazy-loads
// Login + Dashboard from here). The actual code lives in ./admin/*.
export { Login, RequireAuth } from './admin/Login'
export { default as Dashboard } from './admin/Dashboard'
