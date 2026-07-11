import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { UserCog, KeyRound, Save, Info } from 'lucide-react'
import { api, getErrorMessage } from '../../lib/api'

export default function Account() {
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  // Prefill name/email from the signed-in admin.
  useEffect(() => {
    let alive = true
    api.get('/auth/me')
      .then(({ data }) => { if (alive) setProfile({ name: data.user.name || '', email: data.user.email || '' }) })
      .catch((err) => toast.error(getErrorMessage(err)))
    return () => { alive = false }
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.put('/auth/profile', { name: profile.name, email: profile.email })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (pw.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (pw.newPassword !== pw.confirm) { toast.error('New passwords do not match'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      toast.success('Password changed')
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="account">
      <form className="panel glass" onSubmit={saveProfile}>
        <div className="panel-head">
          <div className="panel-title-wrap">
            <h2><UserCog size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />Profile</h2>
            <p className="section-desc"><Info size={13} /> The name and email you sign in with.</p>
          </div>
          <button type="submit" className="btn primary compact" disabled={savingProfile}>
            <Save size={15} /> {savingProfile ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div className="fields">
          <label>
            <span className="field-label">Name</span>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" required minLength={2} />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="admin@example.com" required />
          </label>
        </div>
      </form>

      <form className="panel glass" onSubmit={savePassword}>
        <div className="panel-head">
          <div className="panel-title-wrap">
            <h2><KeyRound size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />Change password</h2>
            <p className="section-desc"><Info size={13} /> Enter your current password, then a new one (min 8 characters).</p>
          </div>
          <button type="submit" className="btn primary compact" disabled={savingPw}>
            <Save size={15} /> {savingPw ? 'Saving…' : 'Update password'}
          </button>
        </div>
        <div className="fields">
          <label>
            <span className="field-label">Current password</span>
            <input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder="••••••••" required autoComplete="current-password" />
          </label>
          <label>
            <span className="field-label">New password</span>
            <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
          </label>
          <label>
            <span className="field-label">Confirm new password</span>
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Re-enter new password" required minLength={8} autoComplete="new-password" />
          </label>
        </div>
      </form>
    </div>
  )
}
