import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  ArrowRight, ArrowUpRight, Mail, MapPin, Menu, Moon, Sun, X,
  Download, Quote, Layers, MonitorSmartphone, Server,
  LayoutDashboard, Code2, Zap, Phone, Send, Sparkles, LogIn, CheckCircle2, ExternalLink,
} from 'lucide-react'
import { api, getErrorMessage } from '../lib/api'
import { first, asArray, text } from '../lib/site'
import { useScrollSpy } from '../lib/hooks'
import { Reveal, StaggerGroup, StaggerItem, Counter, Marquee, GithubIcon, LinkedinIcon } from './ui'

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
// Stable reference so useScrollSpy's effect doesn't re-subscribe on every render.
const NAV_IDS = NAV.map((n) => n.id)
const SERVICE_ICONS = { Layers, MonitorSmartphone, Server, LayoutDashboard, Code2 }
const initials = (name = '') => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

// Render a heading, gradient-highlighting any *asterisk-wrapped* part (falls back to the last two words).
function Heading({ children }) {
  const str = String(children || '')
  const stars = (str.match(/\*/g) || []).length
  // Only treat asterisks as markers when they're balanced (even count).
  if (stars >= 2 && stars % 2 === 0) {
    return <>{str.split('*').map((p, i) => (i % 2 ? <span key={i} className="gradient-text">{p}</span> : <span key={i}>{p}</span>))}</>
  }
  const words = str.replace(/\*/g, '').split(' ')
  if (words.length < 3) return <span className="gradient-text">{words.join(' ')}</span>
  return <>{words.slice(0, -2).join(' ')} <span className="gradient-text">{words.slice(-2).join(' ')}</span></>
}

/* ---------------- Navbar ---------------- */
function Navbar({ settings, theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  const active = useScrollSpy(NAV_IDS)
  const cta = settings.ctaText || 'Hire Me'

  return (
    <>
      <motion.nav
        className="nav"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <a href="#home" className="brand"><span className="logo"><img src={settings.logoImage || '/favicon.png'} alt={settings.siteName || 'Mohd Zaid'} /></span>{settings.siteName || 'Mohd Zaid'}</a>
        <div className="nav-links">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''}>{n.label}</a>
          ))}
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/admin" className="icon-btn admin-link" aria-label="Admin login" title="Admin login"><LogIn size={18} /></Link>
          <a href="#contact" className="btn primary compact nav-cta">{cta} <ArrowRight size={16} /></a>
          <button className="icon-btn burger" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={20} /></button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div className="mobile-sheet" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <button className="icon-btn" style={{ position: 'absolute', top: 20, right: 20 }} onClick={() => setOpen(false)}><X size={20} /></button>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''} onClick={() => setOpen(false)}>{n.label}</a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)}>{cta}</a>
            <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------- Hero ---------------- */
function useTypewriter(words, speed = 90, pause = 1500) {
  const [str, setStr] = useState('')
  const [i, setI] = useState(0)
  const [del, setDel] = useState(false)

  useEffect(() => {
    const current = words[i % words.length]
    let timer
    if (!del && str === current) {
      timer = setTimeout(() => setDel(true), pause)
    } else if (del && str === '') {
      setDel(false)
      setI((v) => v + 1)
    } else {
      timer = setTimeout(() => {
        setStr(del ? current.slice(0, str.length - 1) : current.slice(0, str.length + 1))
      }, del ? speed / 2 : speed)
    }
    return () => clearTimeout(timer)
  }, [str, del, i, words, speed, pause])

  return str
}

const DEFAULT_ROLES = ['Full Stack Developer', 'MERN Specialist', 'React Engineer', 'API Builder']

