import { BookingsTable } from '@/components/admin/bookings-table'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bookings Management</h1>
      <BookingsTable />
    </div>
  )
}

