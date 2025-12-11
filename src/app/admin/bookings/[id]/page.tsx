import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BookingActions } from '@/components/admin/booking-actions'

async function getBooking(id: string) {
  try {
    if (!id || id.trim() === '') {
      return null
    }
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            locationCity: true,
            locationCountry: true,
            images: {
              take: 1,
              select: {
                secureUrl: true,
                altText: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            providerPaymentId: true,
            amount: true,
            status: true,
          },
        },
      },
    })
    return booking
  } catch (error) {
    console.error('Error fetching booking:', error)
    return null
  }
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  try {
    if (!params?.id) {
      notFound()
    }

    const booking = await getBooking(params.id)

    if (!booking) {
      notFound()
    }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Booking Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-semibold">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tour</p>
                <p className="font-semibold">{booking.tour.title}</p>
                <p className="text-sm text-gray-600">{booking.tour.locationCity}, {booking.tour.locationCountry}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">{formatDate(booking.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">{formatDate(booking.endDate)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Adults</p>
                  <p className="font-semibold">{booking.adults}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Children</p>
                  <p className="font-semibold">{booking.children}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div>
                  <p className="text-sm text-gray-600">Special Requests</p>
                  <p className="font-semibold">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-semibold">Name:</span> {booking.user.name}</p>
              <p><span className="font-semibold">Email:</span> {booking.user.email}</p>
              {booking.user.phone && (
                <p><span className="font-semibold">Phone:</span> {booking.user.phone}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Booking Status</p>
                <Badge
                  variant={booking.bookingStatus === 'CONFIRMED' ? 'success' : booking.bookingStatus === 'CANCELLED' ? 'destructive' : 'secondary'}
                >
                  {booking.bookingStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                <Badge
                  variant={booking.paymentStatus === 'PAID' ? 'success' : booking.paymentStatus === 'FAILED' ? 'destructive' : 'secondary'}
                >
                  {booking.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(Number(booking.totalAmount))}</p>
              </div>
              {booking.payment && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Payment ID</p>
                  <p className="text-sm font-mono">{booking.payment.providerPaymentId || booking.payment.id}</p>
                </div>
              )}
              <BookingActions booking={booking} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error in BookingDetailPage:', error)
    notFound()
  }
}

