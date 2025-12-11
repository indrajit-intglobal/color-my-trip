'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  bookingStatus: string
  paymentStatus: string
}

export function BookingActions({ booking }: { booking: Booking }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [bookingStatus, setBookingStatus] = useState(booking.bookingStatus)
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingStatus,
          paymentStatus,
        }),
      })

      const data = await res.json()

      if (data.success) {
        showToast('Booking updated successfully', 'success')
        router.refresh()
      } else {
        showToast(data.error || 'Failed to update booking', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <div>
        <label className="block text-sm font-medium mb-2">Update Booking Status</label>
        <Select value={bookingStatus} onValueChange={setBookingStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Update Payment Status</label>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleUpdate} disabled={loading} className="w-full">
        {loading ? 'Updating...' : 'Update Booking'}
      </Button>
    </div>
  )
}

