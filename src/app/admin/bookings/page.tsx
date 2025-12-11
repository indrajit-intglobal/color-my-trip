import { BookingsTable } from '@/components/admin/bookings-table'

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bookings Management</h1>
      <BookingsTable />
    </div>
  )
}

