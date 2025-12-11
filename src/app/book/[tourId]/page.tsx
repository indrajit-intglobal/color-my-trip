import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookingFlow } from '@/components/public/booking-flow'

async function getTour(tourId: string) {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId, isPublished: true },
      include: {
        images: {
          take: 1,
        },
      },
    })
    return tour
  } catch {
    return null
  }
}

export default async function BookPage({ params }: { params: { tourId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login?redirect=/book/' + params.tourId)
  }

  // Redirect admins to dashboard
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const tour = await getTour(params.tourId)
  if (!tour) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Your Trip</h1>
      <BookingFlow tour={tour} />
    </div>
  )
}

