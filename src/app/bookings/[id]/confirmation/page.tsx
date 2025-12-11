import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { PrintButton } from '@/components/public/print-button'

async function getBooking(bookingId: string, userId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tour: {
          include: {
            images: {
              take: 1,
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking || booking.userId !== userId) {
      return null
    }

    return booking
  } catch {
    return null
  }
}

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // Redirect admins to dashboard
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const booking = await getBooking(params.id, session.user.id)
  if (!booking) {
    notFound()
  }

  const bookingDate = new Date(booking.createdAt)
  const duration = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-beige">
      {/* Success Banner */}
      <section className="bg-gradient-to-r from-brand-green to-green-700 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <i className="fa-solid fa-check text-4xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-100 mb-2">Your adventure awaits</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium">
            <i className="fa-solid fa-ticket"></i>
            <span>Booking Reference: <strong className="font-mono">{booking.id.slice(0, 8).toUpperCase()}</strong></span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Tour Card */}
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80">
                {booking.tour.images[0] ? (
                  <Image
                    src={booking.tour.images[0].secureUrl}
                    alt={booking.tour.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-green to-green-700 flex items-center justify-center">
                    <i className="fa-solid fa-image text-white text-6xl opacity-50"></i>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-brand-accent text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {booking.tour.category}
                  </span>
                </div>
              </div>
              <CardContent className="!p-6 !pt-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">{booking.tour.title}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <i className="fa-solid fa-location-dot text-brand-green"></i>
                  <span>{booking.tour.locationCity}, {booking.tour.locationCountry}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-clock text-brand-green"></i>
                    <span>{duration} {duration === 1 ? 'Day' : 'Days'}</span>
                  </div>
                  {booking.tour.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-star text-yellow-400"></i>
                      <span>{booking.tour.averageRating.toFixed(1)} Rating</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardContent className="!p-6 !pt-6">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-check text-brand-green"></i>
                  Booking Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Travel Dates</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(booking.startDate)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">to {formatDate(booking.endDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Travelers</p>
                    <div className="space-y-1">
                      {booking.adults > 0 && (
                        <p className="text-lg font-semibold text-gray-900">
                          <i className="fa-solid fa-user text-brand-green mr-2"></i>
                          {booking.adults} {booking.adults === 1 ? 'Adult' : 'Adults'}
                        </p>
                      )}
                      {booking.children > 0 && (
                        <p className="text-lg font-semibold text-gray-900">
                          <i className="fa-solid fa-child text-brand-green mr-2"></i>
                          {booking.children} {booking.children === 1 ? 'Child' : 'Children'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardContent className="!p-6 !pt-6">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-brand-green"></i>
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(Number(booking.totalAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xl font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-brand-green">
                      {formatCurrency(Number(booking.totalAmount))}
                    </span>
                  </div>
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-check text-white"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Payment Status</p>
                        <p className="text-sm text-green-700 capitalize">{booking.paymentStatus.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
              <Card>
                <CardContent className="!p-6 !pt-6">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-note-sticky text-brand-green"></i>
                    Special Requests
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {booking.specialRequests}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <Card className="sticky top-6">
              <CardContent className="!p-6 !pt-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Quick Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date</span>
                    <span className="font-semibold text-gray-900">{formatDate(bookingDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-mono font-semibold text-gray-900 text-xs">
                      {booking.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-semibold text-green-600 capitalize">
                      {booking.bookingStatus.toLowerCase()}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total</span>
                      <span className="text-xl font-bold text-brand-green">
                        {formatCurrency(Number(booking.totalAmount))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <PrintButton />
              <Link href="/profile" className="block">
                <Button className="w-full bg-brand-green hover:bg-green-800 text-white h-12 rounded-xl font-semibold">
                  <i className="fa-solid fa-list mr-2"></i>
                  View My Bookings
                </Button>
              </Link>
              <Link href="/tours" className="block">
                <Button variant="outline" className="w-full border-brand-green text-brand-green hover:bg-brand-light h-12 rounded-xl font-semibold">
                  <i className="fa-solid fa-compass mr-2"></i>
                  Explore More Tours
                </Button>
              </Link>
            </div>

            {/* Help Card */}
            <Card className="bg-brand-light border-brand-green/20">
              <CardContent className="!p-6 !pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-headset text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Our support team is here to assist you with any questions.
                    </p>
                    <Link href="/contact" className="text-sm font-medium text-brand-green hover:text-brand-accent transition">
                      Contact Support →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Confirmation Message */}
        <Card className="mt-8 bg-gradient-to-r from-brand-green/10 to-green-50 border-brand-green/20">
          <CardContent className="!p-6 !pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-envelope-open text-white"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Confirmation Email Sent</h4>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation email to <strong>{booking.user.email}</strong> with all the details of your booking.
                  Please check your inbox and keep this confirmation for your records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
