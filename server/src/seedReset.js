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
  // { type: 'hero', title: 'Mohd Zaid', order: 1, featured: true, data: { badge: 'Available for freelance & full-time', eyebrow: 'Full Stack Developer', headline: 'I build premium MERN products with clean UX and strong backends.', roles: ['Full Stack Developer', 'MERN Specialist', 'React Engineer', 'API Builder'], description: 'A portfolio CMS built like a product: fast public pages, secure admin controls, editable content, image uploads, and deployment-ready architecture.', primaryCta: 'View Projects', secondaryCta: 'Contact Me', floatOne: 'Clean Code', floatTwo: 'Fast Delivery', image: 'https://res-console.cloudinary.com/uvxhwkuo/thumbnails/v1/image/upload/v1783331204/cG9ydGZvbGlvLWNtcy9wcm9maWxl/preview' } },
  {
    type: 'hero',
    title: 'Mohd Zaid',
    order: 1,
    featured: true,
    data: {
      badge: 'Open to Full-Time & Internship Opportunities',
      eyebrow: 'Full Stack MERN Developer',
      // headline: 'Building modern, scalable, and user-focused web applications with the MERN stack.',
      headline: 'Building modern MERN web applications.',
      roles: [
        'Full Stack Developer',
        'MERN Stack Developer',
        'React Developer',
        'Node.js Developer'
      ],
      description:
        "I'm a BCA final semester student at IGNOU and a Full Stack MERN Developer Intern at Humanoid Maker. I enjoy building responsive user interfaces, secure backend APIs, and scalable web applications using React, Node.js, Express.js, and MongoDB.",
      primaryCta: 'View Projects',
      secondaryCta: 'Contact Me',
      floatOne: 'MERN Stack',
      floatTwo: 'Clean Code',
      image: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783331204/portfolio-cms/profile'
    }
  },
  // { type: 'stat', title: '9+', order: 1, data: { value: '9+', label: 'Projects Shipped' } },
  // { type: 'stat', title: '20+', order: 2, data: { value: '20+', label: 'Technologies' } },
  // { type: 'stat', title: '15+', order: 3, data: { value: '15+', label: 'Happy Clients' } },
  // { type: 'stat', title: '100%', order: 4, data: { value: '100%', label: 'Commitment' } },
  { type: 'stat', title: '8+', order: 1, data: { value: '8+', label: 'Projects Completed' } },
  { type: 'stat', title: '15+', order: 2, data: { value: '15+', label: 'Technologies' } },
  { type: 'stat', title: '1', order: 3, data: { value: '1', label: 'Internship' } },
  { type: 'stat', title: '100%', order: 4, data: { value: '100%', label: 'Dedication' } },
  // { type: 'about', title: 'About', order: 1, data: { summary: 'Full Stack Developer focused on React, Node.js, Express, MongoDB, authentication, REST APIs, and responsive product interfaces.', highlights: ['MERN stack development', 'Admin dashboards and CMS systems', 'Clean UI with production-ready APIs'] } },
  {
    type: 'about',
    title: 'About',
    order: 1,
    data: {
      summary:
        "I'm a Full Stack MERN Developer with a strong interest in building modern, responsive, and scalable web applications. I have completed my Bachelor of Computer Applications (BCA) examinations at IGNOU and am currently awaiting the final results. During my internship at Humanoid Maker, I worked on real-world MERN applications, focusing on clean architecture, secure backend APIs, and intuitive user experiences. I'm passionate about continuous learning and enjoy turning ideas into production-ready solutions.",
      highlights: [
        'Full Stack MERN Development',
        'React.js & Node.js',
        'REST APIs & Authentication',
        'MongoDB & Mongoose',
        'Admin Dashboards & CMS',
        'Responsive UI Development'
      ]
    }
  },
  // { type: 'skill', title: 'Frontend', order: 1, data: { level: 'Advanced', skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Responsive UI'] } },
  // { type: 'skill', title: 'Backend', order: 2, data: { level: 'Advanced', skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'REST APIs'] } },
  {
    type: 'skill',
    title: 'Frontend',
    order: 1,
    data: {
      level: 'Proficient',
      skills: [
        'React.js',
        'JavaScript (ES6+)',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'Vite',
        'React Router',
        'Redux Toolkit'
      ]
    }
  }, {
    type: 'skill',
    title: 'Backend',
    order: 2,
    data: {
      level: 'Proficient',
      skills: [
        'Node.js',
        'Express.js',
        'MongoDB',
        'Mongoose',
        'REST APIs',
        'JWT Authentication',
        'Firebase Authentication',
        'Cloudinary',
        'Resend',
        'MongoDB Atlas',
        'Render',
        'Vercel'
      ]
    }
  },
  // { type: 'project', title: 'NoteGenie', order: 1, featured: true, data: { description: 'Study material marketplace and AI-powered notes platform.', image: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783331196/portfolio-cms/notegenie.png', stack: ['React', 'Node', 'MongoDB'], liveUrl: '', githubUrl: '' } },
  {
  type: 'project',
  title: 'NoteGenie',
  order: 1,
  featured: true,
  data: {
    description:
      'Built a full-stack MERN-based AI-powered digital study marketplace where students can discover, purchase, and manage notes, books, assignments, academic projects, and help books. The platform features secure JWT authentication, email verification and password recovery using Resend, category-based browsing, advanced search and filtering, shopping cart, secure checkout, order management, an admin dashboard, AI-powered note generation, an intelligent chat assistant, note summarization, flashcard generation, and a responsive user experience.',
    image: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783331196/portfolio-cms/notegenie.png',
    stack: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'JWT',
      'Razorpay',
      'Gemini AI',
      'Resend',
      'Vercel',
      'Render'
    ],
    liveUrl: '',
    githubUrl: ''
  }
},{
  type: 'project',
  title: 'NexaMart',
  order: 2,
  featured: true,
  data: {
    description:
      'Built a full-featured MERN e-commerce platform with 70+ product listings, featuring advanced search and filtering, shopping cart, wishlist, secure checkout (Razorpay & Cash on Delivery), order tracking, returns, invoicing, and inventory management. Implemented JWT authentication, OTP verification via Gmail SMTP, and role-based access control for secure user and admin operations. Deployed the application using Vercel and Render with a scalable production-ready architecture.',
    image: '',
    stack: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'JWT',
      'Razorpay',
      'Nodemailer',
      'Vercel',
      'Render'
    ],
    liveUrl: '',
    githubUrl: ''
  }
},
  
  
  // { type: 'experience', title: 'Full Stack MERN Developer Intern', order: 1, data: { company: 'Humanoid Maker', period: '2026', description: 'Frontend and backend development for real-world MERN applications.', points: ['REST API integration', 'Authentication flows', 'Responsive UI implementation'] } },
  {
  type: 'experience',
  title: 'Full Stack MERN Developer Intern',
  order: 1,
  data: {
    company: 'Humanoid Maker',
    period: 'May 2026 – Present',
    description:
      'Working as a Full Stack MERN Developer Intern, contributing to the development of modern web applications with a focus on responsive user interfaces, secure backend systems, and scalable application architecture.',
    points: [
      'Developing responsive user interfaces using React.js and Tailwind CSS.',
      'Building and integrating RESTful APIs with Node.js, Express.js, and MongoDB.',
      'Implementing secure authentication using JWT and Firebase Authentication.',
      'Integrating Cloudinary for media management and Resend for email services.',
      'Collaborating with the team using Git and GitHub while following clean coding practices.'
    ]
  }
},
  // { type: 'education', title: 'Bachelor of Computer Applications', order: 1, data: { institution: 'IGNOU, Delhi', period: '2023 - 2026', description: 'Computer applications and software development foundation.' } },
  {
  type: 'education',
  title: 'Bachelor of Computer Applications (BCA)',
  order: 1,
  data: {
    institution: 'Indira Gandhi National Open University (IGNOU), New Delhi',
    period: '2023 – 2026',
    description:
      'Completed the Bachelor of Computer Applications (BCA) program with a focus on programming, database management, software engineering, web development, and computer science fundamentals. Final semester examinations completed; result awaited.'
  }
},
  // { type: 'certificate', title: 'AI for All', order: 1, data: { issuer: 'Intel & Skill India', date: '2026', credentialUrl: 'https://api-fe.skillindiadigital.gov.in/api/registry-course/getCertificatePresignedUrl/2025071498400587-6606b92d-c73a-458d-94f4-ad5ff5fff177' } },
  {
  type: 'certificate',
  title: 'AI for All',
  order: 1,
  data: {
    issuer: 'Intel & Skill India',
    date: 'Jul 2025',
    credentialUrl: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783509362/AI_For_All_zduudf.pdf'
  }
},

