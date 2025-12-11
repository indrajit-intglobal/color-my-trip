import nodemailer from 'nodemailer'
import { prisma } from './prisma'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Get SMTP configuration from database settings or environment variables
async function getSMTPConfig() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', 'SMTP_ENABLED'],
      },
    },
  })

  const getSetting = (key: string, defaultValue: string) => {
    const setting = settings.find((s) => s.key === key)
    return (setting?.value as string) || process.env[key] || defaultValue
  }

  const enabled = settings.find((s) => s.key === 'SMTP_ENABLED')
  const isEnabled = (enabled?.value as boolean) ?? process.env.SMTP_ENABLED !== 'false'

  if (!isEnabled) {
    return null
  }

  return {
    host: getSetting('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(getSetting('SMTP_PORT', '587')),
    secure: false, // true for 465, false for other ports
    auth: {
      user: getSetting('SMTP_EMAIL', process.env.SMTP_EMAIL || ''),
      pass: getSetting('SMTP_PASSWORD', process.env.SMTP_PASSWORD || ''),
    },
  }
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) {
    return transporter
  }

  const config = await getSMTPConfig()
  if (!config) {
    console.warn('Email service is disabled or not configured')
    return null
  }

  if (!config.auth.user || !config.auth.pass) {
    console.warn('SMTP credentials not configured')
    return null
  }

  transporter = nodemailer.createTransport(config)
  return transporter
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const emailTransporter = await getTransporter()
    if (!emailTransporter) {
      console.warn('Email not sent - SMTP not configured:', options.subject)
      return { success: false, error: 'Email service not configured' }
    }

    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ['SMTP_EMAIL', 'SMTP_FROM_NAME'],
        },
      },
    })

  const emailSetting = settings.find((s) => s.key === 'SMTP_EMAIL')
  const fromNameSetting = settings.find((s) => s.key === 'SMTP_FROM_NAME')

  const fromEmail = (emailSetting?.value as string) || process.env.SMTP_EMAIL || 'noreply@gofly.com'
  const fromName = (fromNameSetting?.value as string) || process.env.SMTP_FROM_NAME || 'GoFly Travel Agency'

    await emailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

// Helper to reset transporter (useful when settings change)
export function resetEmailTransporter() {
  transporter = null
}

