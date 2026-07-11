import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { api, getErrorMessage } from '../../lib/api'
import { first, text } from '../../lib/site'
import { Reveal, GithubIcon, LinkedinIcon } from '../ui'
import { Heading } from './shared'

export default function Contact({ site }) {
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
      toast.success(text(site, 'formSuccessMessage'))
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
            <span className="eyebrow">{text(site, 'contactEyebrow')}</span>
            <h2><Heading>{text(site, 'contactTitle')}</Heading></h2>
            <p>{text(site, 'contactSubtitle')}</p>
            <div className="contact-lines">
              {contact.email && <a className="contact-line" href={`mailto:${contact.email}`}><span className="ic"><Mail size={18} /></span><div><small>{text(site, 'contactEmailLabel')}</small><strong>{contact.email}</strong></div></a>}
              {contact.phone && <div className="contact-line"><span className="ic"><Phone size={18} /></span><div><small>{text(site, 'contactPhoneLabel')}</small><strong>{contact.phone}</strong></div></div>}
              {contact.location && <div className="contact-line"><span className="ic"><MapPin size={18} /></span><div><small>{text(site, 'contactLocationLabel')}</small><strong>{contact.location}</strong></div></div>}
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
                <div className="field"><label>{text(site, 'formNameLabel')}</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={text(site, 'formNamePlaceholder')} /></div>
                <div className="field"><label>{text(site, 'formEmailLabel')}</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={text(site, 'formEmailPlaceholder')} /></div>
              </div>
              <div className="field"><label>{text(site, 'formSubjectLabel')}</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={text(site, 'formSubjectPlaceholder')} /></div>
              <div className="field"><label>{text(site, 'formMessageLabel')}</label><textarea required minLength={10} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={text(site, 'formMessagePlaceholder')} /></div>
              <button className="btn primary" disabled={sending} style={{ width: '100%' }}>{sending ? text(site, 'formSendingLabel') : <>{text(site, 'formSendLabel')} <Send size={17} /></>}</button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
