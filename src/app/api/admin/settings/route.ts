import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if settings model exists
    if (!prisma.settings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prisma client not generated. Please run: npx prisma generate' 
        },
        { status: 500 }
      )
    }

    const settings = await prisma.settings.findMany()
    
    // Convert to key-value object
    const settingsObj: Record<string, any> = {}
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json({
      success: true,
      data: settingsObj,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Check if settings model exists in Prisma client
    if (!prisma.settings) {
      console.error('Prisma settings model not found. Please run: npx prisma generate')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database model not available. Please run: npx prisma generate' 
        },
        { status: 500 }
      )
    }

    // Upsert each setting - ensure values are properly formatted for JSON
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      try {
        // Convert value to appropriate JSON type
        let jsonValue: any = value
        
        // Handle boolean values (SMTP_ENABLED comes as boolean from checkbox)
        if (key === 'SMTP_ENABLED') {
          jsonValue = Boolean(value)
        }
        // Handle boolean strings
        else if (value === 'true' || value === 'false') {
          jsonValue = value === 'true'
        }
        // Handle numbers (for SMTP_PORT)
        else if (key === 'SMTP_PORT' && typeof value === 'string') {
          jsonValue = parseInt(value) || value
        }
        // Keep other values as-is (strings, booleans, numbers)
        
        return await prisma.settings.upsert({
          where: { key },
          update: { value: jsonValue },
          create: { key, value: jsonValue },
        })
      } catch (err: any) {
        console.error(`Error saving setting ${key}:`, err)
        throw new Error(`Failed to save ${key}: ${err.message}`)
      }
    })

    await Promise.all(updatePromises)

    // Reset email transporter if SMTP settings changed
    const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', 'SMTP_ENABLED']
    const hasSmtpChange = Object.keys(settings).some((key) => smtpKeys.includes(key))
    if (hasSmtpChange) {
      const { resetEmailTransporter } = await import('@/lib/email')
      resetEmailTransporter()
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
    })
  } catch (error: any) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save settings',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

