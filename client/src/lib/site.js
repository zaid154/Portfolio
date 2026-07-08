// Content type schema used by the admin CMS editor.
export const contentTypes = [
  { key: 'hero', label: 'Hero', singleton: true, desc: 'The big banner at the very top of your site (headline, photo, buttons).', fields: ['badge', 'eyebrow', 'headline', 'roles', 'description', 'primaryCta', 'secondaryCta', 'floatOne', 'floatTwo', 'image'] },
  { key: 'stat', label: 'Stats Counter', desc: 'The animated number cards (e.g. "9+ Projects", "100% Commitment").', fields: ['value', 'label'] },
  { key: 'about', label: 'About', singleton: true, desc: 'Your intro summary and highlight points in the About section.', fields: ['summary', 'highlights'] },
  { key: 'skill', label: 'Skills', desc: 'Skill groups with a progress bar and a list of technologies.', fields: ['level', 'skills'] },
  { key: 'project', label: 'Projects', desc: 'Your portfolio projects — screenshot, description, tech, and links.', fields: ['description', 'image', 'stack', 'liveUrl', 'githubUrl'] },
  { key: 'experience', label: 'Experience', desc: 'Your work history shown in the timeline.', fields: ['company', 'period', 'description', 'points'] },
  { key: 'education', label: 'Education', desc: 'Your degrees and studies shown in the timeline.', fields: ['institution', 'period', 'description'] },
  { key: 'certificate', label: 'Certificates', desc: 'Certifications shown alongside education (with an optional logo + link).', fields: ['issuer', 'date', 'credentialUrl', 'image'] },
  { key: 'blog', label: 'Blogs', desc: 'Blog / article cards (click opens a reader with the full content).', fields: ['excerpt', 'content', 'coverImage', 'link'] },
  { key: 'service', label: 'Services', desc: 'The services you offer (cards with an icon).', fields: ['description', 'icon'] },
  { key: 'testimonial', label: 'Testimonials', desc: 'Quotes from clients and collaborators.', fields: ['quote', 'name', 'role', 'avatar'] },
  { key: 'contactInfo', label: 'Contact Info', singleton: true, desc: 'Your email, phone and location in the Contact section.', fields: ['email', 'phone', 'location'] },
  { key: 'resume', label: 'Resume', singleton: true, desc: 'The résumé download button (PDF and label).', fields: ['url', 'label'] },
  { key: 'socialLink', label: 'Social Links', desc: 'Your GitHub, LinkedIn, email etc. (nav, contact, footer).', fields: ['platform', 'url'] },
  { key: 'seo', label: 'SEO', singleton: true, desc: 'Browser tab title and search-engine description.', fields: ['title', 'description', 'keywords'] },
  { key: 'siteText', label: 'Section Titles', singleton: true, desc: 'Every section heading, eyebrow and button label on the site. Wrap text in *asterisks* to highlight it in the brand gradient.', fields: ['workEyebrow', 'workTitle', 'workSubtitle', 'skillsEyebrow', 'skillsTitle', 'servicesEyebrow', 'servicesTitle', 'aboutEyebrow', 'aboutTitle', 'testimonialsEyebrow', 'testimonialsTitle', 'blogEyebrow', 'blogTitle', 'contactEyebrow', 'contactTitle', 'contactSubtitle', 'experienceTitle', 'educationTitle', 'liveLabel', 'codeLabel', 'detailsLabel', 'featuredLabel', 'readMoreLabel'] },
  { key: 'siteSetting', label: 'Site Settings', singleton: true, desc: 'Brand name, logo photo, accent color and the nav button text.', fields: ['siteName', 'logoText', 'logoImage', 'accentColor', 'ctaText', 'footerText'] },
]

