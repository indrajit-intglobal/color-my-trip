import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { refundRazorpayPayment } from '@/lib/razorpay'
import { sendEmail } from '@/lib/email'
import { getBookingCancellationEmail } from '@/lib/email-templates'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        tour: true,
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    // Process refund if payment was made
    let refundId: string | undefined
    if (booking.paymentStatus === 'PAID' && booking.payment?.providerPaymentId) {
      try {
        const refundResult = await refundRazorpayPayment(booking.payment.providerPaymentId)
        if (refundResult.success && refundResult.refundId) {
          refundId = refundResult.refundId
        } else {
          console.error('Refund failed:', refundResult.error)
          // Continue with cancellation even if refund fails (admin can handle manually)
        }
      } catch (refundError) {
        console.error('Error processing refund:', refundError)
        // Continue with cancellation
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        bookingStatus: 'CANCELLED',
        paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUNDED' : booking.paymentStatus,
      },
      include: {
        user: true,
        tour: true,
      },
    })

    // Send cancellation email
    try {
      const cancellationEmail = getBookingCancellationEmail({
        bookingId: booking.id,
        tourTitle: booking.tour.title,
        userName: booking.user.name,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        adults: booking.adults,
        children: booking.children,
        totalAmount: formatCurrency(Number(booking.totalAmount)),
        location: `${booking.tour.locationCity}, ${booking.tour.locationCountry}`,
      })

      await sendEmail({
        to: booking.user.email,
        subject: cancellationEmail.subject,
        html: cancellationEmail.html,
      })
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError)
      // Don't fail cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        refundId,
      },
      message: 'Booking cancelled successfully' + (refundId ? '. Refund has been processed.' : ''),
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

