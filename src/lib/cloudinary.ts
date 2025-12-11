import { v2 as cloudinary } from 'cloudinary'
import { prisma } from './prisma'

// Get Cloudinary config from database settings or environment variables
async function getCloudinaryConfig() {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ['cloudinaryCloudName', 'cloudinaryApiKey', 'cloudinaryApiSecret'],
        },
      },
    })

    const getSetting = (key: string, envKey: string, defaultValue: string = '') => {
      const setting = settings.find((s) => s.key === key)
      const value = (setting?.value as string) || process.env[envKey] || defaultValue
      // Trim whitespace to avoid signature errors
      return typeof value === 'string' ? value.trim() : value
    }

    const cloudName = getSetting('cloudinaryCloudName', 'CLOUDINARY_CLOUD_NAME')
    const apiKey = getSetting('cloudinaryApiKey', 'CLOUDINARY_API_KEY')
    const apiSecret = getSetting('cloudinaryApiSecret', 'CLOUDINARY_API_SECRET')

    // Log for debugging (without exposing secrets)
    if (process.env.NODE_ENV === 'development') {
      console.log('Cloudinary Config:', {
        cloud_name: cloudName ? `${cloudName.substring(0, 4)}...` : 'missing',
        api_key: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
        api_secret: apiSecret ? '***' : 'missing',
      })
    }

    return {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    }
  } catch (error) {
    console.error('Error fetching Cloudinary settings:', error)
    // Fallback to environment variables
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    }
  }
}

// Initialize with environment variables (fallback)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export async function uploadImage(file: File | Buffer, folder: string = 'travel-agency'): Promise<{
  public_id: string
  secure_url: string
}> {
  // Get config from database (if available)
  const config = await getCloudinaryConfig()
  
  // Validate config
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error('Cloudinary credentials not configured. Please configure them in Admin Settings.')
  }

  // Ensure no whitespace in credentials (common cause of signature errors)
  const cleanConfig = {
    cloud_name: config.cloud_name.trim(),
    api_key: config.api_key.trim(),
    api_secret: config.api_secret.trim(),
  }
  
  // Reconfigure with database settings
  cloudinary.config(cleanConfig)

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          })
        } else {
          reject(new Error('Upload failed'))
        }
      }
    )

    if (file instanceof File) {
      const arrayBuffer = file.arrayBuffer()
      arrayBuffer.then((buffer) => {
        uploadStream.end(Buffer.from(buffer))
      })
    } else {
      uploadStream.end(file)
    }
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    // Get config from database (if available)
    const config = await getCloudinaryConfig()
    
    // Validate config
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error('Cloudinary credentials not configured')
    }

    // Ensure no whitespace in credentials
    const cleanConfig = {
      cloud_name: config.cloud_name.trim(),
      api_key: config.api_key.trim(),
      api_secret: config.api_secret.trim(),
    }
    
    // Reconfigure with database settings
    cloudinary.config(cleanConfig)
    
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw error
  }
}

export { cloudinary }

