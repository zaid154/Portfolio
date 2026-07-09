import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  LayoutDashboard, LogOut, Mail, Menu, Plus, Save, Search, Trash2, Upload, X,
  BarChart3, FileStack, ArrowLeft, Home, User, Code2, FolderGit2, Briefcase,
  GraduationCap, Award, PenLine, LayoutGrid, Quote, FileText, Share2, Settings, Info,
  Sun, Moon, Copy, ChevronUp, ChevronDown, ExternalLink, Eye, EyeOff, AlertTriangle, Type,
} from 'lucide-react'
import { api, getErrorMessage } from '../lib/api'
import { contentTypes } from '../lib/contentTypes'

const TOKEN_KEY = 'portfolio_admin_token'
const MULTILINE = ['description', 'summary', 'content', 'quote', 'highlights', 'points', 'skills', 'stack', 'workSubtitle', 'contactSubtitle']
const UPLOADABLE = ['image', 'coverImage', 'avatar', 'url', 'logoImage']
const IMAGE_FIELDS = ['image', 'coverImage', 'avatar', 'logoImage']

const TYPE_ICONS = {
  hero: Home, stat: BarChart3, about: User, skill: Code2, project: FolderGit2,
  experience: Briefcase, education: GraduationCap, certificate: Award, blog: PenLine,
  service: LayoutGrid, testimonial: Quote, contactInfo: Mail, resume: FileText,
  socialLink: Share2, seo: Search, siteText: Type, siteSetting: Settings,
}

// Where each section lives on the public site, for the "view on site" links.
const TYPE_TO_ANCHOR = {
  hero: 'home', stat: 'home', about: 'about', skill: 'skills', project: 'work',
  experience: 'about', education: 'about', certificate: 'about', blog: 'blog',
  service: 'services', testimonial: '', contactInfo: 'contact', resume: 'home',
  socialLink: 'contact', seo: '', siteText: 'work', siteSetting: 'home',
}

const FIELD_META = {
  badge: { label: 'Availability badge', hint: 'e.g. Available for freelance & full-time' },
  eyebrow: { label: 'Eyebrow', hint: 'Small label shown above the headline' },
  headline: { label: 'Headline', hint: 'Wrap part in *asterisks* to gradient-highlight it' },
  roles: { label: 'Rotating roles', hint: 'Comma separated — Full Stack Developer, React Engineer' },
  description: { label: 'Description' },
  primaryCta: { label: 'Primary button text', hint: 'e.g. View My Work' },
  secondaryCta: { label: 'Secondary button text', hint: 'e.g. Get in Touch (links to Contact)' },
  floatOne: { label: 'Floating badge 1', hint: 'e.g. Clean Code' },
  floatTwo: { label: 'Floating badge 2', hint: 'e.g. Fast Delivery' },
  image: { label: 'Image', hint: 'Upload a file or paste an image URL' },
  value: { label: 'Number', hint: 'e.g. 9+ or 100%' },
  label: { label: 'Label', hint: 'e.g. Projects Shipped' },
  summary: { label: 'Summary' },
  highlights: { label: 'Highlight points', hint: 'Comma separated (shown as ticks)' },
  level: { label: 'Level %', hint: 'A number 0–100 for the progress bar' },
  skills: { label: 'Skills', hint: 'Comma separated — React, Node, MongoDB' },
  stack: { label: 'Tech stack', hint: 'Comma separated — React, Node' },
  liveUrl: { label: 'Live demo link' },
  githubUrl: { label: 'GitHub link' },
  company: { label: 'Company' },
  period: { label: 'Period', hint: 'e.g. 2024 — Present' },
  points: { label: 'Bullet points', hint: 'Comma separated' },
  institution: { label: 'Institution' },
  issuer: { label: 'Issued by' },
  date: { label: 'Date' },
  credentialUrl: { label: 'Credential link' },
  excerpt: { label: 'Short excerpt' },
  content: { label: 'Full content', hint: 'Shown in the blog reader popup' },
  link: { label: 'External link', hint: 'If set, the card opens this URL instead of the reader' },
  coverImage: { label: 'Cover image', hint: 'Upload a file or paste a URL' },
  icon: { label: 'Icon name', hint: 'A Lucide icon — Layers, Server, Code2' },
  quote: { label: 'Quote' },
  name: { label: 'Person name' },
  role: { label: 'Role / title' },
  avatar: { label: 'Avatar', hint: 'Upload a file or paste a URL' },
  email: { label: 'Email' },
  phone: { label: 'Phone' },
  location: { label: 'Location' },
  url: { label: 'File / link', hint: 'Upload a PDF or paste a link' },
  platform: { label: 'Platform', hint: 'GitHub, LinkedIn or Email' },
  title: { label: 'Title' },
  keywords: { label: 'Keywords', hint: 'Comma separated' },
  siteName: { label: 'Site / brand name' },
  logoText: { label: 'Logo initials', hint: 'Fallback if no photo — e.g. MZ' },
  logoImage: { label: 'Logo photo (header)', hint: 'Upload your header photo' },
  accentColor: { label: 'Accent color', hint: 'Hex color — e.g. #7c5cff' },
  ctaText: { label: 'Nav button text', hint: 'e.g. Hire Me' },
  footerText: { label: 'Footer text' },
  // Section Titles (siteText)
  workEyebrow: { label: 'Work · eyebrow' }, workTitle: { label: 'Work · heading', hint: 'Wrap part in *asterisks* to highlight' }, workSubtitle: { label: 'Work · subtitle' },
  skillsEyebrow: { label: 'Skills · eyebrow' }, skillsTitle: { label: 'Skills · heading' },
  servicesEyebrow: { label: 'Services · eyebrow' }, servicesTitle: { label: 'Services · heading' },
  aboutEyebrow: { label: 'About · eyebrow' }, aboutTitle: { label: 'About · heading' },
  testimonialsEyebrow: { label: 'Testimonials · eyebrow' }, testimonialsTitle: { label: 'Testimonials · heading' },
  blogEyebrow: { label: 'Blog · eyebrow' }, blogTitle: { label: 'Blog · heading' },
  contactEyebrow: { label: 'Contact · eyebrow' }, contactTitle: { label: 'Contact · heading' }, contactSubtitle: { label: 'Contact · subtitle' },
  experienceTitle: { label: 'Timeline · Experience column' }, educationTitle: { label: 'Timeline · Education column' },
  liveLabel: { label: 'Button · Live demo' }, codeLabel: { label: 'Button · Code' }, detailsLabel: { label: 'Button · Details' },
  featuredLabel: { label: 'Badge · Featured' }, readMoreLabel: { label: 'Link · Read more' },
}

