import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing reCAPTCHA token' },
        { status: 400 }
      )
    }

    // Get reCAPTCHA secret key from settings
    const settings = await prisma.settings.findUnique({
      where: { key: 'recaptchaSecretKey' },
    })

    const secretKey = (settings?.value as string) || process.env.RECAPTCHA_SECRET_KEY || ''

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA not configured' },
        { status: 500 }
      )
    }

    // Verify token with Google
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    
    const response = await fetch(verificationUrl, {
      method: 'POST',
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA verification failed',
          details: data['error-codes'] || []
        },
        { status: 400 }
      )
    }

    // Check score (reCAPTCHA v3 returns a score from 0.0 to 1.0)
    // Lower scores indicate suspicious activity
    const score = data.score || 0
    const threshold = 0.5 // Adjust threshold as needed

    if (score < threshold) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA score too low',
          score 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      score,
      action: data.action,
    })
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify reCAPTCHA' },
      { status: 500 }
    )
  }
}

