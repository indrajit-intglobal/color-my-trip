import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || undefined
    const isPublished = searchParams.get('isPublished')

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { locationCity: { contains: search, mode: 'insensitive' } },
        { locationCountry: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === 'true'
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          images: {
            take: 1,
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
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

    return NextResponse.json({
      success: true,
      data: tours,
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
    const {
      title,
      slug,
      locationCountry,
      locationCity,
      category,
      durationDays,
      basePrice,
      discountPrice,
      maxGroupSize,
      description,
      highlights,
      itinerary,
      isPublished,
      seoTitle,
      seoDescription,
      images,
    } = body

    if (!title || !locationCountry || !locationCity || !category || !durationDays || !basePrice || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tourSlug = slug || slugify(title)

    // Check if slug already exists
    const existingTour = await prisma.tour.findUnique({
      where: { slug: tourSlug },
    })

    if (existingTour) {
      return NextResponse.json(
        { success: false, error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }

    const tour = await prisma.tour.create({
      data: {
        title,
        slug: tourSlug,
        locationCountry,
        locationCity,
        category,
        durationDays: parseInt(durationDays),
        basePrice: parseFloat(basePrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        maxGroupSize: parseInt(maxGroupSize) || 20,
        description,
        highlights: highlights || [],
        itinerary: itinerary || [],
        isPublished: isPublished || false,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        images: images && images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            cloudinaryPublicId: img.public_id,
            secureUrl: img.secure_url,
            altText: img.alt_text || title,
            sortOrder: index,
          })),
        } : undefined,
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: tour,
    })
  } catch (error: any) {
    console.error('Error creating tour:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create tour' },
      { status: 500 }
    )
  }
}

