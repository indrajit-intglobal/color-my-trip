import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tour = await prisma.tour.findUnique({
      where: {
        slug: params.slug,
        isPublished: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: {
            isApproved: true,
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const avgRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        ...tour,
        averageRating: avgRating,
      },
    })
  } catch (error) {
    console.error('Error fetching tour:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tour' },
      { status: 500 }
    )
  }
}

