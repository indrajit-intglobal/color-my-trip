import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { key: 'recaptchaSiteKey' },
    })

    const siteKey = (settings?.value as string) || process.env.RECAPTCHA_SITE_KEY || ''

    return NextResponse.json({
      success: true,
      siteKey,
    })
  } catch (error) {
    console.error('Error fetching reCAPTCHA config:', error)
    return NextResponse.json(
      { success: false, siteKey: '' },
      { status: 500 }
    )
  }
}

