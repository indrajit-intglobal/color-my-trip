'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

interface Review {
  id: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  tour: {
    id: string
    title: string
    slug: string
  }
}

export default function AdminReviewsPage() {
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?filter=${filter}`)
      const data = await res.json()

      if (data.success) {
        setReviews(data.data)
      } else {
        showToast('Failed to load reviews', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string, approve: boolean) => {
    setProcessing(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      })

      const data = await res.json()

      if (data.success) {
        showToast(`Review ${approve ? 'approved' : 'rejected'} successfully`, 'success')
        fetchReviews()
      } else {
        showToast(data.error || 'Failed to update review', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading reviews...</p>
      </div>
    )
  }

  const pendingCount = reviews.filter((r) => !r.isApproved).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({reviews.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
            className="relative"
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            size="sm"
          >
            Approved
          </Button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="!p-6 !pt-6">
            <div className="text-center py-12">
              <i className="fa-solid fa-star text-gray-300 text-6xl mb-4"></i>
              <p className="text-gray-500 text-lg">No reviews found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="!p-6 !pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa-solid fa-star ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <Badge variant={review.isApproved ? 'success' : 'secondary'}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-user"></i>
                        <span className="font-medium">{review.user.name}</span>
                        <span className="text-gray-400">({review.user.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-map-marker-alt"></i>
                        <Link
                          href={`/tours/${review.tour.slug}`}
                          className="text-brand-green hover:underline"
                        >
                          {review.tour.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-calendar"></i>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {!review.isApproved && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id, true)}
                        disabled={processing === review.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing === review.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <>
                            <i className="fa-solid fa-check mr-1"></i>
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApprove(review.id, false)}
                        disabled={processing === review.id}
                      >
                        {processing === review.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <>
                            <i className="fa-solid fa-times mr-1"></i>
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

