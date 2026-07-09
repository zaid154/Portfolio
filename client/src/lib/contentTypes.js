// Admin CMS editor schema — the list of content types with their labels and
// editable fields. This is UI configuration for the dashboard form, NOT site
// content. All real content lives in the database (seeded via `npm run seed` or
// edited in the admin dashboard) and is fetched by useSite() in hooks.js.
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
  { key: 'siteText', label: 'Section Titles', singleton: true, desc: 'Every section heading, eyebrow, nav label, button and form label on the site. Wrap text in *asterisks* to highlight it in the brand gradient.', fields: ['workEyebrow', 'workTitle', 'workSubtitle', 'skillsEyebrow', 'skillsTitle', 'servicesEyebrow', 'servicesTitle', 'aboutEyebrow', 'aboutTitle', 'testimonialsEyebrow', 'testimonialsTitle', 'blogEyebrow', 'blogTitle', 'contactEyebrow', 'contactTitle', 'contactSubtitle', 'experienceTitle', 'educationTitle', 'liveLabel', 'codeLabel', 'detailsLabel', 'featuredLabel', 'readMoreLabel', 'viewCredentialLabel', 'navWork', 'navSkills', 'navServices', 'navAbout', 'navContact', 'navAdmin', 'contactEmailLabel', 'contactPhoneLabel', 'contactLocationLabel', 'formNameLabel', 'formNamePlaceholder', 'formEmailLabel', 'formEmailPlaceholder', 'formSubjectLabel', 'formSubjectPlaceholder', 'formMessageLabel', 'formMessagePlaceholder', 'formSendLabel', 'formSendingLabel', 'formSuccessMessage', 'syncingLabel'] },
  { key: 'siteSetting', label: 'Site Settings', singleton: true, desc: 'Brand name, logo photo, accent color and the nav button text.', fields: ['siteName', 'logoText', 'logoImage', 'accentColor', 'ctaText', 'footerText'] },
]
