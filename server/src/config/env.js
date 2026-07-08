import dotenv from 'dotenv'
import path from 'path'

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') })

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'portfolio-cms',
  },
}

export function assertEnv() {
  const required = ['mongoUri', 'jwtSecret']
  const missing = required.filter((key) => !env[key])

  if (missing.length) {
    throw new Error(`Missing required env values: ${missing.join(', ')}`)
  }

  if (env.jwtSecret === 'change-this-secret') {
    throw new Error('JWT_SECRET is still the insecure default. Set a long random value in .env')
  }

  // Non-fatal warnings so the app still boots, but the operator is aware.
  const warn = []
  if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) warn.push('JWT_SECRET is short for production (use 32+ chars)')
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) warn.push('Cloudinary keys missing — image uploads will be disabled')
  if (warn.length) {
    // eslint-disable-next-line no-console
    console.warn('⚠ Config warnings:\n  - ' + warn.join('\n  - '))
  }
}