{
  type: 'certificate',
  title: 'Program in Cyber Awareness AI Basic',
  order: 2,
  data: {
    issuer: 'NIIT Foundation & Skill India',
    date: 'Jul 2025',
    credentialUrl: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783509361/program_in_cyber_awareness_ai_basics_jklrqh.pdf'
  }
},

{
  type: 'certificate',
  title: 'Exploring Computers',
  order: 3,
  data: {
    issuer: 'Infosys Springboard',
    date: 'Jul 2025',
    credentialUrl: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783509361/Exploring_Computers_kzlldf.pdf'
  }
},

{
  type: 'certificate',
  title: 'Freedom Employability Academy',
  order: 4,
  data: {
    issuer: 'Freedom Employability Academy',
    date: 'Oct 2025',
    credentialUrl: 'https://res.cloudinary.com/uvxhwkuo/image/upload/v1783509362/FEA_nbp9ft.pdf'
  }
},
  // { type: 'blog', title: 'How I Build MERN Apps', order: 1, data: { excerpt: 'A practical note on frontend, backend, database, and deployment flow.', content: 'Write your article from the dashboard and publish it instantly.', coverImage: '' } },
  {
  type: 'blog',
  title: 'Building Scalable MERN Applications',
  order: 1,
  data: {
    excerpt: 'Key practices I follow to build secure, scalable, and maintainable MERN applications.',
    content: 'In this article, I share my approach to developing MERN applications, including project structure, authentication, API design, database modeling, and deployment. These practices help me write clean, maintainable, and production-ready code.',
    coverImage: ''
  }
},
{
  type: 'blog',
  title: 'Getting Started with React and Node.js',
  order: 2,
  data: {
    excerpt: 'A beginner-friendly guide to building your first full-stack web application.',
    content: 'This article covers the fundamentals of building a full-stack application using React.js, Node.js, Express.js, and MongoDB. It explains project setup, routing, REST APIs, authentication, and deployment in a simple and practical way.',
    coverImage: ''
  }
},
  // { type: 'service', title: 'Full Stack Web Apps', order: 1, data: { description: 'Complete MERN applications with admin panels, APIs, authentication, and deployment setup.', icon: 'Code' } },
  {
  type: 'service',
  title: 'MERN Stack Development',
  order: 1,
  data: {
    description: 'Build fast, secure, and scalable full-stack web applications using React, Node.js, Express.js, and MongoDB.',
    icon: 'Code'
  }
},
{
  type: 'service',
  title: 'AI-Powered Applications',
  order: 2,
  data: {
    description: 'Add AI features like chat assistants, content generation, note summaries, and flashcards to modern web applications.',
    icon: 'Sparkles'
  }
},
{
  type: 'service',
  title: 'REST API Development',
  order: 3,
  data: {
    description: 'Design and develop secure REST APIs with authentication, authorization, and database integration.',
    icon: 'Server'
  }
},
{
  type: 'service',
  title: 'Admin Dashboard Development',
  order: 4,
  data: {
    description: 'Create powerful admin panels for managing users, products, orders, content, and application settings.',
    icon: 'LayoutDashboard'
  }
},
{
  type: 'service',
  title: 'Deployment & Support',
  order: 5,
  data: {
    description: 'Deploy applications on Vercel and Render with proper environment configuration and ongoing maintenance.',
    icon: 'Rocket'
  }
},
  // { type: 'testimonial', title: 'Client Feedback', order: 1, data: { quote: 'Professional, fast, and focused on clean implementation.', name: 'Project Partner', role: 'Collaborator', avatar: '' } },
  // { type: 'contactInfo', title: 'Contact Information', order: 1, data: { email: 'admin@example.com', phone: '', location: 'Delhi, India' } },
  {
  type: 'contactInfo',
  title: 'Contact Information',
  order: 1,
  data: {
    email: 'zaidm1323@gmail.com',
    phone: '+91 9999201255',
    location: 'New Delhi, India'
  }
},
  // { type: 'resume', title: 'Resume', order: 1, data: { url: '/resume.pdf', label: 'Download Resume' } },
  {
  type: 'resume',
  title: 'Resume',
  order: 1,
  data: {
    url: 'https://res.cloudinary.com/uvxhwkuo/raw/upload/v1783331207/portfolio-cms/resume.pdf',
    label: 'Download Resume'
  }
},
  // { type: 'socialLink', title: 'GitHub', order: 1, data: { platform: 'GitHub', url: 'https://github.com/' } },
  // { type: 'socialLink', title: 'LinkedIn', order: 2, data: { platform: 'LinkedIn', url: 'https://linkedin.com/' } },
  {
  type: 'socialLink',
  title: 'GitHub',
  order: 1,
  data: {
    platform: 'GitHub',
    url: 'https://github.com/zaid154'
  }
},
{
  type: 'socialLink',
  title: 'LinkedIn',
  order: 2,
  data: {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mohd-zaid-794090231/'
  }
},
{
  type: 'socialLink',
  title: 'Email',
  order: 3,
  data: {
    platform: 'Email',
    url: 'mailto:zaidm1323@gmail.com'
  }
},
  // { type: 'seo', title: 'Default SEO', order: 1, data: { title: 'Mohd Zaid - Full Stack Developer', description: 'MERN stack developer portfolio and CMS.', keywords: 'MERN, React, Node, MongoDB, Portfolio' } },
  {
  type: 'seo',
  title: 'Default SEO',
  order: 1,
  data: {
    title: 'Mohd Zaid | Full Stack MERN Developer',
    description: 'Portfolio of Mohd Zaid, a Full Stack MERN Developer showcasing modern web applications, AI-powered solutions, REST APIs, admin dashboards, and scalable full-stack projects built with React.js, Node.js, Express.js, and MongoDB.',
    keywords: 'Mohd Zaid, Full Stack Developer, MERN Stack Developer, React.js, Node.js, Express.js, MongoDB, JavaScript, AI Integration, Portfolio, Web Developer'
  }
},
  // { type: 'siteText', title: 'Section Titles', order: 1, data: { workEyebrow: 'Selected Work', workTitle: "Projects I've *designed & shipped*", workSubtitle: 'A mix of full-stack apps, dashboards, and interfaces — click any project for details.', skillsEyebrow: 'Toolbox', skillsTitle: 'Skills & *technologies*', servicesEyebrow: 'What I Do', servicesTitle: 'Services I *offer*', aboutEyebrow: 'About Me', aboutTitle: 'My journey so far', testimonialsEyebrow: 'Testimonials', testimonialsTitle: "Kind words from *people I've worked with*", blogEyebrow: 'Writing', blogTitle: 'From the *blog*', contactEyebrow: 'Get in touch', contactTitle: "Let's build something *great together*", contactSubtitle: 'Have a project in mind or just want to say hi? My inbox is always open.', experienceTitle: 'Experience', educationTitle: 'Education & Certificates', liveLabel: 'Live Demo', codeLabel: 'Code', detailsLabel: 'Details', featuredLabel: 'Featured', readMoreLabel: 'Read more' } },
  {
  type: 'siteText',
  title: 'Section Titles',
  order: 1,
  data: {
    workEyebrow: 'Projects',
    workTitle: 'Featured *Projects*',
    workSubtitle: 'A collection of full-stack applications, AI-powered solutions, and modern web experiences built using the MERN stack.',

    skillsEyebrow: 'Skills',
    skillsTitle: 'Technologies I *Work With*',

    servicesEyebrow: 'Services',
    servicesTitle: 'What I *Build*',

    aboutEyebrow: 'About',
    aboutTitle: 'Know More *About Me*',

    testimonialsEyebrow: 'Testimonials',
    testimonialsTitle: 'What People *Say*',

    blogEyebrow: 'Blog',
    blogTitle: 'Latest *Articles*',

    contactEyebrow: 'Contact',
    contactTitle: "Let's *Connect*",
    contactSubtitle:
      'Have a project, an idea, or an opportunity? Feel free to get in touch.',

    experienceTitle: 'Experience',
    educationTitle: 'Education & Certifications',

    liveLabel: 'Live Demo',
    codeLabel: 'Source Code',
    detailsLabel: 'View Details',
    featuredLabel: 'Featured',
    readMoreLabel: 'Read More'
  }
},
  // { type: 'siteSetting', title: 'Brand Settings', order: 1, data: { siteName: 'Mohd Zaid', logoText: 'MZ', accentColor: '#5a63e0', ctaText: 'Hire Me', footerText: 'Designed & built by Mohd Zaid with the MERN stack.' } },
  {
  type: 'siteSetting',
  title: 'Brand Settings',
  order: 1,
  data: {
    siteName: 'Mohd Zaid',
    logoText: 'MZ',
    accentColor: '#5A63E0',
    ctaText: 'Get In Touch',
    footerText: '© 2026 Mohd Zaid. Built with React, Node.js, Express.js, and MongoDB.'
  }
},
]

