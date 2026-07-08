import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { env } from './env.js'

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const isPdf = file.mimetype === 'application/pdf'

    return {
      folder: env.cloudinary.folder,
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: isPdf
        ? ['pdf']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
    }
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
})

export { cloudinary }
