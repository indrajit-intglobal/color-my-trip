import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { RecentBookings } from '@/components/admin/recent-bookings'

async function getDashboardStats() {
  try {
    const [totalBookings, upcomingTrips, totalRevenue, activeTours] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          startDate: { gte: new Date() },
          bookingStatus: 'CONFIRMED',
        },
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.tour.count({
        where: {
          isPublished: true,
        },
      }),
    ])

    return {
      totalBookings,
      upcomingTrips,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeTours,
    }
  } catch {
    return {
      totalBookings: 0,
      upcomingTrips: 0,
      totalRevenue: 0,
      activeTours: 0,
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingTrips}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(Number(stats.totalRevenue))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Active Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeTours}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <RecentBookings />
    </div>
  )
}

