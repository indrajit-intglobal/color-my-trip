import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/public/profile-form'
import { UserBookings } from '@/components/public/user-bookings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        tour: {
          include: {
            images: {
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return bookings
  } catch {
    return []
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // Redirect admins to dashboard
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const bookings = await getUserBookings(session.user.id)

  // Convert Prisma Decimal to number for the component
  const bookingsForComponent = bookings.map(booking => ({
    ...booking,
    totalAmount: Number(booking.totalAmount),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-beige">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-brand-green to-green-700 text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">My Profile</h1>
          <p className="text-xl text-gray-100">Manage your bookings and personal information</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-1">
            <ProfileForm />
          </div>

          {/* Right Column - Bookings */}
          <UserBookings bookings={bookingsForComponent} />
        </div>
      </div>
    </div>
  )
}
