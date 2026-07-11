import { Layers } from 'lucide-react'
import { text } from '../../lib/site'
import { Reveal, StaggerGroup, StaggerItem } from '../ui'
import { Heading, SERVICE_ICONS } from './shared'

export default function Services({ site }) {
  const services = site.service || []
  return (
    <section className="section" id="services">
      <div className="container">
        <Reveal className="section-head center">
          <span className="eyebrow">{text(site, 'servicesEyebrow')}</span>
          <h2><Heading>{text(site, 'servicesTitle')}</Heading></h2>
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
