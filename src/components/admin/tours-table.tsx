'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface Tour {
  id: string
  title: string
  slug: string
  locationCity: string
  locationCountry: string
  category: string
  basePrice: number | string
  isPublished: boolean
  _count: {
    bookings: number
    reviews: number
  }
}

export function ToursTable() {
  const { showToast } = useToast()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPublished, setFilterPublished] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchTours()
  }, [search, filterPublished])

  async function fetchTours() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterPublished !== undefined) params.append('isPublished', filterPublished)

      const res = await fetch(`/api/admin/tours?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setTours(data.data)
      }
    } catch (error) {
      showToast('Failed to load tours', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tour?')) return

    try {
      const res = await fetch(`/api/admin/tours/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        showToast('Tour deleted successfully', 'success')
        fetchTours()
      } else {
        showToast(data.error || 'Failed to delete tour', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading tours...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search tours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={filterPublished}
          onValueChange={(value) => setFilterPublished(value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Location</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Bookings</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No tours found
                </td>
              </tr>
            ) : (
              tours.map((tour) => (
                <tr key={tour.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{tour.title}</td>
                  <td className="p-4">{tour.locationCity}, {tour.locationCountry}</td>
                  <td className="p-4">{tour.category}</td>
                  <td className="p-4">{formatCurrency(Number(tour.basePrice))}</td>
                  <td className="p-4">{tour._count.bookings}</td>
                  <td className="p-4">
                    <Badge variant={tour.isPublished ? 'success' : 'secondary'}>
                      {tour.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/tours/${tour.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tour.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
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

