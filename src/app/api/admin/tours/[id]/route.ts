import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tour,
    })
  } catch (error) {
    console.error('Error fetching tour:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tour' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
    })

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      )
    }

    const tourSlug = slug || slugify(title || tour.title)

    // Check if slug already exists (excluding current tour)
    if (tourSlug !== tour.slug) {
      const existingTour = await prisma.tour.findUnique({
        where: { slug: tourSlug },
      })

      if (existingTour) {
        return NextResponse.json(
          { success: false, error: 'A tour with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await prisma.tourImage.deleteMany({
        where: { tourId: params.id },
      })

      // Create new images
      if (images.length > 0) {
        await prisma.tourImage.createMany({
          data: images.map((img: any, index: number) => ({
            tourId: params.id,
            cloudinaryPublicId: img.public_id,
            secureUrl: img.secure_url,
            altText: img.alt_text || title || tour.title,
            sortOrder: index,
          })),
        })
      }
    }

    const updatedTour = await prisma.tour.update({
      where: { id: params.id },
      data: {
        title: title || tour.title,
        slug: tourSlug,
        locationCountry: locationCountry || tour.locationCountry,
        locationCity: locationCity || tour.locationCity,
        category: category || tour.category,
        durationDays: durationDays ? parseInt(durationDays) : tour.durationDays,
        basePrice: basePrice ? parseFloat(basePrice) : tour.basePrice,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : tour.discountPrice,
        maxGroupSize: maxGroupSize ? parseInt(maxGroupSize) : tour.maxGroupSize,
        description: description || tour.description,
        highlights: highlights !== undefined ? highlights : tour.highlights,
        itinerary: itinerary !== undefined ? itinerary : tour.itinerary,
        isPublished: isPublished !== undefined ? isPublished : tour.isPublished,
        seoTitle: seoTitle !== undefined ? seoTitle : tour.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : tour.seoDescription,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedTour,
    })
  } catch (error: any) {
    console.error('Error updating tour:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update tour' },
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

    await prisma.tour.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting tour:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tour' },
      { status: 500 }
    )
  }
}

