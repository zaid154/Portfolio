import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FileStack, Plus, Info, ExternalLink, Copy, Trash2, Save, Upload } from 'lucide-react'
import { api, getErrorMessage } from '../../lib/api'
import { contentTypes } from '../../lib/contentTypes'
import { TYPE_ICONS, TYPE_TO_ANCHOR, FIELD_META, MULTILINE, UPLOADABLE, IMAGE_FIELDS } from './constants'

export default function Editor({ item, activeType, onSaved, onDeleted, onNew, onDirty, askConfirm }) {
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
