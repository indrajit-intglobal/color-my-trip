import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function RecentBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tour: {
          select: {
            title: true,
          },
        },
      },
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Booking ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Tour</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="p-2 text-sm">{booking.id.substring(0, 8)}...</td>
                      <td className="p-2">{booking.user.name}</td>
                      <td className="p-2">{booking.tour.title}</td>
                      <td className="p-2 text-sm">{formatDate(booking.startDate)}</td>
                      <td className="p-2">{formatCurrency(Number(booking.totalAmount))}</td>
                      <td className="p-2">
                        <Badge
                          variant={booking.bookingStatus === 'CONFIRMED' ? 'success' : booking.bookingStatus === 'CANCELLED' ? 'destructive' : 'secondary'}
                        >
                          {booking.bookingStatus}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Error loading recent bookings.</p>
        </CardContent>
      </Card>
    )
  }
}

