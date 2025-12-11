import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const folder = formData.get('folder') as string || 'travel-agency'
    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await uploadImage(buffer, folder)

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
      },
    })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    
    let errorMessage = error.message || 'Failed to upload image'
    
    // Provide helpful error messages for common Cloudinary errors
    if (error.message?.includes('Invalid Signature')) {
      errorMessage = 'Invalid Cloudinary API Secret. Please check your API Secret in Admin Settings and ensure it matches your API Key.'
    } else if (error.message?.includes('Invalid api_key')) {
      errorMessage = 'Invalid Cloudinary API Key. Please check your API Key in Admin Settings.'
    } else if (error.message?.includes('credentials not configured')) {
      errorMessage = 'Cloudinary credentials not configured. Please configure them in Admin Settings → Cloudinary Configuration.'
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