// Rich fallback content so the site looks complete even before MongoDB is connected.
export const fallbackSite = {
  hero: [
    {
      _id: 'demo-hero',
      title: 'Mohd Zaid',
      data: {
        badge: 'Available for freelance & full-time',
        eyebrow: 'Full Stack Developer',
        headline: 'I build fast, premium web products end to end.',
        roles: ['Full Stack Developer', 'MERN Specialist', 'React Engineer', 'API Builder'],
        description:
          'MERN developer crafting polished interfaces, secure REST APIs, and WordPress-style admin dashboards — this very site is powered by a real CMS I built.',
        primaryCta: 'View My Work',
        secondaryCta: 'Get in Touch',
        floatOne: 'Clean Code',
        floatTwo: 'Fast Delivery',
        image: '/images/profile.jpg',
      },
    },
  ],
  stat: [
    { _id: 'stat-1', title: '9+', data: { value: '9+', label: 'Projects Shipped' } },
    { _id: 'stat-2', title: '20+', data: { value: '20+', label: 'Technologies' } },
    { _id: 'stat-3', title: '15+', data: { value: '15+', label: 'Happy Clients' } },
    { _id: 'stat-4', title: '100%', data: { value: '100%', label: 'Commitment' } },
  ],
  about: [
    {
      _id: 'demo-about',
      title: 'About',
      data: {
        summary:
          "I'm a Full Stack Developer focused on the MERN stack. I love turning ideas into shippable products — clean React front-ends, robust Node/Express APIs, and MongoDB data models, all wired together with authentication, uploads, and deployment.",
        highlights: [
          'Production-ready React & component systems',
          'Secure Express APIs with JWT & validation',
          'CMS dashboards, Cloudinary uploads & deployment',
        ],
      },
    },
  ],
  skill: [
    { _id: 'skill-1', title: 'Frontend', order: 1, data: { level: '90', skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Framer Motion', 'Vite'] } },
    { _id: 'skill-2', title: 'Backend', order: 2, data: { level: '85', skills: ['Node.js', 'Express', 'REST APIs', 'JWT Auth', 'Zod'] } },
    { _id: 'skill-3', title: 'Database & Cloud', order: 3, data: { level: '80', skills: ['MongoDB', 'Mongoose', 'Cloudinary', 'Render', 'Vercel'] } },
    { _id: 'skill-4', title: 'Tooling', order: 4, data: { level: '75', skills: ['Git', 'GitHub', 'Postman', 'VS Code', 'Figma'] } },
  ],
  project: [
    { _id: 'project-1', title: 'NexaMart', order: 1, featured: true, data: { description: 'Full-stack e-commerce platform with cart, checkout, orders, and an admin catalog manager.', image: '/images/nexamart.png', stack: ['React', 'Node', 'MongoDB', 'Stripe'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-2', title: 'Portfolio CMS', order: 2, featured: true, data: { description: 'WordPress-style MERN portfolio with a secure dashboard to edit every section, upload media, and manage messages.', image: '/images/portfolio.png', stack: ['MERN', 'JWT', 'Cloudinary'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-3', title: 'NoteGenie', order: 3, featured: true, data: { description: 'AI-assisted study notes marketplace with a modern dashboard and content search.', image: '/images/notegenie.png', stack: ['React', 'Node', 'MongoDB'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-4', title: 'YumRun', order: 4, featured: true, data: { description: 'Food delivery UI concept with live cart, restaurant browsing, and smooth motion.', image: '/images/yumrun.png', stack: ['React', 'Framer Motion'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-5', title: 'Natifix', order: 5, data: { description: 'Service-booking landing and dashboard for a local repair startup.', image: '/images/Natifix.png', stack: ['React', 'Express'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-6', title: 'Proposal Generator', order: 6, data: { description: 'Client proposal builder that exports clean, branded PDFs.', image: '/images/proposal.png', stack: ['React', 'Node'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-7', title: 'Task Flow', order: 7, data: { description: 'Minimal to-do and task board with drag-free quick actions and persistence.', image: '/images/todo.png', stack: ['React', 'LocalStorage'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-8', title: 'Calc Pro', order: 8, data: { description: 'Responsive calculator with keyboard support and theme-aware UI.', image: '/images/calculator.png', stack: ['JavaScript', 'CSS'], liveUrl: '#', githubUrl: '#' } },
    { _id: 'project-9', title: 'Arcade Game', order: 9, data: { description: 'Browser mini-game built with the canvas API and tight game-loop logic.', image: '/images/game.png', stack: ['JavaScript', 'Canvas'], liveUrl: '#', githubUrl: '#' } },
  ],
  service: [
    { _id: 'service-1', title: 'Full Stack Web Apps', data: { icon: 'Layers', description: 'End-to-end MERN applications with auth, dashboards, APIs, and deployment.' } },
    { _id: 'service-2', title: 'Frontend Engineering', data: { icon: 'MonitorSmartphone', description: 'Pixel-accurate, responsive React interfaces with smooth motion and accessibility.' } },
    { _id: 'service-3', title: 'REST API & Backend', data: { icon: 'Server', description: 'Secure Node/Express APIs, MongoDB modeling, validation, and integrations.' } },
    { _id: 'service-4', title: 'CMS & Admin Panels', data: { icon: 'LayoutDashboard', description: 'Editable, WordPress-style dashboards so clients manage content without code.' } },
  ],
  testimonial: [
    { _id: 'test-1', title: 'Project Partner', data: { quote: 'Zaid ships clean, well-structured code fast and thinks like a product engineer. The admin panel he built saved us hours every week.', name: 'A. Rahman', role: 'Startup Founder', avatar: '' } },
    { _id: 'test-2', title: 'Client', data: { quote: 'Great communication and a strong eye for UI detail. The site felt premium from day one.', name: 'S. Kapoor', role: 'Agency Lead', avatar: '' } },
    { _id: 'test-3', title: 'Collaborator', data: { quote: 'Reliable full-stack partner — backend, frontend, and deployment all handled end to end.', name: 'M. Verma', role: 'Product Manager', avatar: '' } },
  ],
  experience: [
    { _id: 'exp-1', title: 'Full Stack MERN Developer Intern', order: 1, data: { company: 'Humanoid Maker', period: '2025 — Present', description: 'Building real-world e-commerce features and backend integrations across the MERN stack.', points: ['Shipped REST API integrations', 'Built auth & dashboard flows', 'Implemented responsive UIs'] } },
    { _id: 'exp-2', title: 'Freelance Web Developer', order: 2, data: { company: 'Self-employed', period: '2024 — 2025', description: 'Delivered portfolios, landing pages, and small full-stack apps for clients.', points: ['Client CMS dashboards', 'Deployment on Render & Vercel'] } },
  ],
  education: [
    { _id: 'edu-1', title: 'Bachelor of Computer Applications', order: 1, data: { institution: 'IGNOU, Delhi', period: '2023 — 2026', description: 'Computer applications and software development foundation.' } },
  ],
  certificate: [
    { _id: 'cert-1', title: 'AI for All', data: { issuer: 'Intel & Skill India', date: '2026', credentialUrl: '#' } },
    { _id: 'cert-2', title: 'Full Stack Web Development', data: { issuer: 'Online Certification', date: '2025', credentialUrl: '#' } },
  ],
  blog: [
    { _id: 'blog-1', title: 'Building a WordPress-style CMS with the MERN stack', data: { excerpt: 'How I designed editable content types, media uploads, and a secure admin dashboard.', content: 'Full article coming soon — publish yours from the dashboard.', coverImage: '/images/portfolio.png' } },
    { _id: 'blog-2', title: 'Fixing Express 5 middleware gotchas', data: { excerpt: 'The read-only req.query trap and how to sanitize input without crashing.', content: 'Full article coming soon.', coverImage: '/images/nexamart.png' } },
    { _id: 'blog-3', title: 'Smooth React animations with Framer Motion', data: { excerpt: 'Scroll reveals, staggered lists, and motion that feels premium — not distracting.', content: 'Full article coming soon.', coverImage: '/images/yumrun.png' } },
  ],
  contactInfo: [
    { _id: 'contact-1', title: 'Contact', data: { email: 'humanoidmaker@gmail.com', phone: '', location: 'Delhi, India' } },
  ],
  resume: [
    { _id: 'resume-1', title: 'Resume', data: { url: '/resume.pdf', label: 'Download Résumé' } },
  ],
  socialLink: [
    { _id: 'social-1', title: 'GitHub', data: { platform: 'GitHub', url: 'https://github.com/' } },
    { _id: 'social-2', title: 'LinkedIn', data: { platform: 'LinkedIn', url: 'https://linkedin.com/' } },
    { _id: 'social-3', title: 'Email', data: { platform: 'Email', url: 'mailto:humanoidmaker@gmail.com' } },
  ],
  seo: [
    { _id: 'seo-1', title: 'Default SEO', data: { title: 'Mohd Zaid — Full Stack Developer', description: 'MERN developer building fast, polished web products with a real CMS.', keywords: 'MERN, React, Node, MongoDB, Portfolio, Full Stack Developer' } },
  ],
  siteText: [
    {
      _id: 'text-1',
      title: 'Section Titles',
      data: {
        workEyebrow: 'Selected Work',
        workTitle: "Projects I've *designed & shipped*",
        workSubtitle: 'A mix of full-stack apps, dashboards, and interfaces — click any project for details.',
        skillsEyebrow: 'Toolbox',
        skillsTitle: 'Skills & *technologies*',
        servicesEyebrow: 'What I Do',
        servicesTitle: 'Services I *offer*',
        aboutEyebrow: 'About Me',
        aboutTitle: 'My journey so far',
        testimonialsEyebrow: 'Testimonials',
        testimonialsTitle: "Kind words from *people I've worked with*",
        blogEyebrow: 'Writing',
        blogTitle: 'From the *blog*',
        contactEyebrow: 'Get in touch',
        contactTitle: "Let's build something *great together*",
        contactSubtitle: 'Have a project in mind or just want to say hi? My inbox is always open.',
        experienceTitle: 'Experience',
        educationTitle: 'Education & Certificates',
        liveLabel: 'Live Demo',
        codeLabel: 'Code',
        detailsLabel: 'Details',
        featuredLabel: 'Featured',
        readMoreLabel: 'Read more',
      },
    },
  ],
  siteSetting: [
    { _id: 'settings-1', title: 'Brand Settings', data: { siteName: 'Mohd Zaid', logoText: 'MZ', accentColor: '#7c5cff', ctaText: 'Hire Me', footerText: 'Designed & built by Mohd Zaid with the MERN stack.' } },
  ],
}

export const first = (site, key) => site[key]?.[0] || { title: '', data: {} }

// Read an editable label from the "Section Titles" (siteText) singleton, with a fallback.
export const text = (site, key, fallback = '') => {
  const v = first(site, 'siteText').data?.[key]
  return v === undefined || v === '' ? fallback : v
}

export const asArray = (value) =>
  Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
