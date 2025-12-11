import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        tour: {
          include: {
            images: {
              take: 1,
            },
          },
        },
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingStatus, paymentStatus, startDate, endDate, adults, children, totalAmount } = body

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow editing details for pending bookings
    const isPending = existingBooking.bookingStatus === 'PENDING' && existingBooking.paymentStatus === 'PENDING'
    
    const updateData: any = {}
    
    // Status updates (allowed for all bookings)
    if (bookingStatus) {
      updateData.bookingStatus = bookingStatus
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    // Detail updates (only for pending bookings)
    if (isPending) {
      if (startDate) {
        updateData.startDate = new Date(startDate)
      }
      if (endDate) {
        updateData.endDate = new Date(endDate)
      }
      if (adults !== undefined) {
        updateData.adults = parseInt(adults.toString())
      }
      if (children !== undefined) {
        updateData.children = parseInt(children.toString())
      }
      if (totalAmount !== undefined) {
        updateData.totalAmount = parseFloat(totalAmount.toString())
      }
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: true,
        tour: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if booking exists and is pending
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of pending bookings
    if (booking.bookingStatus !== 'PENDING' || booking.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Only pending bookings can be deleted' },
        { status: 400 }
      )
    }

    // Delete the booking (cascade will handle related records)
    await prisma.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