function Hero({ site }) {
  const hero = first(site, 'hero')
  const resume = first(site, 'resume').data
  const roles = asArray(hero.data.roles)
  const role = useTypewriter(roles.length ? roles : DEFAULT_ROLES)
  const quickStats = (site.stat || []).slice(0, 3)

  return (
    <header className="hero" id="home">
      <div>
        <motion.span className="hero-badge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="dot" /> {hero.data.badge || 'Available for freelance & full-time'}
        </motion.span>
        {hero.data.eyebrow && (
          <motion.span className="eyebrow hero-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>{hero.data.eyebrow}</motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Heading>{hero.data.headline || 'I build fast, premium web products *end to end.*'}</Heading>
          <span className="role">{role}<span className="caret">|</span></span>
        </motion.h1>
        <motion.p className="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {hero.data.description}
        </motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <a href="#work" className="btn primary">{hero.data.primaryCta || 'View My Work'} <ArrowRight size={18} /></a>
          {hero.data.secondaryCta && <a href="#contact" className="btn ghost">{hero.data.secondaryCta}</a>}
          {resume.url && <a href={resume.url} target="_blank" rel="noreferrer" className="btn ghost"><Download size={17} /> {resume.label || 'Résumé'}</a>}
        </motion.div>
        <motion.div className="hero-quickstats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {(quickStats.length ? quickStats : [
            { _id: 'q1', data: { value: `${site.project?.length || 9}+`, label: 'Projects Built' } },
            { _id: 'q2', data: { value: '1+', label: 'Years Coding' } },
            { _id: 'q3', data: { value: '100%', label: 'Client Focus' } },
          ]).map((s) => (
            <div className="qs" key={s._id}><strong>{s.data.value || s.title}</strong><span>{s.data.label}</span></div>
          ))}
        </motion.div>
      </div>

      <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
        <span className="hero-orb a" />
        <span className="hero-orb b" />
        <div className="hero-photo">
          <img src={hero.data.image || '/images/profile.jpg'} alt={hero.title || 'Mohd Zaid'} />
        </div>
        <motion.div className="hero-float top glass" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <Code2 size={16} /> {hero.data.floatOne || 'Clean Code'}
        </motion.div>
        <motion.div className="hero-float bottom glass" animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
          <Zap size={16} /> {hero.data.floatTwo || 'Fast Delivery'}
        </motion.div>
      </motion.div>
    </header>
  )
}

/* ---------------- Stats ---------------- */
function parseStatValue(value) {
  const m = String(value).match(/^(\d+)(.*)$/)
  return m ? { to: Number(m[1]), suffix: m[2].trim() } : { to: 0, suffix: String(value) }
}

