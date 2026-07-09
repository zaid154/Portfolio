import { useEffect, useRef, useState } from 'react'
import { api } from './api'

// Load CMS content from the API. The database is the SINGLE source of truth:
// whatever is seeded (`npm run seed`) or added/edited in the admin dashboard is
// exactly what renders here. There is no hardcoded fallback content — an empty
// DB simply shows empty sections.
export function useSite() {
  const [site, setSite] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function loadSite() {
      try {
        const { data } = await api.get('/public/site')
        if (!alive) return
        setSite(data.site || {})
      } catch {
        if (alive) setSite({})
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadSite()
    return () => {
      alive = false
    }
  }, [])

  return { site, loading }
}

// Persisted dark/light theme, defaults to dark for the premium look.
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio_theme') || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('portfolio_theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggle }
}

// Track which section is in view for active nav highlighting.
export function useScrollSpy(ids, offset = 120) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    function onScroll() {
      const pos = window.scrollY + offset
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= pos) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids, offset])

  return active
}

// Count from 0 to target once the element scrolls into view.
export function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const end = Number(target) || 0
          const start = performance.now()
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setValue(Math.round(end * eased))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return { ref, value }
}
