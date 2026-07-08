import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSite, useTheme } from './lib/hooks'
import { ScrollProgress, Preloader, BackToTop, ErrorBoundary } from './components/ui'
import PublicSite from './components/PublicSite'

// Admin code is only loaded when someone actually visits /admin (keeps the public bundle small).
const Login = lazy(() => import('./components/Admin').then((m) => ({ default: m.Login })))
const Dashboard = lazy(() => import('./components/Admin').then((m) => ({ default: m.Dashboard })))

function RequireAuth({ children }) {
  return localStorage.getItem('portfolio_admin_token') ? children : <Navigate to="/admin" />
}

const AdminFallback = () => <div className="admin-loading">Loading dashboard…</div>

export default function CmsApp() {
  const { theme, toggle } = useTheme()
  const { site, loading } = useSite()

  return (
    <BrowserRouter>
      <Preloader mark={site?.siteSetting?.[0]?.data?.logoText || 'MZ'} />
      <ScrollProgress />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface-solid)',
            color: 'var(--text)',
            border: '1px solid var(--line-strong)',
            borderRadius: '14px',
          },
        }}
      />
      <ErrorBoundary>
        <Suspense fallback={<AdminFallback />}>
          <Routes>
            <Route path="/" element={<PublicSite site={site} loading={loading} theme={theme} toggleTheme={toggle} />} />
            <Route path="/admin" element={<Login theme={theme} toggleTheme={toggle} />} />
            <Route path="/admin/dashboard" element={<RequireAuth><Dashboard theme={theme} toggleTheme={toggle} /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <BackToTop />
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="notfound">
      <span className="nf-code gradient-text">404</span>
      <h1>Page not found</h1>
      <p>The page you’re looking for doesn’t exist or has moved.</p>
      <a className="btn primary" href="/">Back home</a>
    </div>
  )
}
