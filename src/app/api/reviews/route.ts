import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { tourId, rating, comment } = body

    if (!tourId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has booked this tour
    const booking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        tourId,
        paymentStatus: 'PAID',
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'You must have a confirmed booking to review this tour' },
        { status: 403 }
      )
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        tourId_userId: {
          tourId,
          userId: session.user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this tour' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        tourId,
        userId: session.user.id,
        rating,
        comment,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: review,
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this tour' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

