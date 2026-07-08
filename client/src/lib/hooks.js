import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { fallbackSite } from './site'

// Load CMS content from the API, falling back to rich local content offline.
export function useSite() {
  const [site, setSite] = useState(fallbackSite)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function loadSite() {
      try {
        const { data } = await api.get('/public/site')
        if (!alive) return
        const dbSite = data.site || {}
        // Once the CMS has any published content it is the source of truth — so a
        // section the owner hid (all drafts) correctly shows nothing, not the demo.
        // The rich fallback is only used before the site is seeded (empty DB).
        setSite(Object.keys(dbSite).length ? dbSite : fallbackSite)
      } catch {
        if (alive) setSite(fallbackSite)
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