async function seedReset() {
  assertEnv()
  await connectDb()

  const existingAdmin = await User.findOne({ email: admin.email })
  if (!existingAdmin) {
    await User.create(admin)
    console.log(`Created admin: ${admin.email}`)
  } else {
    console.log(`Admin already exists: ${admin.email}`)
  }

  // Clear existing content for every type present in `items` before reseeding,
  // so we always insert fresh instead of skip-if-exists (upsert).
  const types = [...new Set(items.map((i) => i.type))]
  for (const type of types) {
    const { deletedCount } = await modelForType(type).deleteMany(scopeForType(type))
    if (deletedCount) console.log(`Deleted ${deletedCount} existing "${type}" item(s)`)
  }

  // Slug must be unique within its type — build one manually since a plain create()
  // loop still needs to avoid collisions (e.g. the 2nd "stat", 2nd "socialLink").
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
    await modelForType(item.type).create({
      ...item,
      ...scopeForType(item.type),
      slug: seedSlug(item.type, item.title),
    })
  }
  console.log(`Inserted ${items.length} content item(s)`)

  // Reset demo message too, so re-running this script always leaves one fresh lead.
  // If you want to keep real contact-form submissions, delete this block and use
  // the "only insert if none exist" check instead.
  await Message.deleteMany({})
  await Message.create({
    name: 'Demo Lead',
    email: 'lead@example.com',
    subject: 'Portfolio inquiry',
    message: 'I would like to discuss a MERN project with you.',
  })

  console.log('Seed reset complete')
  process.exit(0)
}

seedReset().catch((error) => {
  console.error(error)
  process.exit(1)
})