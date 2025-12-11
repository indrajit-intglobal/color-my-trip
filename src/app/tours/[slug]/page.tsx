import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TourDetailClient } from '@/components/public/tour-detail-client'
import { TourImageGallery } from '@/components/public/tour-image-gallery'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getTour(slug: string) {
  try {
    const tour = await prisma.tour.findUnique({
      where: { slug, isPublished: true },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!tour) return null

    const avgRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : 0

    return {
      ...tour,
      averageRating: avgRating,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tour = await getTour(params.slug)
  if (!tour) return {}

  return {
    title: tour.seoTitle || tour.title,
    description: tour.seoDescription || tour.description.substring(0, 160),
  }
}

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const tour = await getTour(params.slug)

  if (!tour) {
    notFound()
  }

  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : []
  const highlights = Array.isArray(tour.highlights) ? tour.highlights.filter((h): h is string => typeof h === 'string') : []

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center">
        {tour.images && tour.images[0] ? (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={tour.images[0].secureUrl}
                alt={tour.title}
                fill
                className="object-cover brightness-[0.85]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-green/40"></div>
            </div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
              <Badge className="bg-brand-accent text-white border-0 mb-4 px-4 py-2 text-sm font-semibold">
                {tour.category}
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 leading-tight drop-shadow-2xl">
                {tour.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-6 drop-shadow-lg">
                <i className="fa-solid fa-location-dot mr-2"></i>
                {tour.locationCity}, {tour.locationCountry}
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {tour.averageRating > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-400 text-xl">
                      {'★'.repeat(Math.round(tour.averageRating))}
                    </span>
                    <span className="font-bold">{tour.averageRating.toFixed(1)}</span>
                    <span className="text-sm">({tour.reviews.length} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>{tour.durationDays} Days</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <i className="fa-solid fa-users"></i>
                  <span>Max {tour.maxGroupSize} people</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-brand-green to-green-800 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">{tour.title}</h1>
              <p className="text-xl text-gray-100">{tour.locationCity}, {tour.locationCountry}</p>
            </div>
          </div>
        )}
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {tour.images && tour.images.length > 0 && (
              <div className="mb-8">
                <TourImageGallery images={tour.images} title={tour.title} />
              </div>
            )}

            {/* Tour Info */}
            <div>
              <div className="prose max-w-none mb-8">
                <h2 className="text-3xl font-serif font-bold text-brand-green mb-4">About This Tour</h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{tour.description}</p>
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <Card className="rounded-2xl overflow-hidden border-l-4 border-brand-green">
                <CardContent className="!p-6">
                  <h2 className="text-2xl font-serif font-bold text-brand-green mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-star text-brand-accent"></i>
                    Tour Highlights
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {highlights.map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <i className="fa-solid fa-check-circle text-brand-green mt-1 flex-shrink-0"></i>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="!p-6">
                  <h2 className="text-3xl font-serif font-bold text-brand-green mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-route text-brand-accent"></i>
                    Itinerary
                  </h2>
                  <div className="space-y-6">
                    {itinerary.map((day: any, index: number) => (
                      <div key={index} className="relative pl-8 pb-6 border-l-4 border-brand-green last:border-l-0 last:pb-0">
                        <div className="absolute left-0 top-0 w-8 h-8 -translate-x-[18px] bg-brand-green rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {day.day || index + 1}
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">
                          {day.title || `Day ${index + 1}`}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="!p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-serif font-bold text-brand-green flex items-center gap-2">
                    <i className="fa-solid fa-comments text-brand-accent"></i>
                    Reviews
                  </h2>
                  {tour.averageRating > 0 && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">{tour.averageRating.toFixed(1)}</div>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(Math.round(tour.averageRating))}
                      </div>
                      <div className="text-xs text-gray-500">Based on {tour.reviews.length} reviews</div>
                    </div>
                  )}
                </div>
                {tour.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {tour.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">{review.user.name}</span>
                              <div className="flex items-center gap-1 text-yellow-500">
                                {[...Array(review.rating)].map((_, i) => (
                                  <i key={i} className="fa-solid fa-star text-xs"></i>
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fa-solid fa-comment-slash text-4xl mb-4 text-gray-300"></i>
                    <p>No reviews yet. Be the first to review this tour!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl shadow-xl border-0 overflow-hidden">
              <CardContent className="!p-6 space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    {tour.discountPrice ? (
                      <>
                        <span className="text-3xl font-bold text-brand-green">
                          {formatCurrency(Number(tour.discountPrice))}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatCurrency(Number(tour.basePrice))}
                        </span>
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          SAVE {Math.round(((Number(tour.basePrice) - Number(tour.discountPrice)) / Number(tour.basePrice)) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-brand-green">
                        {formatCurrency(Number(tour.basePrice))}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">per person</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="fa-solid fa-calendar-days text-brand-green w-5"></i>
                    <span>{tour.durationDays} days duration</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="fa-solid fa-users text-brand-green w-5"></i>
                    <span>Max {tour.maxGroupSize} travelers</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="fa-solid fa-map-marker-alt text-brand-green w-5"></i>
                    <span>{tour.locationCity}, {tour.locationCountry}</span>
                  </div>
                </div>

                <Link href={`/book/${tour.id}`} className="block">
                  <Button className="w-full bg-brand-green hover:bg-green-900 text-white py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition">
                    Book Now
                  </Button>
                </Link>

                <div className="pt-4 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check-circle text-green-600"></i>
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check-circle text-green-600"></i>
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Form */}
            <div className="mt-6">
              <TourDetailClient tourId={tour.id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
