import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TourForm } from '@/components/admin/tour-form'

async function getTour(id: string) {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
    return tour
  } catch {
    return null
  }
}

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const tour = await getTour(params.id)

  if (!tour) {
    notFound()
  }

  // Convert Prisma types to JavaScript types for the component
  const tourForForm = {
    ...tour,
    basePrice: Number(tour.basePrice),
    discountPrice: tour.discountPrice ? Number(tour.discountPrice) : null,
    itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
    highlights: Array.isArray(tour.highlights) ? tour.highlights : [],
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Tour</h1>
      <TourForm tour={tourForForm} />
    </div>
  )
}

