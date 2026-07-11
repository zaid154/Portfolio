import { ArrowRight } from 'lucide-react'
import { text } from '../../lib/site'
import { Reveal, StaggerGroup, StaggerItem } from '../ui'
import { Heading } from './shared'

export default function Blog({ site, onOpen }) {
  const posts = site.blog || []
  if (!posts.length) return null
  const readMore = text(site, 'readMoreLabel')
  return (
    <section className="section" id="blog">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{text(site, 'blogEyebrow')}</span>
          <h2><Heading>{text(site, 'blogTitle')}</Heading></h2>
        </Reveal>
        <StaggerGroup className="blog-grid">
          {posts.map((post) => {
            const open = () => {
              if (post.data.link) window.open(post.data.link, '_blank', 'noreferrer')
              else onOpen(post)
            }
            return (
              <StaggerItem key={post._id}>
                <article className="blog-card" onClick={open} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open()}>
                  {post.data.coverImage && <div className="blog-cover"><img src={post.data.coverImage} alt={post.title} loading="lazy" /></div>}
                  <div className="blog-body">
                    <h3>{post.title}</h3>
                    <p>{post.data.excerpt}</p>
                    <span className="blog-more">{readMore} <ArrowRight size={15} /></span>
                  </div>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}
