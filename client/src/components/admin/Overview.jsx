import { BarChart3, FileStack, Mail, Info } from 'lucide-react'

export default function Overview({ stats, messages, loading, goView }) {
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
