import { Counter } from '../ui'

function parseStatValue(value) {
  const m = String(value).match(/^(\d+)(.*)$/)
  return m ? { to: Number(m[1]), suffix: m[2].trim() } : { to: 0, suffix: String(value) }
}

export default function Stats({ site }) {
  const cmsStats = site.stat || []
  const tiles = cmsStats.map((s) => ({ ...parseStatValue(s.data.value || s.title), label: s.data.label || s.title }))
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
