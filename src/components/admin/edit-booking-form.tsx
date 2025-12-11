'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

interface Booking {
  id: string
  startDate: Date | string
  endDate: Date | string
  adults: number
  children: number
  totalAmount: number | string
  tour: {
    title: string
  }
}

// Helper function to format date for input (YYYY-MM-DD)
function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function EditBookingForm({ booking }: { booking: Booking }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: formatDateForInput(booking.startDate),
    endDate: formatDateForInput(booking.endDate),
    adults: booking.adults.toString(),
    children: booking.children.toString(),
    totalAmount: Number(booking.totalAmount).toString(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          adults: parseInt(formData.adults),
          children: parseInt(formData.children),
          totalAmount: parseFloat(formData.totalAmount),
        }),
      })

      const data = await res.json()

      if (data.success) {
        showToast('Booking updated successfully', 'success')
        router.push(`/admin/bookings/${booking.id}`)
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label>Tour</Label>
        <Input value={booking.tour.title} disabled />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="adults">Adults</Label>
          <Input
            id="adults"
            type="number"
            min="1"
            value={formData.adults}
            onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="children">Children</Label>
          <Input
            id="children"
            type="number"
            min="0"
            value={formData.children}
            onChange={(e) => setFormData({ ...formData, children: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="totalAmount">Total Amount</Label>
        <Input
          id="totalAmount"
          type="number"
          step="0.01"
          min="0"
          value={formData.totalAmount}
          onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

