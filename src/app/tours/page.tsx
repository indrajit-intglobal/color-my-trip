import { Suspense } from 'react'
import Image from 'next/image'
import { ToursList } from '@/components/public/tours-list'
import { ToursFilters } from '@/components/public/tours-filters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ToursPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div>
      {/* Hero Banner */}
      <header className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center torn-paper-bottom">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2670&auto=format&fit=crop"
            alt="Explore Tours"
            fill
            className="object-cover brightness-[0.85]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-brand-green/30"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <p className="text-brand-accent font-bold tracking-[0.25em] uppercase mb-6">Discover Your Adventure</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Explore Our <span className="text-brand-accent">Tours</span>
          </h1>
          <p className="text-gray-100 text-lg md:text-xl max-w-2xl mx-auto font-light drop-shadow-md">
            Find the perfect travel experience tailored to your dreams
          </p>
        </div>
      </header>

      {/* Tours Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-16">
        <ToursFilters />
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            <p className="mt-4 text-gray-600">Loading tours...</p>
          </div>
        }>
          <ToursList searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  )
}
