'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface Booking {
  id: string
  startDate: Date | string
  adults: number
  children: number
  totalAmount: number | string
  paymentStatus: string
  bookingStatus: string
  user: {
    name: string
    email: string
  }
  tour: {
    title: string
  }
}

export function BookingsTable() {
  const router = useRouter()
  const { showToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    paymentStatus: undefined as string | undefined,
    bookingStatus: undefined as string | undefined,
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchBookings()
  }, [filters])

  async function fetchBookings() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })

      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      showToast('Failed to load bookings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        showToast('Booking deleted successfully', 'success')
        fetchBookings() // Refresh the list
      } else {
        showToast(data.error || 'Failed to delete booking', 'error')
      }
    } catch (error) {
      showToast('An error occurred while deleting booking', 'error')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={filters.bookingStatus || 'all'}
          onValueChange={(value) => setFilters({ ...filters, bookingStatus: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Booking Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Booking Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.paymentStatus || 'all'}
          onValueChange={(value) => setFilters({ ...filters, paymentStatus: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Start Date"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="End Date"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Booking ID</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Tour</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Travelers</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono">{booking.id.substring(0, 8)}...</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-sm text-gray-600">{booking.user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">{booking.tour.title}</td>
                  <td className="p-4 text-sm">{formatDate(booking.startDate)}</td>
                  <td className="p-4 text-sm">{booking.adults} adults, {booking.children} children</td>
                  <td className="p-4">{formatCurrency(Number(booking.totalAmount))}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <Badge
                        variant={booking.bookingStatus === 'CONFIRMED' ? 'success' : booking.bookingStatus === 'CANCELLED' ? 'destructive' : 'secondary'}
                        className="block w-fit"
                      >
                        {booking.bookingStatus}
                      </Badge>
                      <Badge
                        variant={booking.paymentStatus === 'PAID' ? 'success' : booking.paymentStatus === 'FAILED' ? 'destructive' : 'secondary'}
                        className="block w-fit"
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {booking.bookingStatus === 'PENDING' && booking.paymentStatus === 'PENDING' && (
                        <>
                          <Link href={`/admin/bookings/${booking.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(booking.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