const rowThumb = (item) => item.data?.image || item.data?.coverImage || item.data?.avatar || item.data?.logoImage

/* ---------------- Login ---------------- */
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

/* ---------------- Confirm dialog ---------------- */
function ConfirmDialog({ state, onClose }) {
  useEffect(() => {
    if (!state.open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.open, onClose])
  return (
    <AnimatePresence>
      {state.open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="confirm-card glass" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
            <div className="confirm-icon"><AlertTriangle size={26} /></div>
            <h3>{state.title}</h3>
            <p>{state.message}</p>
            <div className="confirm-actions">
              <button className="btn ghost compact" onClick={onClose}>Cancel</button>
              <button className="btn danger compact" onClick={() => { state.onConfirm?.(); onClose() }}>{state.confirmLabel || 'Delete'}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- Dashboard ---------------- */
export function Dashboard({ theme, toggleTheme }) {
  const [items, setItems] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('overview')
  const [activeType, setActiveType] = useState('hero')
  const [editing, setEditing] = useState(null)
  const [sideOpen, setSideOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState({ open: false })
  const dirtyRef = useRef(false)
  const navigate = useNavigate()

  const askConfirm = useCallback((cfg) => setConfirm({ open: true, ...cfg }), [])
  const setDirty = useCallback((d) => { dirtyRef.current = d }, [])
  const guard = useCallback((action) => {
    if (dirtyRef.current) {
      askConfirm({ title: 'Discard changes?', message: 'You have unsaved edits. Discard them?', confirmLabel: 'Discard', onConfirm: () => { dirtyRef.current = false; action() } })
    } else action()
  }, [askConfirm])

  async function load() {
    try {
      const [c, m] = await Promise.all([api.get('/admin/content'), api.get('/admin/messages')])
      setItems(c.data.items || [])
      setMessages(m.data.items || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  // Esc closes the mobile sidebar
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSideOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const active = contentTypes.find((t) => t.key === activeType)
  const typed = items.filter((i) => i.type === activeType)
  const visible = query
    ? typed.filter((i) => `${i.title} ${JSON.stringify(i.data || {})}`.toLowerCase().includes(query.toLowerCase()))
    : typed
  const singletonFull = active?.singleton && typed.length >= 1
  const stats = useMemo(() => ({
    sections: new Set(items.map((i) => i.type)).size,
    entries: items.length,
    unread: messages.filter((m) => m.status === 'new').length,
  }), [items, messages])

  function logout() {
    guard(() => { localStorage.removeItem(TOKEN_KEY); navigate('/admin') })
  }
  function goView(v) {
    guard(() => { setView(v); setEditing(null); setQuery(''); setSideOpen(false); dirtyRef.current = false })
  }
  function selectType(key) {
    guard(() => { setActiveType(key); setView('content'); setEditing(null); setQuery(''); setSideOpen(false); dirtyRef.current = false })
  }
  function selectEntry(item) { guard(() => setEditing(item)) }
  function newEntry() {
    guard(() => setEditing({ type: activeType, title: '', status: 'published', order: typed.length, featured: false, data: {} }))
  }

  async function move(entry, dir) {
    const list = [...typed]
    const idx = list.findIndex((x) => x._id === entry._id)
    const j = idx + dir
    if (j < 0 || j >= list.length) return
    ;[list[idx], list[j]] = [list[j], list[idx]]
    try {
      await Promise.all(list.map((x, i) => (x.order === i ? null : api.put(`/admin/content/${x._id}`, { order: i }))).filter(Boolean))
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }
  async function toggleStatus(entry) {
    try {
      await api.put(`/admin/content/${entry._id}`, { status: entry.status === 'published' ? 'draft' : 'published' })
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div className="admin">
      {sideOpen && <div className="side-overlay" onClick={() => setSideOpen(false)} />}
      <aside className={sideOpen ? 'admin-side open' : 'admin-side'}>
        <div className="brand"><span className="logo"><img src="/favicon.png" alt="MZ" /></span>Portfolio CMS</div>
        <button className="icon-btn side-close" onClick={() => setSideOpen(false)} aria-label="Close menu"><X size={18} /></button>
        <nav className="admin-nav">
          <button className={view === 'overview' ? 'active' : ''} onClick={() => goView('overview')}>
            <LayoutDashboard size={17} /> <span className="nav-lbl">Overview</span>
          </button>
          <button className={view === 'content' ? 'active' : ''} onClick={() => goView('content')}>
            <FileStack size={17} /> <span className="nav-lbl">Content</span>
          </button>
          {view === 'content' && (
            <div className="nav-sub">
              {contentTypes.map((t) => {
                const Icon = TYPE_ICONS[t.key] || FileStack
                const count = items.filter((i) => i.type === t.key).length
                return (
                  <button key={t.key} className={activeType === t.key ? 'active' : ''} title={t.desc} onClick={() => selectType(t.key)}>
                    <Icon size={15} /> <span className="nav-lbl">{t.label}</span>
                    {count > 0 && <span className="nav-count">{count}</span>}
                  </button>
                )
              })}
            </div>
          )}
          <button className={view === 'messages' ? 'active' : ''} onClick={() => goView('messages')}>
            <Mail size={17} /> <span className="nav-lbl">Messages</span>
            {stats.unread > 0 && <span className="nav-count alert">{stats.unread}</span>}
          </button>
        </nav>
        <button className="side-logout" onClick={logout}><LogOut size={16} /> Logout</button>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="icon-btn side-close" style={{ position: 'static' }} onClick={() => setSideOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <div><span className="eyebrow">{view === 'overview' ? 'Dashboard' : view === 'messages' ? 'Inbox' : 'Content'}</span><h1>{view === 'overview' ? 'Welcome back' : view === 'messages' ? 'Contact messages' : (active?.label || 'Content')}</h1></div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {toggleTheme && (
              <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <Link className="btn ghost compact" to="/">View Site</Link>
          </div>
        </div>

        {view === 'overview' && <Overview stats={stats} messages={messages} loading={loading} goView={goView} />}

        {view === 'content' && (
        <div className="workspace">
          <section className="panel glass">
            <div className="panel-head">
              <div className="panel-title-wrap">
                <h2>{active?.label} {active?.singleton && <span className="badge">one per site</span>}</h2>
                <p className="section-desc"><Info size={13} /> {active?.desc}</p>
              </div>
              {!singletonFull && (
                <button className="btn primary compact" onClick={newEntry}><Plus size={15} /> New</button>
              )}
            </div>

            {typed.length > 3 && (
              <div className="search-box list-search"><Search size={15} /><input placeholder={`Search ${active?.label}…`} value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            )}

            <div className="list">
              {visible.map((item, i) => {
                const img = rowThumb(item)
                return (
                  <div key={item._id} className={editing?._id === item._id ? 'row active' : 'row'}>
                    <button className="row-main" onClick={() => selectEntry(item)}>
                      {img ? <img className="row-thumb" src={img} alt="" /> : <span className="row-thumb ph"><FileStack size={14} /></span>}
                      <span className="row-text">
                        <span className="row-title">{item.title || '(untitled)'}</span>
                        <small>order {item.order}</small>
                      </span>
                    </button>
                    <div className="row-tools">
                      <button className={item.status === 'published' ? 'pubtog on' : 'pubtog'} title={item.status === 'published' ? 'Published — click to hide' : 'Draft — click to publish'} onClick={() => toggleStatus(item)}>
                        {item.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      {!query && (
                        <span className="reorder">
                          <button disabled={i === 0} onClick={() => move(item, -1)} aria-label="Move up"><ChevronUp size={14} /></button>
                          <button disabled={i === visible.length - 1} onClick={() => move(item, 1)} aria-label="Move down"><ChevronDown size={14} /></button>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              {!loading && !visible.length && (
                <div className="empty">
                  {query ? <>No matches for “{query}”.</> : <>No entries yet in <b>{active?.label}</b>.<br />Click <b>New</b> to add the first one.</>}
                </div>
              )}
              {loading && <div className="empty">Loading…</div>}
            </div>
          </section>

          <Editor
            item={editing}
            activeType={activeType}
            onSaved={() => { dirtyRef.current = false; setEditing(null); load() }}
            onDeleted={() => { dirtyRef.current = false; setEditing(null); load() }}
            onNew={newEntry}
            onDirty={setDirty}
            askConfirm={askConfirm}
          />
        </div>
        )}

        {view === 'messages' && (
          <MessageManager messages={messages} loading={loading} reload={load} askConfirm={askConfirm} />
        )}
      </main>

      <ConfirmDialog state={confirm} onClose={() => setConfirm({ open: false })} />
    </div>
  )
}

/* ---------------- Overview ---------------- */
function Overview({ stats, messages, loading, goView }) {
  const recent = messages.slice(0, 5)
  const cards = [
    { icon: BarChart3, value: stats.sections, label: 'Active sections', to: 'content' },
    { icon: FileStack, value: stats.entries, label: 'Content entries', to: 'content' },
    { icon: Mail, value: stats.unread, label: 'New messages', to: 'messages' },
  ]
  return (
    <div className="overview">
      <div className="admin-stats">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <button className="astat glass" key={c.label} onClick={() => goView(c.to)}>
              <span className="ic"><Icon size={22} /></span>
              <div><strong>{c.value}</strong><span>{c.label}</span></div>
            </button>
          )
        })}
      </div>

      <section className="panel glass">
        <div className="panel-head">
          <div className="panel-title-wrap">
            <h2>Recent messages</h2>
            <p className="section-desc"><Info size={13} /> Latest enquiries from your contact form.</p>
          </div>
          <button className="btn ghost compact" onClick={() => goView('messages')}>Open inbox</button>
        </div>
        <div className="ov-msgs">
          {recent.map((m) => (
            <button className="ov-msg" key={m._id} onClick={() => goView('messages')}>
              <span className="ov-msg-text">
                <strong>{m.subject}</strong>
                <small>{m.name} · {m.email}</small>
              </span>
              <span className={m.status === 'new' ? 'badge new' : 'badge'}>{m.status}</span>
            </button>
          ))}
          {!loading && !recent.length && <div className="empty">No messages yet — enquiries from your contact form will show here.</div>}
          {loading && <div className="empty">Loading…</div>}
        </div>
      </section>
    </div>
  )
}

/* ---------------- Editor ---------------- */
function Editor({ item, activeType, onSaved, onDeleted, onNew, onDirty, askConfirm }) {
  const typeConfig = contentTypes.find((t) => t.key === (item?.type || activeType))
  const [draft, setDraft] = useState(item)
  const [uploading, setUploading] = useState('')
  const [busy, setBusy] = useState(false)
  const originalRef = useRef()

  useEffect(() => { setDraft(item); originalRef.current = JSON.stringify(item) }, [item])
  useEffect(() => {
    onDirty?.(originalRef.current !== undefined && JSON.stringify(draft) !== originalRef.current)
  }, [draft, onDirty])

  const anchor = TYPE_TO_ANCHOR[activeType]
  const viewHref = anchor ? `/#${anchor}` : '/'

  if (!draft) {
    const Icon = TYPE_ICONS[activeType] || FileStack
    return (
      <section className="panel editor glass editor-empty">
        <div className="ee-icon"><Icon size={30} /></div>
        <h3>{typeConfig?.label}</h3>
        <p>{typeConfig?.desc}</p>
        <p className="ee-hint">Pick an entry from the left to edit it, or add a new one.</p>
        {!(typeConfig?.singleton) && <button className="btn primary compact" onClick={onNew}><Plus size={15} /> New {typeConfig?.label} entry</button>}
      </section>
    )
  }

  const setField = (k, v) => setDraft({ ...draft, [k]: v })
  const setData = (k, v) => setDraft({ ...draft, data: { ...(draft.data || {}), [k]: v } })

  async function save() {
    if (busy) return
    if (!draft.title || !draft.title.trim()) { toast.error('Please add a title first'); return }
    setBusy(true)
    const payload = {
      type: draft.type || activeType,
      title: draft.title,
      status: draft.status || 'published',
      order: Number(draft.order || 0),
      featured: Boolean(draft.featured),
      data: draft.data || {},
    }
    try {
      if (draft._id) await api.put(`/admin/content/${draft._id}`, payload)
      else await api.post('/admin/content', payload)
      originalRef.current = JSON.stringify(draft)
      toast.success('Saved')
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function remove() {
    if (!draft._id) return onDeleted()
    askConfirm({
      title: 'Delete this entry?',
      message: `“${draft.title || 'Untitled'}” will be permanently removed from ${typeConfig?.label}.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try { await api.delete(`/admin/content/${draft._id}`); toast.success('Deleted'); onDeleted() }
        catch (err) { toast.error(getErrorMessage(err)) }
      },
    })
  }

  async function duplicate() {
    setBusy(true)
    try {
      await api.post('/admin/content', {
        type: draft.type || activeType,
        title: `${draft.title || 'Untitled'} (copy)`,
        status: 'draft',
        order: Number(draft.order || 0) + 1,
        featured: false,
        data: draft.data || {},
      })
      toast.success('Duplicated (as draft)')
      onSaved()
    } catch (err) { toast.error(getErrorMessage(err)) } finally { setBusy(false) }
  }

  async function uploadFile(field, file) {
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    setUploading(field)
    try {
      const { data } = await api.post('/upload', body)
      setData(field, data.file.url)
      toast.success('Uploaded')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading('')
    }
  }

  return (
    <form className="panel editor glass" onSubmit={(e) => { e.preventDefault(); save() }}>
      <div className="panel-head">
        <div className="panel-title-wrap">
          <h2>{draft._id ? 'Edit' : 'New'} · {typeConfig?.label}</h2>
          <p className="section-desc"><Info size={13} /> {typeConfig?.desc}</p>
        </div>
        <div className="editor-tools">
          {viewHref && <a className="icon-btn sm" href={viewHref} target="_blank" rel="noreferrer" title="View on site"><ExternalLink size={16} /></a>}
          {draft._id && <button type="button" className="icon-btn sm" onClick={duplicate} disabled={busy} title="Duplicate"><Copy size={16} /></button>}
          <button type="button" className="icon-danger" onClick={remove} aria-label="Delete" title="Delete"><Trash2 size={17} /></button>
          <button type="submit" className="btn primary compact" disabled={busy}><Save size={15} /> {busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      <div className="grid2">
        <label><span className="field-label">Title</span><input value={draft.title || ''} onChange={(e) => setField('title', e.target.value)} placeholder="A short name for this entry" /></label>
        <label><span className="field-label">Status</span><select value={draft.status || 'published'} onChange={(e) => setField('status', e.target.value)}><option value="published">published (visible)</option><option value="draft">draft (hidden)</option></select></label>
        <label><span className="field-label">Order</span><input type="number" value={draft.order || 0} onChange={(e) => setField('order', e.target.value)} /></label>
        <label className="toggle"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => setField('featured', e.target.checked)} /> Featured</label>
      </div>

      <div className="fields">
        {typeConfig?.fields.map((field) => {
          const meta = FIELD_META[field] || {}
          const value = draft.data?.[field] || ''
          const isImg = IMAGE_FIELDS.includes(field)
          return (
            <label key={field}>
              <span className="field-label">
                {meta.label || field}
                {meta.hint && <em className="field-hint">{meta.hint}</em>}
              </span>
              {MULTILINE.includes(field)
                ? <textarea value={Array.isArray(value) ? value.join(', ') : value} onChange={(e) => setData(field, e.target.value)} placeholder={meta.hint || ''} />
                : <input value={value} onChange={(e) => setData(field, e.target.value)} placeholder={meta.hint || ''} />}
              {UPLOADABLE.includes(field) && (
                <span className="upload-line">
                  <Upload size={14} />
                  <input type="file" accept={field === 'url' ? '.pdf,application/pdf' : 'image/*'} onChange={(e) => uploadFile(field, e.target.files?.[0])} />
                  {uploading === field ? 'Uploading…' : 'Upload to Cloudinary'}
                </span>
              )}
              {isImg && value && <img className="field-thumb" src={value} alt="preview" />}
            </label>
          )
        })}
      </div>
    </form>
  )
}

/* ---------------- Messages ---------------- */
function MessageManager({ messages, loading, reload, askConfirm }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const filtered = messages.filter((m) => `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(q.toLowerCase()))
  const unread = messages.filter((m) => m.status === 'new').length

  async function update(id, status) {
    try { await api.put(`/admin/messages/${id}`, { status }); reload() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }
  function openMsg(m) {
    if (m.status === 'new') { update(m._id, 'read'); setOpen({ ...m, status: 'read' }) }
    else setOpen(m)
  }
  function remove(id, subject) {
    askConfirm({
      title: 'Delete this message?',
      message: `“${subject}” will be permanently removed from your inbox.`,
      onConfirm: async () => {
        try { await api.delete(`/admin/messages/${id}`); toast.success('Deleted'); setOpen(null); reload() }
        catch (err) { toast.error(getErrorMessage(err)) }
      },
    })
  }

  const fmtDate = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return '' }
  }

  return (
    <section className="messages">
      <div className="msg-toolbar">
        <span className="msg-count">{messages.length} message{messages.length === 1 ? '' : 's'}{unread ? <> · <em>{unread} new</em></> : null}</span>
        <div className="search-box"><Search size={15} /><input aria-label="Search messages" placeholder="Search messages" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <div className="msg-list">
        {filtered.map((m) => (
          <button className={m.status === 'new' ? 'msg-row unread' : 'msg-row'} key={m._id} onClick={() => openMsg(m)}>
            <span className="msg-avatar">{(m.name || '?').trim().charAt(0).toUpperCase()}</span>
            <span className="msg-row-main">
              <span className="msg-row-name">{m.name || 'Anonymous'}{m.status === 'new' && <span className="msg-dot" title="Unread" />}</span>
              <span className="msg-row-subject">{m.subject}</span>
            </span>
            <span className="msg-row-date">{fmtDate(m.createdAt)}</span>
          </button>
        ))}
        {!loading && !filtered.length && <div className="empty">{q ? 'No matching messages.' : 'No messages yet — enquiries from your contact form will appear here.'}</div>}
        {loading && <div className="empty">Loading…</div>}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="msg-modal glass" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
              <button className="msg-modal-close" onClick={() => setOpen(null)} aria-label="Close"><X size={18} /></button>
              <div className="msg-modal-head">
                <span className="msg-avatar lg">{(open.name || '?').trim().charAt(0).toUpperCase()}</span>
                <div className="msg-modal-who">
                  <strong>{open.name || 'Anonymous'}</strong>
                  <a href={`mailto:${open.email}`} className="msg-email">{open.email}</a>
                </div>
                {open.createdAt && <span className="msg-date">{fmtDate(open.createdAt)}</span>}
              </div>
              <h2 className="msg-modal-subject">{open.subject}</h2>
              <p className="msg-modal-body">{open.message}</p>
              <div className="msg-modal-actions">
                <a className="btn primary compact" href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject)}`}><Mail size={15} /> Reply</a>
                <select className="msg-status" aria-label="Message status" value={open.status} onChange={(e) => { update(open._id, e.target.value); setOpen({ ...open, status: e.target.value }) }}>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                </select>
                <button className="btn danger compact msg-modal-del" onClick={() => remove(open._id, open.subject)}><Trash2 size={15} /> Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
