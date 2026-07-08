import slugify from 'slugify'
import { assertEnv } from './config/env.js'
import { connectDb } from './config/db.js'
import User from './models/User.js'
import { modelForType, scopeForType } from './models/contentModels.js'
import Message from './models/Message.js'

const admin = {
  name: process.env.ADMIN_NAME || 'Mohd Zaid',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
}

const items = [
  { type: 'hero', title: 'Mohd Zaid', order: 1, featured: true, data: { badge: 'Available for freelance & full-time', eyebrow: 'Full Stack Developer', headline: 'I build premium MERN products with clean UX and strong backends.', roles: ['Full Stack Developer', 'MERN Specialist', 'React Engineer', 'API Builder'], description: 'A portfolio CMS built like a product: fast public pages, secure admin controls, editable content, image uploads, and deployment-ready architecture.', primaryCta: 'View Projects', secondaryCta: 'Contact Me', floatOne: 'Clean Code', floatTwo: 'Fast Delivery', image: '/images/profile.jpg' } },
  { type: 'stat', title: '9+', order: 1, data: { value: '9+', label: 'Projects Shipped' } },
  { type: 'stat', title: '20+', order: 2, data: { value: '20+', label: 'Technologies' } },
  { type: 'stat', title: '15+', order: 3, data: { value: '15+', label: 'Happy Clients' } },
  { type: 'stat', title: '100%', order: 4, data: { value: '100%', label: 'Commitment' } },
  { type: 'about', title: 'About', order: 1, data: { summary: 'Full Stack Developer focused on React, Node.js, Express, MongoDB, authentication, REST APIs, and responsive product interfaces.', highlights: ['MERN stack development', 'Admin dashboards and CMS systems', 'Clean UI with production-ready APIs'] } },
  { type: 'skill', title: 'Frontend', order: 1, data: { level: 'Advanced', skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Responsive UI'] } },
  { type: 'skill', title: 'Backend', order: 2, data: { level: 'Advanced', skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'REST APIs'] } },
  { type: 'project', title: 'NoteGenie', order: 1, featured: true, data: { description: 'Study material marketplace and AI-powered notes platform.', image: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783331196/portfolio-cms/notegenie.png', stack: ['React', 'Node', 'MongoDB'], liveUrl: '', githubUrl: '' } },
  { type: 'experience', title: 'Full Stack MERN Developer Intern', order: 1, data: { company: 'Humanoid Maker', period: '2026', description: 'Frontend and backend development for real-world MERN applications.', points: ['REST API integration', 'Authentication flows', 'Responsive UI implementation'] } },
  { type: 'education', title: 'Bachelor of Computer Applications', order: 1, data: { institution: 'IGNOU, Delhi', period: '2023 - 2026', description: 'Computer applications and software development foundation.' } },
  { type: 'certificate', title: 'AI for All', order: 1, data: { issuer: 'Intel & Skill India', date: '2026', credentialUrl: '' } },
  { type: 'blog', title: 'How I Build MERN Apps', order: 1, data: { excerpt: 'A practical note on frontend, backend, database, and deployment flow.', content: 'Write your article from the dashboard and publish it instantly.', coverImage: '' } },
  { type: 'service', title: 'Full Stack Web Apps', order: 1, data: { description: 'Complete MERN applications with admin panels, APIs, authentication, and deployment setup.', icon: 'Code' } },
  { type: 'testimonial', title: 'Client Feedback', order: 1, data: { quote: 'Professional, fast, and focused on clean implementation.', name: 'Project Partner', role: 'Collaborator', avatar: '' } },
  { type: 'contactInfo', title: 'Contact Information', order: 1, data: { email: 'admin@example.com', phone: '', location: 'Delhi, India' } },
  { type: 'resume', title: 'Resume', order: 1, data: { url: '/resume.pdf', label: 'Download Resume' } },
  { type: 'socialLink', title: 'GitHub', order: 1, data: { platform: 'GitHub', url: 'https://github.com/' } },
  { type: 'socialLink', title: 'LinkedIn', order: 2, data: { platform: 'LinkedIn', url: 'https://linkedin.com/' } },
  { type: 'seo', title: 'Default SEO', order: 1, data: { title: 'Mohd Zaid - Full Stack Developer', description: 'MERN stack developer portfolio and CMS.', keywords: 'MERN, React, Node, MongoDB, Portfolio' } },
  { type: 'siteText', title: 'Section Titles', order: 1, data: { workEyebrow: 'Selected Work', workTitle: "Projects I've *designed & shipped*", workSubtitle: 'A mix of full-stack apps, dashboards, and interfaces — click any project for details.', skillsEyebrow: 'Toolbox', skillsTitle: 'Skills & *technologies*', servicesEyebrow: 'What I Do', servicesTitle: 'Services I *offer*', aboutEyebrow: 'About Me', aboutTitle: 'My journey so far', testimonialsEyebrow: 'Testimonials', testimonialsTitle: "Kind words from *people I've worked with*", blogEyebrow: 'Writing', blogTitle: 'From the *blog*', contactEyebrow: 'Get in touch', contactTitle: "Let's build something *great together*", contactSubtitle: 'Have a project in mind or just want to say hi? My inbox is always open.', experienceTitle: 'Experience', educationTitle: 'Education & Certificates', liveLabel: 'Live Demo', codeLabel: 'Code', detailsLabel: 'Details', featuredLabel: 'Featured', readMoreLabel: 'Read more' } },
  { type: 'siteSetting', title: 'Brand Settings', order: 1, data: { siteName: 'Mohd Zaid', logoText: 'MZ', accentColor: '#5a63e0', ctaText: 'Hire Me', footerText: 'Designed & built by Mohd Zaid with the MERN stack.' } },
]

async function seed() {
  assertEnv()
  await connectDb()

  const existingAdmin = await User.findOne({ email: admin.email })
  if (!existingAdmin) {
    await User.create(admin)
    console.log(`Created admin: ${admin.email}`)
  } else {
    console.log(`Admin already exists: ${admin.email}`)
  }

  // The {type, slug} index is unique, but upserts don't run the model's pre-save
  // slug hook — so without this every seeded item would insert with slug=null and
  // the second item of any type (e.g. the 2nd stat) collides with E11000. Build a
  // slug that is unique within its type, mirroring the create route.
  const usedSlugs = {}
  const seedSlug = (type, title) => {
    const taken = (usedSlugs[type] ||= new Set())
    const root = slugify(title, { lower: true, strict: true }) || 'item'
    let slug = root
    let n = 2
    while (taken.has(slug)) slug = `${root}-${n++}`
    taken.add(slug)
    return slug
  }

  for (const item of items) {
    await modelForType(item.type).updateOne(
      { ...scopeForType(item.type), title: item.title },
      { $setOnInsert: { ...item, slug: seedSlug(item.type, item.title) } },
      { upsert: true }
    )
  }

  if ((await Message.countDocuments()) === 0) {
    await Message.create({
      name: 'Demo Lead',
      email: 'lead@example.com',
      subject: 'Portfolio inquiry',
      message: 'I would like to discuss a MERN project with you.',
    })
  }

  console.log('Seed complete')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
