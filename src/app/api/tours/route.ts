import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TourFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const filters: TourFilters = {
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') as any || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minDuration: searchParams.get('minDuration') ? parseInt(searchParams.get('minDuration')!) : undefined,
      maxDuration: searchParams.get('maxDuration') ? parseInt(searchParams.get('maxDuration')!) : undefined,
      search: searchParams.get('search') || undefined,
      isPublished: true, // Only show published tours to public
    }

    const where: any = {
      isPublished: true,
    }

    if (filters.country) {
      where.locationCountry = filters.country
    }

    if (filters.city) {
      where.locationCity = filters.city
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.minPrice || filters.maxPrice) {
      where.basePrice = {}
      if (filters.minPrice) {
        where.basePrice.gte = filters.minPrice
      }
      if (filters.maxPrice) {
        where.basePrice.lte = filters.maxPrice
      }
    }

    if (filters.minDuration || filters.maxDuration) {
      where.durationDays = {}
      if (filters.minDuration) {
        where.durationDays.gte = filters.minDuration
      }
      if (filters.maxDuration) {
        where.durationDays.lte = filters.maxDuration
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { locationCity: { contains: filters.search, mode: 'insensitive' } },
        { locationCountry: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.tour.count({ where }),
    ])

    // Calculate average ratings for each tour
    const toursWithRatings = await Promise.all(
      tours.map(async (tour) => {
        const reviews = await prisma.review.findMany({
          where: {
            tourId: tour.id,
            isApproved: true,
          },
          select: {
            rating: true,
          },
        })

        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0

        return {
          ...tour,
          averageRating: avgRating,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: toursWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tours:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tours' },
      { status: 500 }
    )
  }
}

