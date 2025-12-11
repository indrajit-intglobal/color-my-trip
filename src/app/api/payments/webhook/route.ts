import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleWebhook } from '@/lib/payments'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-razorpay-signature') || ''

    const result = await handleWebhook(body, signature)

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    // Handle webhook events
    const event = body.event

    if (event === 'payment.captured') {
      const payment = body.payload.payment.entity
      
      // Find booking by payment ID
      const paymentRecord = await prisma.payment.findFirst({
        where: {
          providerPaymentId: payment.id,
        },
        include: {
          booking: true,
        },
      })

      if (paymentRecord && paymentRecord.booking) {
        // Update booking status if payment is captured
        await prisma.booking.update({
          where: { id: paymentRecord.booking.id },
          data: {
            paymentStatus: 'PAID',
            bookingStatus: 'CONFIRMED',
          },
        })
      }
    } else if (event === 'payment.failed') {
      const payment = body.payload.payment.entity
      
      const paymentRecord = await prisma.payment.findFirst({
        where: {
          providerPaymentId: payment.id,
        },
        include: {
          booking: true,
        },
      })

      if (paymentRecord && paymentRecord.booking) {
        await prisma.booking.update({
          where: { id: paymentRecord.booking.id },
          data: {
            paymentStatus: 'FAILED',
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

