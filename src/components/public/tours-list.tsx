'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

interface Tour {
  id: string
  title: string
  slug: string
  locationCity: string
  locationCountry: string
  basePrice: number
  discountPrice?: number | null
  durationDays: number
  category: string
  images: Array<{ secureUrl: string; altText?: string | null }>
  averageRating?: number
  _count?: { reviews: number }
}

export function ToursList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  useEffect(() => {
    async function fetchTours() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params.append(key, String(value))
        })
        params.append('page', String(pagination.page))

        const res = await fetch(`/api/tours?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          setTours(data.data)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Error fetching tours:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [searchParams, pagination.page])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
        <p className="mt-4 text-gray-600">Loading tours...</p>
      </div>
    )
  }

  if (tours.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-search text-4xl text-gray-400"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No tours found</h3>
        <p className="text-gray-600">Try adjusting your filters to find more results.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Tours</h2>
          <p className="text-gray-600 mt-1">{pagination.total} tours available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tours.map((tour, index) => (
          <Card key={tour.id} className="rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col h-full bg-white hover-lift opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}>
            <div className="h-64 overflow-hidden relative flex-shrink-0">
              {tour.images && tour.images[0] ? (
                <Image
                  src={tour.images[0].secureUrl}
                  alt={tour.images[0].altText || tour.title}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
              {tour.discountPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-xs font-bold px-3 py-1 rounded-full text-white z-10 shadow-lg">
                  SALE
                </div>
              )}
            </div>
            <CardContent className="!px-6 !pt-8 !pb-6 !p-0 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="text-xl font-bold text-gray-800 leading-tight flex-1">{tour.title}</h3>
                {tour.averageRating && tour.averageRating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500 text-sm whitespace-nowrap">
                    <i className="fa-solid fa-star text-xs"></i>
                    <span className="font-semibold">{tour.averageRating.toFixed(1)}</span>
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3 text-sm">{tour.locationCity}, {tour.locationCountry}</p>
              <div className="flex gap-2 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-calendar-days text-xs"></i>
                  {tour.durationDays} days
                </span>
                <span>•</span>
                <span className="capitalize">{tour.category.toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto gap-4">
                <div className="flex-1 min-w-0">
                  {tour.discountPrice ? (
                    <>
                      <span className="text-xs text-gray-400 line-through block mb-1">
                        {formatCurrency(Number(tour.basePrice))}
                      </span>
                      <span className="text-lg font-bold text-brand-green">
                        {formatCurrency(Number(tour.discountPrice))}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-brand-green">
                      {formatCurrency(Number(tour.basePrice))}
                    </span>
                  )}
                </div>
                <Link href={`/tours/${tour.slug}`} className="flex-shrink-0">
                  <Button className="text-brand-green font-semibold hover:text-white hover:bg-brand-green border border-brand-green px-3 py-1.5 rounded-full transition text-xs whitespace-nowrap">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-chevron-left mr-2"></i>
            Previous
          </Button>
          <span className="flex items-center px-6 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <i className="fa-solid fa-chevron-right ml-2"></i>
          </Button>
        </div>
      )}
    </div>
  )
}
