import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ state, onClose }) {
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
