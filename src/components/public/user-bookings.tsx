'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface Booking {
  id: string
  startDate: Date
  endDate: Date
  adults: number
  children: number
  totalAmount: number
  bookingStatus: string
  paymentStatus: string
  tour: {
    id: string
    title: string
    locationCity: string
    locationCountry: string
    images: Array<{
      secureUrl: string
    }>
  }
}

interface UserBookingsProps {
  bookings: Booking[]
}

export function UserBookings({ bookings }: UserBookingsProps) {

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-brand-green to-green-700 text-white border-0">
          <CardContent className="!p-6 !pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-suitcase text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-brand-accent to-orange-600 text-white border-0">
          <CardContent className="!p-6 !pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Confirmed</p>
                <p className="text-2xl font-bold">
                  {bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
          <CardContent className="!p-6 !pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-dollar-sign text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardContent className="!p-6 !pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <i className="fa-solid fa-calendar-check text-brand-green"></i>
              My Bookings
            </h2>
            {bookings.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
              </Badge>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-suitcase-rolling text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                You haven't made any bookings yet. Start exploring amazing destinations and create your first booking!
              </p>
              <Link href="/tours">
                <Button className="bg-brand-green hover:bg-green-800 text-white px-8 py-6 rounded-xl font-semibold">
                  <i className="fa-solid fa-compass mr-2"></i>
                  Explore Tours
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="!p-0 !px-6 !pt-6 !pb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tour Image */}
                      <div className="relative w-full md:w-32 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                        {booking.tour.images[0] ? (
                          <Image
                            src={booking.tour.images[0].secureUrl}
                            alt={booking.tour.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-green to-green-700 flex items-center justify-center">
                            <i className="fa-solid fa-image text-white text-2xl opacity-50"></i>
                          </div>
                        )}
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-serif font-bold text-gray-900 pr-2">
                              {booking.tour.title}
                            </h3>
                            <Badge
                              className={
                                booking.bookingStatus === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : booking.bookingStatus === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {booking.bookingStatus}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-location-dot text-brand-green"></i>
                              <span>
                                {booking.tour.locationCity}, {booking.tour.locationCountry}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-calendar text-brand-green"></i>
                              <span>
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2">
                                <i className="fa-solid fa-users text-brand-green"></i>
                                <span>
                                  {booking.adults} {booking.adults === 1 ? 'Adult' : 'Adults'}
                                  {booking.children > 0 &&
                                    `, ${booking.children} ${booking.children === 1 ? 'Child' : 'Children'}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fa-solid fa-credit-card text-brand-green"></i>
                                <span className="capitalize">{booking.paymentStatus.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex md:flex-col items-end md:items-end justify-between md:justify-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-brand-green">
                              {formatCurrency(Number(booking.totalAmount))}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {(booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'PENDING') && (
                              <Link href={`/bookings/${booking.id}/confirmation`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-brand-green text-brand-green hover:bg-brand-light whitespace-nowrap w-full"
                                >
                                  <i className="fa-solid fa-eye mr-2"></i>
                                  View Details
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

