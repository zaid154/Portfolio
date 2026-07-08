import { z } from 'zod'

const contentBody = z.object({
  type: z.string().min(2).max(60),
  title: z.string().min(1).max(180),
  slug: z.string().max(220).optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('published'),
  order: z.coerce.number().default(0),
  featured: z.coerce.boolean().default(false),
  data: z.record(z.string(), z.any()).default({}),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
})

export const contentSchema = z.object({ body: contentBody })

export const contentUpdateSchema = z.object({
  body: contentBody.partial().extend({
    data: z.record(z.string(), z.any()).optional(),
  }),
})

export const messageSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(2).max(160),
    message: z.string().min(10).max(4000),
    website: z.string().optional(), // honeypot — real users leave this empty
  }),
})

export const messageUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['new', 'read', 'archived']),
  }),
})