function Stats({ site }) {
  const cmsStats = site.stat || []
  const tiles = cmsStats.length
    ? cmsStats.map((s) => ({ ...parseStatValue(s.data.value || s.title), label: s.data.label || s.title }))
    : [
        { to: site.project?.length || 9, suffix: '+', label: 'Projects Shipped' },
        { to: site.skill?.reduce((n, s) => n + asArray(s.data.skills).length, 0) || 20, suffix: '+', label: 'Technologies' },
        { to: 15, suffix: '+', label: 'Happy Clients' },
        { to: 100, suffix: '%', label: 'Commitment' },
      ]
  return (
    <section className="section" style={{ paddingBlock: 0 }}>
      <div className="container">
        <div className="stats-band">
          {tiles.map((t, i) => <Counter key={i} to={t.to} suffix={t.suffix} label={t.label} />)}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Projects ---------------- */
function slugUrl(title = '') {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '')}.vercel.app`
}
function displayUrl(project) {
  const u = project.data.liveUrl
  if (u && /^https?:\/\//i.test(u)) {
    try { return new URL(u).hostname.replace(/^www\./, '') } catch { /* fall through */ }
  }
  return slugUrl(project.title)
}

function BrowserFrame({ project }) {
  return (
    <div className="browser">
      <div className="browser-bar">
        <i className="tl r" /><i className="tl y" /><i className="tl g" />
        <span className="url">{displayUrl(project)}</span>
      </div>
      <div className="shot-scroll">
        {project.data.image
          ? <img className="browser-shot" src={project.data.image} alt={project.title} loading="lazy" />
          : <div className="browser-shot placeholder" />}
      </div>
    </div>
  )
}

function Projects({ site, onOpen }) {
  const projects = useMemo(() => site.project || [], [site.project])
  const allTags = useMemo(() => {
    const set = new Set()
    projects.forEach((p) => asArray(p.data.stack).forEach((t) => set.add(t)))
    return ['All', ...Array.from(set)]
  }, [projects])
  const [filter, setFilter] = useState('All')
  const shown = filter === 'All' ? projects : projects.filter((p) => asArray(p.data.stack).includes(filter))
  const liveLabel = text(site, 'liveLabel', 'Live Demo')
  const codeLabel = text(site, 'codeLabel', 'Code')
  const detailsLabel = text(site, 'detailsLabel', 'Details')
  const featuredLabel = text(site, 'featuredLabel', 'Featured')

  return (
    <section className="section" id="work">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{text(site, 'workEyebrow', 'Selected Work')}</span>
          <h2><Heading>{text(site, 'workTitle', "Projects I've *designed & shipped*")}</Heading></h2>
          <p>{text(site, 'workSubtitle', 'A mix of full-stack apps, dashboards, and interfaces — click any project for details.')}</p>
        </Reveal>

        <Reveal className="filter-bar" delay={0.1}>
          {allTags.slice(0, 8).map((tag) => (
            <button key={tag} className={filter === tag ? 'active' : ''} onClick={() => setFilter(tag)}>{tag}</button>
          ))}
        </Reveal>

        <div className="showcase-list">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.article
                key={p._id}
                layout
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                className={i % 2 ? 'showcase-row reverse' : 'showcase-row'}
              >
                <div className="showcase-media" onClick={() => onOpen(p)}>
                  <BrowserFrame project={p} />
                </div>
                <div className="showcase-info">
                  <span className="snum">{String(i + 1).padStart(2, '0')}{p.featured ? ` — ${featuredLabel}` : ''}</span>
                  <h3>{p.title}</h3>
                  <p>{p.data.description}</p>
                  <div className="project-tags">
                    {asArray(p.data.stack).map((t) => <span key={t}>{t}</span>)}
                  </div>
                  <div className="fp-actions">
                    {p.data.liveUrl && p.data.liveUrl !== '#' && <a href={p.data.liveUrl} target="_blank" rel="noreferrer" className="btn primary compact">{liveLabel} <ArrowUpRight size={16} /></a>}
                    {p.data.githubUrl && p.data.githubUrl !== '#' && <a href={p.data.githubUrl} target="_blank" rel="noreferrer" className="btn ghost compact"><GithubIcon size={15} /> {codeLabel}</a>}
                    <button className="btn ghost compact" onClick={() => onOpen(p)}>{detailsLabel}</button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Modal (projects + blog) ---------------- */
function Modal({ item, onClose }) {
  useEffect(() => {
    if (!item) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, onClose])
  return (
    <AnimatePresence>
      {item && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal"
            style={{ position: 'relative' }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
            {item.img && <div className="modal-img"><img src={item.img} alt={item.title} /></div>}
            <div className="modal-body">
              {item.tags?.length > 0 && (
                <div className="project-tags" style={{ marginBottom: 14 }}>{item.tags.map((t) => <span key={t}>{t}</span>)}</div>
              )}
              <h3>{item.title}</h3>
              {item.body && <p style={{ whiteSpace: 'pre-line' }}>{item.body}</p>}
              {item.actions?.length > 0 && (
                <div className="modal-actions">
                  {item.actions.map((a) => (
                    <a key={a.label} href={a.href} target="_blank" rel="noreferrer" className={a.primary ? 'btn primary' : 'btn ghost'}>
                      {a.icon}{a.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- Skills ---------------- */
function Skills({ site }) {
  const skills = site.skill || []
  return (
    <section className="section" id="skills">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{text(site, 'skillsEyebrow', 'Toolbox')}</span>
          <h2><Heading>{text(site, 'skillsTitle', 'Skills & *technologies*')}</Heading></h2>
        </Reveal>
        <StaggerGroup className="skills-grid">
          {skills.map((group) => {
            const lvl = Number(group.data.level) || 80
            return (
              <StaggerItem key={group._id} className="skill-card glass">
                <div className="top">
                  <h3>{group.title}</h3>
                  <span className="lvl">{lvl}%</span>
                </div>
                <div className="skill-bar">
                  <motion.span initial={{ width: 0 }} whileInView={{ width: `${lvl}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} />
                </div>
                <div className="skill-tags">
                  {asArray(group.data.skills).map((s) => <span key={s}>{s}</span>)}
                </div>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}

