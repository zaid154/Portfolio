import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { LayoutDashboard, ArrowLeft, Sun, Moon } from 'lucide-react'
import { api, getErrorMessage } from '../../lib/api'
import { TOKEN_KEY } from './constants'

export function Login({ theme, toggleTheme }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem(TOKEN_KEY, data.token)
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (localStorage.getItem(TOKEN_KEY)) return <Navigate to="/admin/dashboard" />

  return (
    <div className="auth-page">
      {toggleTheme && (
        <button className="icon-btn auth-theme" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}
      <motion.form className="auth-card glass" onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="auth-mark"><LayoutDashboard size={18} /> Admin CMS</span>
        <h1>Manage your <span className="gradient-text">portfolio</span></h1>
        <p className="sub">Sign in to edit content, uploads, and messages.</p>
        <div className="field"><label>Email</label><input type="email" required placeholder="admin@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Password</label><input type="password" required minLength={8} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        <div className="auth-back"><Link to="/"><ArrowLeft size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to site</Link></div>
      </motion.form>
    </div>
  )
}

export function RequireAuth({ children }) {
  if (!localStorage.getItem(TOKEN_KEY)) return <Navigate to="/admin" />
  return children
}
