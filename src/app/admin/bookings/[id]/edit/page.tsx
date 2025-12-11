import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditBookingForm } from '@/components/admin/edit-booking-form'

async function getBooking(id: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    if (!booking || booking.bookingStatus !== 'PENDING' || booking.paymentStatus !== 'PENDING') {
      return null
    }

    return booking
  } catch {
    return null
  }
}

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const booking = await getBooking(params.id)
  if (!booking) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Booking</h1>
      <EditBookingForm booking={booking} />
    </div>
  )
}

