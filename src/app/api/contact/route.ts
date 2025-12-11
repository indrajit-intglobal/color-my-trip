import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getContactNotificationEmail } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, recaptchaToken } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic spam protection - check message length
    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message is too short' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA if token is provided
    if (recaptchaToken) {
      try {
        // Get reCAPTCHA secret key from settings
        const settings = await prisma.settings.findUnique({
          where: { key: 'recaptchaSecretKey' },
        })

        const secretKey = (settings?.value as string) || process.env.RECAPTCHA_SECRET_KEY || ''

        if (secretKey) {
          // Verify token with Google
          const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
          
          const verifyRes = await fetch(verificationUrl, {
            method: 'POST',
          })

          const verifyData = await verifyRes.json()

          if (!verifyData.success) {
            return NextResponse.json(
              { success: false, error: 'reCAPTCHA verification failed. Please try again.' },
              { status: 400 }
            )
          }

          // Check score (reCAPTCHA v3 returns a score from 0.0 to 1.0)
          const score = verifyData.score || 0
          const threshold = 0.5

          if (score < threshold) {
            return NextResponse.json(
              { success: false, error: 'reCAPTCHA verification failed. Please try again.' },
              { status: 400 }
            )
          }
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError)
        // Don't block the request if reCAPTCHA verification fails
        // This allows the form to work even if reCAPTCHA is misconfigured
      }
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        status: 'NEW',
      },
    })

    // Send email notification to admin
    try {
      const settings = await prisma.settings.findUnique({
        where: { key: 'supportEmail' },
      })
      const adminEmail = (settings?.value as string) || process.env.SUPPORT_EMAIL || 'admin@gofly.com'

      const emailTemplate = getContactNotificationEmail(name, email, message)
      await sendEmail({
        to: adminEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    } catch (emailError) {
      console.error('Error sending contact notification email:', emailError)
      // Don't fail the contact form if email fails
    }

    return NextResponse.json({
      success: true,
      data: contactMessage,
      message: 'Thank you for your message. We will get back to you soon!',
    })
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

