'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeroSlide {
  id?: number
  image: string
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
  offerBadge?: string
  overlay?: boolean
}

interface HeroSliderProps {
  slides: HeroSlide[]
  autoPlay?: boolean
  interval?: number
}

export function HeroSlider({ slides, autoPlay = true, interval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  if (!slides || slides.length === 0) {
    return null
  }

  const currentSlide = slides[currentIndex]

  return (
    <div className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop'}
                alt={slide.headline || 'Hero Slide'}
                fill
                className="object-cover brightness-[0.85]"
                priority={index === 0}
                sizes="100vw"
              />
              <div className={`absolute inset-0 ${slide.overlay !== false ? 'bg-gradient-to-b from-black/50 via-transparent to-brand-green/30' : ''}`}></div>
            </div>

            {/* Content - Always render but control visibility */}
            <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto h-full flex flex-col items-center justify-center mt-10 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}>
              {slide.offerBadge && (
                <Badge className="bg-brand-accent text-white border-0 mb-4 px-4 py-2 text-sm font-semibold animate-pulse">
                  {slide.offerBadge}
                </Badge>
              )}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                {slide.headline}
              </h1>
              <p className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
                {slide.subheadline}
              </p>
              <Link href={slide.ctaLink || '/tours'}>
                <Button className="!bg-white !text-brand-green hover:!bg-brand-accent hover:!text-white px-10 py-4 rounded-full font-bold transition shadow-xl hover:scale-105 transform duration-300">
                  {slide.ctaText || 'Explore Now'}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition shadow-lg"
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left text-xl"></i>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition shadow-lg"
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right text-xl"></i>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

