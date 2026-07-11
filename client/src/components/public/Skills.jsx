import { motion } from 'framer-motion'
import { asArray, text } from '../../lib/site'
import { Reveal, StaggerGroup, StaggerItem } from '../ui'
import { Heading } from './shared'

export default function Skills({ site }) {
  const skills = site.skill || []
  return (
    <section className="section" id="skills">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{text(site, 'skillsEyebrow')}</span>
          <h2><Heading>{text(site, 'skillsTitle')}</Heading></h2>
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
