import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { confirmPayment } from '@/lib/payments'
import { sendEmail } from '@/lib/email'
import { getPaymentReceiptEmail, getBookingConfirmationEmail, getAdminBookingNotificationEmail } from '@/lib/email-templates'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, orderId, paymentData } = body

    if (!bookingId || !orderId || !paymentData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        tour: true,
      },
    })

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    const paymentResult = await confirmPayment(orderId, paymentData)

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      )
    }

    // Update booking and create payment record
    const [updatedBooking, payment] = await Promise.all([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
        },
        include: {
          user: true,
          tour: true,
        },
      }),
      prisma.payment.create({
        data: {
          bookingId,
          provider: 'RAZORPAY',
          providerPaymentId: paymentResult.paymentId,
          amount: booking.totalAmount,
          currency: booking.currency,
          status: 'succeeded',
        },
      }),
    ])

    // Send confirmation emails to user and admin
    // Send emails individually to ensure each one is attempted even if one fails
    const emailResults = []
    
    try {
      // Payment receipt email to user
      const receiptEmail = getPaymentReceiptEmail({
        bookingId: booking.id,
        paymentId: paymentResult.paymentId || '',
        amount: formatCurrency(Number(booking.totalAmount)),
        currency: booking.currency,
        method: paymentData.razorpay_payment_id ? 'Razorpay' : 'Online Payment',
      })

      const receiptResult = await sendEmail({
        to: booking.user.email,
        subject: receiptEmail.subject,
        html: receiptEmail.html,
      })
      emailResults.push({ type: 'receipt', success: receiptResult.success, error: receiptResult.error })
      console.log(`Payment receipt email ${receiptResult.success ? 'sent' : 'failed'} to ${booking.user.email}`)
    } catch (emailError: any) {
      console.error('Error sending payment receipt email:', emailError)
      emailResults.push({ type: 'receipt', success: false, error: emailError.message })
    }

    try {
      // Booking confirmation email to user
      const confirmationEmail = getBookingConfirmationEmail({
        bookingId: updatedBooking.id,
        tourTitle: updatedBooking.tour.title,
        userName: updatedBooking.user.name,
        startDate: formatDate(updatedBooking.startDate),
        endDate: formatDate(updatedBooking.endDate),
        adults: updatedBooking.adults,
        children: updatedBooking.children,
        totalAmount: formatCurrency(Number(updatedBooking.totalAmount)),
        location: `${updatedBooking.tour.locationCity}, ${updatedBooking.tour.locationCountry}`,
      })

      const confirmationResult = await sendEmail({
        to: updatedBooking.user.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      })
      emailResults.push({ type: 'confirmation', success: confirmationResult.success, error: confirmationResult.error })
      console.log(`Booking confirmation email ${confirmationResult.success ? 'sent' : 'failed'} to ${updatedBooking.user.email}`)
    } catch (emailError: any) {
      console.error('Error sending booking confirmation email:', emailError)
      emailResults.push({ type: 'confirmation', success: false, error: emailError.message })
    }

    try {
      // Email to admin - send to support email
      const supportEmailSetting = await prisma.settings.findUnique({
        where: { key: 'supportEmail' },
      })

      const supportEmail = (supportEmailSetting?.value as string) || process.env.SUPPORT_EMAIL || 'support@gofly.com'

      const adminEmail = getAdminBookingNotificationEmail({
        bookingId: updatedBooking.id,
        tourTitle: updatedBooking.tour.title,
        userName: updatedBooking.user.name,
        userEmail: updatedBooking.user.email,
        userPhone: updatedBooking.user.phone || undefined,
        startDate: formatDate(updatedBooking.startDate),
        endDate: formatDate(updatedBooking.endDate),
        adults: updatedBooking.adults,
        children: updatedBooking.children,
        totalAmount: formatCurrency(Number(updatedBooking.totalAmount)),
        location: `${updatedBooking.tour.locationCity}, ${updatedBooking.tour.locationCountry}`,
      })

      const adminResult = await sendEmail({
        to: supportEmail,
        subject: `Booking Confirmed - ${updatedBooking.tour.title}`,
        html: adminEmail.html.replace('New Booking Received', 'Booking Confirmed').replace('Action Required', 'Payment Received'),
      })
      emailResults.push({ type: 'admin', success: adminResult.success, error: adminResult.error })
      console.log(`Admin notification email ${adminResult.success ? 'sent' : 'failed'} to ${supportEmail}`)
    } catch (emailError: any) {
      console.error('Error sending admin notification email:', emailError)
      emailResults.push({ type: 'admin', success: false, error: emailError.message })
    }

    // Log email results for debugging
    const failedEmails = emailResults.filter(r => !r.success)
    if (failedEmails.length > 0) {
      console.warn('Some emails failed to send:', failedEmails)
    } else {
      console.log('All confirmation emails sent successfully')
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        payment,
      },
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
