import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Search, X, Mail, Trash2 } from 'lucide-react'
import { api, getErrorMessage } from '../../lib/api'

export default function MessageManager({ messages, loading, reload, askConfirm }) {
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