/* ---------------- Timeline / About ---------------- */
function Timeline({ site }) {
  const about = first(site, 'about').data
  const exp = site.experience || []
  const edu = [...(site.education || []), ...(site.certificate || [])]
  const highlights = asArray(about.highlights)
  return (
    <section className="section" id="about">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{text(site, 'aboutEyebrow', 'About Me')}</span>
          <h2><Heading>{text(site, 'aboutTitle', 'My journey so far')}</Heading></h2>
          {about.summary && <p>{about.summary}</p>}
        </Reveal>
        {highlights.length > 0 && (
          <Reveal className="about-highlights">
            {highlights.map((h) => <span key={h}><CheckCircle2 size={16} /> {h}</span>)}
          </Reveal>
        )}
        <div className="timeline-wrap">
          <Reveal className="timeline-col">
            <h3 className="col-title">{text(site, 'experienceTitle', 'Experience')}</h3>
            <div className="timeline">
              {exp.map((item) => (
                <div className="timeline-item" key={item._id}>
                  <span className="period">{item.data.period}</span>
                  <h4>{item.title}</h4>
                  <span className="org">{item.data.company}</span>
                  {item.data.description && <p>{item.data.description}</p>}
                  {asArray(item.data.points).length > 0 && (
                    <ul>{asArray(item.data.points).map((pt) => <li key={pt}>{pt}</li>)}</ul>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="timeline-col" delay={0.1}>
            <h3 className="col-title">{text(site, 'educationTitle', 'Education & Certificates')}</h3>
            <div className="timeline">
              {edu.map((item) => (
                <div className="timeline-item" key={item._id}>
                  <span className="period">{item.data.period || item.data.date}</span>
                  <h4>
                    {item.data.image && <img className="tl-logo" src={item.data.image} alt="" />}
                    {item.title}
                  </h4>
                  <span className="org">{item.data.institution || item.data.issuer}</span>
                  {item.data.description && <p>{item.data.description}</p>}
                  {item.data.credentialUrl && item.data.credentialUrl !== '#' && (
                    <a className="tl-link" href={item.data.credentialUrl} target="_blank" rel="noreferrer">View credential <ExternalLink size={13} /></a>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Services ---------------- */
function Services({ site }) {
  const services = site.service || []
  return (
    <section className="section" id="services">
      <div className="container">
        <Reveal className="section-head center">
          <span className="eyebrow">{text(site, 'servicesEyebrow', 'What I Do')}</span>
          <h2><Heading>{text(site, 'servicesTitle', 'Services I *offer*')}</Heading></h2>
        </Reveal>
        <StaggerGroup className="services-grid">
          {services.map((s, i) => {
            const Icon = SERVICE_ICONS[s.data.icon] || Layers
            return (
              <StaggerItem key={s._id} className="service-card glass">
                <span className="service-num">0{i + 1}</span>
                <div className="service-icon"><Icon size={26} /></div>
                <h3>{s.title}</h3>
                <p>{s.data.description}</p>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}

/* ---------------- Testimonials ---------------- */
function Testimonials({ site }) {
  const list = site.testimonial || []
  if (!list.length) return null
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section-head center">
          <span className="eyebrow">{text(site, 'testimonialsEyebrow', 'Testimonials')}</span>
          <h2><Heading>{text(site, 'testimonialsTitle', "Kind words from *people I've worked with*")}</Heading></h2>
        </Reveal>
        <StaggerGroup className="tst-grid">
          {list.map((t) => (
            <StaggerItem key={t._id} className="tst-card glass">
              <Quote className="quote-icon" size={30} />
              <p>{t.data.quote}</p>
              <div className="tst-author">
                {t.data.avatar
                  ? <img className="tst-avatar" src={t.data.avatar} alt={t.data.name || t.title} />
                  : <div className="tst-avatar">{initials(t.data.name || t.title)}</div>}
                <div><strong>{t.data.name || t.title}</strong><span>{t.data.role}</span></div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}

/* ---------------- Blog ---------------- */
function Blog({ site, onOpen }) {
  const posts = site.blog || []
  if (!posts.length) return null
  const readMore = text(site, 'readMoreLabel', 'Read more')
  return (
    <section className="section" id="blog">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{text(site, 'blogEyebrow', 'Writing')}</span>
          <h2><Heading>{text(site, 'blogTitle', 'From the *blog*')}</Heading></h2>
        </Reveal>
        <StaggerGroup className="blog-grid">
          {posts.map((post) => {
            const open = () => {
              if (post.data.link) window.open(post.data.link, '_blank', 'noreferrer')
              else onOpen(post)
            }
            return (
              <StaggerItem key={post._id}>
                <article className="blog-card" onClick={open} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open()}>
                  {post.data.coverImage && <div className="blog-cover"><img src={post.data.coverImage} alt={post.title} loading="lazy" /></div>}
                  <div className="blog-body">
                    <h3>{post.title}</h3>
                    <p>{post.data.excerpt}</p>
                    <span className="blog-more">{readMore} <ArrowRight size={15} /></span>
                  </div>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}

/* ---------------- Contact ---------------- */
function Contact({ site }) {
  const contact = first(site, 'contactInfo').data
  const socials = site.socialLink || []
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const socialIcon = (p) => (p === 'GitHub' ? <GithubIcon size={18} /> : p === 'LinkedIn' ? <LinkedinIcon size={18} /> : <Mail size={18} />)

  async function submit(e) {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/public/contact', form)
      toast.success("Message sent — I'll get back to you soon!")
      setForm({ name: '', email: '', subject: '', message: '', website: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="contact-grid">
          <Reveal className="contact-info">
            <span className="eyebrow">{text(site, 'contactEyebrow', 'Get in touch')}</span>
            <h2><Heading>{text(site, 'contactTitle', "Let's build something *great together*")}</Heading></h2>
            <p>{text(site, 'contactSubtitle', 'Have a project in mind or just want to say hi? My inbox is always open.')}</p>
            <div className="contact-lines">
              {contact.email && <a className="contact-line" href={`mailto:${contact.email}`}><span className="ic"><Mail size={18} /></span><div><small>Email</small><strong>{contact.email}</strong></div></a>}
              {contact.phone && <div className="contact-line"><span className="ic"><Phone size={18} /></span><div><small>Phone</small><strong>{contact.phone}</strong></div></div>}
              {contact.location && <div className="contact-line"><span className="ic"><MapPin size={18} /></span><div><small>Location</small><strong>{contact.location}</strong></div></div>}
            </div>
            <div className="socials">
              {socials.map((s) => (
                <a key={s._id} href={s.data.url} target="_blank" rel="noreferrer" className="icon-btn" aria-label={s.data.platform}>{socialIcon(s.data.platform)}</a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form className="form glass" onSubmit={submit}>
              <input className="hp-field" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <div className="form-row">
                <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
                <div className="field"><label>Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></div>
              </div>
              <div className="field"><label>Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" /></div>
              <div className="field"><label>Message</label><textarea required minLength={10} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell me about your project..." /></div>
              <button className="btn primary" disabled={sending} style={{ width: '100%' }}>{sending ? 'Sending...' : <>Send Message <Send size={17} /></>}</button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Footer ---------------- */
function Footer({ site }) {
  const settings = first(site, 'siteSetting').data
  const socials = site.socialLink || []
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <a href="#home" className="brand"><span className="logo"><img src={settings.logoImage || '/favicon.png'} alt={settings.siteName || 'Mohd Zaid'} /></span>{settings.siteName || 'Mohd Zaid'}</a>
          <div className="footer-links">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
            <Link to="/admin">Admin</Link>
          </div>
          <div className="footer-links">
            {socials.map((s) => <a key={s._id} href={s.data.url} target="_blank" rel="noreferrer">{s.data.platform}</a>)}
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} {settings.siteName || 'Mohd Zaid'}. {settings.footerText || 'Built with the MERN stack.'}
        </div>
      </div>
    </footer>
  )
}

/* ---------------- Page ---------------- */
export default function PublicSite({ site, loading, theme, toggleTheme }) {
  const [modal, setModal] = useState(null)
  const settings = first(site, 'siteSetting').data

  useEffect(() => {
    const seo = first(site, 'seo').data
    if (seo.title) document.title = seo.title
    if (seo.description) document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
    if (seo.keywords) {
      let tag = document.querySelector('meta[name="keywords"]')
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'keywords'); document.head.appendChild(tag) }
      tag.setAttribute('content', seo.keywords)
    }
    // Let the admin's "accentColor" site setting actually recolor the brand.
    const accent = settings.accentColor
    if (accent) {
      const root = document.documentElement.style
      root.setProperty('--accent', accent)
      root.setProperty('--g1', accent)
      root.setProperty('--accent-soft', `color-mix(in srgb, ${accent} 16%, transparent)`)
    }
  }, [site, settings.accentColor])

  const techWords = useMemo(
    () => Array.from(new Set((site.skill || []).flatMap((s) => asArray(s.data.skills)))).slice(0, 12),
    [site]
  )

  const openProject = (p) => setModal({
    title: p.title,
    img: p.data.image,
    tags: asArray(p.data.stack),
    body: p.data.description,
    actions: [
      p.data.liveUrl && p.data.liveUrl !== '#' && { label: text(site, 'liveLabel', 'Live Demo'), href: p.data.liveUrl, primary: true, icon: <ArrowUpRight size={17} /> },
      p.data.githubUrl && p.data.githubUrl !== '#' && { label: 'Source Code', href: p.data.githubUrl, icon: <GithubIcon size={17} /> },
    ].filter(Boolean),
  })
  const openPost = (post) => setModal({
    title: post.title,
    img: post.data.coverImage,
    body: post.data.content || post.data.excerpt,
    actions: [],
  })

  return (
    <>
      <Navbar settings={settings} theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero site={site} />
        {techWords.length > 0 && <Marquee items={techWords} />}
        {loading && <div className="notice">Syncing live CMS content…</div>}
        <Stats site={site} />
        <Projects site={site} onOpen={openProject} />
        <Skills site={site} />
        <Services site={site} />
        <Timeline site={site} />
        <Testimonials site={site} />
        <Blog site={site} onOpen={openPost} />
        <Contact site={site} />
      </main>
      <Footer site={site} />
      <Modal item={modal} onClose={() => setModal(null)} />
    </>
  )
}
