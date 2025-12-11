import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { HeroSearchBar } from '@/components/public/hero-search-bar'
import { HeroSlider } from '@/components/public/hero-slider'
import { formatCurrency } from '@/lib/utils'
import { RecaptchaProvider } from '@/components/public/recaptcha-provider'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getFeaturedTours() {
  try {
    const tours = await prisma.tour.findMany({
      where: { isPublished: true },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const toursWithRatings = await Promise.all(
      tours.map(async (tour) => {
        const reviews = await prisma.review.findMany({
          where: {
            tourId: tour.id,
            isApproved: true,
          },
          select: { rating: true },
        })
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0
        return { ...tour, averageRating: avgRating }
      })
    )

    return toursWithRatings
  } catch {
    return []
  }
}

async function getHeroContent() {
  try {
    const heroContent = await prisma.homepageContent.findUnique({
      where: { key: 'HERO_SECTION' },
    })
    
    if (heroContent?.content) {
      const content = heroContent.content as any
      // Support both old and new format
      if (content.slides && Array.isArray(content.slides)) {
        return content.slides
      } else if (content.headline) {
        // Migrate old format
        return [{
          image: content.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop',
          headline: content.headline || '',
          subheadline: content.subheadline || '',
          ctaText: content.ctaPrimary || 'Explore Now',
          ctaLink: content.ctaPrimaryLink || '/tours',
          offerBadge: content.offerBadge || '',
        }]
      }
    }
    return []
  } catch {
    return []
  }
}

export default async function HomePage() {
  // Redirect admins to dashboard
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const featuredTours = await getFeaturedTours()
  const heroSlides = await getHeroContent()

  // Get unique destinations from published tours
  const uniqueDestinations = await prisma.tour.findMany({
    where: { isPublished: true },
    select: {
      locationCountry: true,
      locationCity: true,
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
    },
    distinct: ['locationCountry'],
    take: 4,
  })

  const destinations = uniqueDestinations.map((tour) => ({
    name: tour.locationCountry,
    tours: 0, // Will be calculated
    image: tour.images[0]?.secureUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
  }))

  // Count tours per destination
  const destinationsWithCounts = await Promise.all(
    destinations.map(async (dest) => {
      const count = await prisma.tour.count({
        where: {
          isPublished: true,
          locationCountry: dest.name,
        },
      })
      return { ...dest, tours: count }
    })
  )

  return (
    <div>
      {/* reCAPTCHA v3 Provider */}
      <RecaptchaProvider />
      
      {/* Hero Slider Section */}
      <header className="relative w-full torn-paper-bottom pb-24 md:pb-16">
        {heroSlides.length > 0 ? (
          <HeroSlider slides={heroSlides} autoPlay={true} interval={6000} />
        ) : (
          <div className="relative w-full h-[85vh] md:h-[95vh] flex items-center justify-center">
            {/* Default fallback */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop"
                alt="Travel Landscape"
                fill
                className="object-cover brightness-[0.85]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-brand-green/30"></div>
            </div>
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                Fly First Class,<br />Land <span className="text-brand-accent">Refreshed</span>
              </h1>
              <p className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
                Every destination is backed by care, culture, and confidence. Discover the world with GoFly.
              </p>
              <Link href="/tours">
                <Button className="!bg-white !text-brand-green hover:!bg-brand-accent hover:!text-white px-10 py-4 rounded-full font-bold transition shadow-xl hover:scale-105 transform duration-300">
                  Explore Now
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Search / Filter Bar (Floating) */}
        <HeroSearchBar />
      </header>

      {/* Popular Destinations */}
      {destinationsWithCounts.length > 0 && (
      <section className="pt-32 pb-20 px-6 md:px-12 bg-white text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-green mb-12 animate-fade-in">Top Destinations</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {destinationsWithCounts.length > 0 ? destinationsWithCounts.map((dest, index) => (
            <Link key={index} href={`/tours?location=${dest.name}`} className="group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-110 transition-all duration-300 hover:shadow-2xl">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mt-4 text-xl font-bold text-gray-800">{dest.name}</h4>
              <p className="text-sm text-gray-500">{dest.tours} {dest.tours === 1 ? 'Tour' : 'Tours'}</p>
            </Link>
          )) : (
            <div className="col-span-4 text-center text-gray-500 py-8">
              <p>No destinations available yet.</p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Features / Why Choose Us */}
      <section className="bg-brand-beige py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 animate-fade-in">
          <div className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <Card className="bg-white border-l-4 border-brand-green">
              <CardContent className="!p-6 !pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-brand-green mb-4">
                  <i className="fa-solid fa-earth-americas text-xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Best Selection</h4>
                <p className="text-sm text-gray-500 leading-relaxed">We offer a rigorous selection of the best places to travel in the world.</p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-white border-l-4 border-brand-accent">
              <CardContent className="!p-6 !pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-brand-accent mb-4">
                  <i className="fa-solid fa-tag text-xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Best Price</h4>
                <p className="text-sm text-gray-500 leading-relaxed">We guarantee the best price for your trips without hidden costs.</p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-white md:col-span-2 border-l-4 border-blue-500">
              <CardContent className="!p-6 !pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <i className="fa-solid fa-headset text-xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Our support team is available 24 hours a day to help you.</p>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/2 space-y-6">
            <span className="text-brand-accent font-semibold tracking-wider uppercase">Why Choose Us?</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-green leading-tight">
              Travel with Confidence and Safety
            </h2>
            <p className="text-gray-600 text-lg">
              We plan your trip completely so you can enjoy your vacation without worries. We have the best professionals to guide you.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-brand-green"></i>
                <span className="text-gray-700 font-medium">Experienced Guides</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-brand-green"></i>
                <span className="text-gray-700 font-medium">Safe Travel Logistics</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-brand-green"></i>
                <span className="text-gray-700 font-medium">Customizable Packages</span>
              </li>
            </ul>
          </div>
        </div>
      </section>


      {/* Popular Activities */}
      <section className="py-20 bg-blue-50/50 px-6 md:px-12">
        <div className="text-center mb-16">
          <h3 className="text-brand-accent font-semibold tracking-wider uppercase mb-2">Deals & Discounts</h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-green">Popular Travel Packages</h2>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTours.slice(0, 3).map((tour, index) => (
            <Card key={tour.id} className="rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col h-full bg-white hover-lift opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}>
              <div className="h-64 overflow-hidden relative flex-shrink-0">
                {index === 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-xs font-bold px-3 py-1 rounded-full text-white z-10 animate-pulse shadow-lg">
                    HOT SALE
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-xs font-bold px-3 py-1 rounded-full text-white z-10 shadow-lg">
                    HOT SALE
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute top-4 right-4 bg-brand-accent text-xs font-bold px-3 py-1 rounded-full text-white z-10 shadow-lg">
                    POPULAR
                  </div>
                )}
                {tour.images[0] ? (
                  <Image
                    src={tour.images[0].secureUrl}
                    alt={tour.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <CardContent className="px-6 pt-8 pb-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h4 className="text-xl font-bold text-gray-800 leading-tight flex-1">{tour.title}</h4>
                  <span className="flex items-center gap-1 text-yellow-500 text-sm whitespace-nowrap">
                    <i className="fa-solid fa-star text-xs"></i>
                    <span className="font-semibold">{tour.averageRating > 0 ? tour.averageRating.toFixed(1) : '5.0'}</span>
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                  {tour.description.length > 100 ? tour.description.substring(0, 100) + '...' : tour.description}
                </p>
                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-400 block mb-1">{tour.durationDays} Days / Per Person</span>
                    <span className="text-2xl font-bold text-brand-green">
                      {formatCurrency(Number(tour.discountPrice || tour.basePrice))}
                    </span>
                  </div>
                  <Link href={`/tours/${tour.slug}`} className="flex-shrink-0">
                    <Button className="text-brand-green font-semibold hover:text-white hover:bg-brand-green border border-brand-green px-3 py-1.5 rounded-full transition text-xs whitespace-nowrap">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  )
}
