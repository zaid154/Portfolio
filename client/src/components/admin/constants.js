import {
  Mail, Search, Home, User, Code2, FolderGit2, Briefcase,
  GraduationCap, Award, PenLine, LayoutGrid, Quote, FileText, Share2, Settings, Type,
  BarChart3, FileStack,
} from 'lucide-react'

export const TOKEN_KEY = 'portfolio_admin_token'
export const MULTILINE = ['description', 'summary', 'content', 'quote', 'highlights', 'points', 'skills', 'stack', 'workSubtitle', 'contactSubtitle']
export const UPLOADABLE = ['image', 'coverImage', 'avatar', 'url', 'logoImage']
export const IMAGE_FIELDS = ['image', 'coverImage', 'avatar', 'logoImage']

export const TYPE_ICONS = {
  hero: Home, stat: BarChart3, about: User, skill: Code2, project: FolderGit2,
  experience: Briefcase, education: GraduationCap, certificate: Award, blog: PenLine,
  service: LayoutGrid, testimonial: Quote, contactInfo: Mail, resume: FileText,
  socialLink: Share2, seo: Search, siteText: Type, siteSetting: Settings,
}

// Where each section lives on the public site, for the "view on site" links.
export const TYPE_TO_ANCHOR = {
  hero: 'home', stat: 'home', about: 'about', skill: 'skills', project: 'work',
  experience: 'about', education: 'about', certificate: 'about', blog: 'blog',
  service: 'services', testimonial: '', contactInfo: 'contact', resume: 'home',
  socialLink: 'contact', seo: '', siteText: 'work', siteSetting: 'home',
}

export const FIELD_META = {
  badge: { label: 'Availability badge', hint: 'e.g. Available for freelance & full-time' },
  eyebrow: { label: 'Eyebrow', hint: 'Small label shown above the headline' },
  headline: { label: 'Headline', hint: 'Wrap part in *asterisks* to gradient-highlight it' },
  roles: { label: 'Rotating roles', hint: 'Comma separated — Full Stack Developer, React Engineer' },
  description: { label: 'Description' },
  primaryCta: { label: 'Primary button text', hint: 'e.g. View My Work' },
  secondaryCta: { label: 'Secondary button text', hint: 'e.g. Get in Touch (links to Contact)' },
  floatOne: { label: 'Floating badge 1', hint: 'e.g. Clean Code' },
  floatTwo: { label: 'Floating badge 2', hint: 'e.g. Fast Delivery' },
  image: { label: 'Image', hint: 'Upload a file or paste an image URL' },
  value: { label: 'Number', hint: 'e.g. 9+ or 100%' },
  label: { label: 'Label', hint: 'e.g. Projects Shipped' },
  summary: { label: 'Summary' },
  highlights: { label: 'Highlight points', hint: 'Comma separated (shown as ticks)' },
  level: { label: 'Level %', hint: 'A number 0–100 for the progress bar' },
  skills: { label: 'Skills', hint: 'Comma separated — React, Node, MongoDB' },
  stack: { label: 'Tech stack', hint: 'Comma separated — React, Node' },
  liveUrl: { label: 'Live demo link' },
  githubUrl: { label: 'GitHub link' },
  company: { label: 'Company' },
  period: { label: 'Period', hint: 'e.g. 2024 — Present' },
  points: { label: 'Bullet points', hint: 'Comma separated' },
  institution: { label: 'Institution' },
  issuer: { label: 'Issued by' },
  date: { label: 'Date' },
  credentialUrl: { label: 'Credential link' },
  excerpt: { label: 'Short excerpt' },
  content: { label: 'Full content', hint: 'Shown in the blog reader popup' },
  link: { label: 'External link', hint: 'If set, the card opens this URL instead of the reader' },
  coverImage: { label: 'Cover image', hint: 'Upload a file or paste a URL' },
  icon: { label: 'Icon name', hint: 'A Lucide icon — Layers, Server, Code2' },
  quote: { label: 'Quote' },
  name: { label: 'Person name' },
  role: { label: 'Role / title' },
  avatar: { label: 'Avatar', hint: 'Upload a file or paste a URL' },
  email: { label: 'Email' },
  phone: { label: 'Phone' },
  location: { label: 'Location' },
  url: { label: 'File / link', hint: 'Upload a PDF or paste a link' },
  platform: { label: 'Platform', hint: 'GitHub, LinkedIn or Email' },
  title: { label: 'Title' },
  keywords: { label: 'Keywords', hint: 'Comma separated' },
  siteName: { label: 'Site / brand name' },
  logoText: { label: 'Logo initials', hint: 'Fallback if no photo — e.g. MZ' },
  logoImage: { label: 'Logo photo (header)', hint: 'Upload your header photo' },
  accentColor: { label: 'Accent color', hint: 'Hex color — e.g. #7c5cff' },
  ctaText: { label: 'Nav button text', hint: 'e.g. Hire Me' },
  footerText: { label: 'Footer text' },
  // Section Titles (siteText)
  workEyebrow: { label: 'Work · eyebrow' }, workTitle: { label: 'Work · heading', hint: 'Wrap part in *asterisks* to highlight' }, workSubtitle: { label: 'Work · subtitle' },
  skillsEyebrow: { label: 'Skills · eyebrow' }, skillsTitle: { label: 'Skills · heading' },
  servicesEyebrow: { label: 'Services · eyebrow' }, servicesTitle: { label: 'Services · heading' },
  aboutEyebrow: { label: 'About · eyebrow' }, aboutTitle: { label: 'About · heading' },
  testimonialsEyebrow: { label: 'Testimonials · eyebrow' }, testimonialsTitle: { label: 'Testimonials · heading' },
  blogEyebrow: { label: 'Blog · eyebrow' }, blogTitle: { label: 'Blog · heading' },
  contactEyebrow: { label: 'Contact · eyebrow' }, contactTitle: { label: 'Contact · heading' }, contactSubtitle: { label: 'Contact · subtitle' },
  experienceTitle: { label: 'Timeline · Experience column' }, educationTitle: { label: 'Timeline · Education column' },
  liveLabel: { label: 'Button · Live demo' }, codeLabel: { label: 'Button · Code' }, detailsLabel: { label: 'Button · Details' },
  featuredLabel: { label: 'Badge · Featured' }, readMoreLabel: { label: 'Link · Read more' },
}

export const rowThumb = (item) => item.data?.image || item.data?.coverImage || item.data?.avatar || item.data?.logoImage
