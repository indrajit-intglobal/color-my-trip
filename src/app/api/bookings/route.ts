import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateTotalPrice } from '@/lib/utils'

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
    const { tourId, startDate, endDate, adults, children, specialRequests } = body

    if (!tourId || !startDate || !endDate || !adults) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      )
    }

    const totalAmount = calculateTotalPrice(
      Number(tour.basePrice),
      tour.discountPrice ? Number(tour.discountPrice) : null,
      adults,
      children || 0
    )

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        tourId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adults,
        children: children || 0,
        totalAmount,
        currency: 'INR',
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        specialRequests: specialRequests || null,
      },
      include: {
        user: true,
        tour: {
          include: {
            images: {
              take: 1,
            },
          },
        },
      },
    })

    // No emails sent here - emails will only be sent after payment is confirmed
    // See: src/app/api/payments/confirm/route.ts

    return NextResponse.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

