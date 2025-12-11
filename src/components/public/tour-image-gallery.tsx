'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Modal, ModalContent, ModalClose } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'

interface TourImage {
  id: string
  secureUrl: string
  altText?: string | null
}

interface TourImageGalleryProps {
  images: TourImage[]
  title: string
}

export function TourImageGallery({ images, title }: TourImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showControls, setShowControls] = useState(true)

  // Keyboard navigation for lightbox and body scroll lock
  useEffect(() => {
    if (!lightboxOpen) {
      document.body.style.overflow = ''
      return
    }

    // Lock body scroll when lightbox is open
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'f' || e.key === 'F') {
        // Toggle fullscreen with 'F' key
        if (document.documentElement.requestFullscreen) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {})
          } else {
            document.documentElement.requestFullscreen().catch(() => {})
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, lightboxIndex])

  // Reset controls visibility when modal opens
  useEffect(() => {
    if (lightboxOpen) {
      setShowControls(true)
      // Auto-hide controls after 3 seconds
      const timer = setTimeout(() => setShowControls(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lightboxOpen, lightboxIndex])

  if (images.length === 0) {
    return (
      <Card className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-image text-4xl text-gray-400 mb-2"></i>
            <p className="text-gray-500">No images available</p>
          </div>
        </div>
      </Card>
    )
  }

  const goToPrevious = () => {
    const newIndex = lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1
    setLightboxIndex(newIndex)
  }

  const goToNext = () => {
    const newIndex = lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1
    setLightboxIndex(newIndex)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Enhanced grid layout function
  const getGridClass = (totalImages: number, index: number) => {
    if (totalImages === 1) {
      return 'col-span-full row-span-full'
    } else if (totalImages === 2) {
      return 'col-span-1'
    } else if (totalImages === 3) {
      if (index === 0) return 'col-span-2 row-span-2'
      return 'col-span-1'
    } else if (totalImages === 4) {
      return 'col-span-1'
    } else {
      // For 5+ images, first image takes 2x2, others fill remaining space
      if (index === 0) return 'col-span-2 row-span-2'
      return 'col-span-1'
    }
  }

  return (
    <>
      <Card className="rounded-2xl overflow-hidden border-0 shadow-lg">
        <div className="p-1 bg-gradient-to-br from-brand-green/10 to-brand-accent/10">
          <div className="bg-white rounded-xl p-4">
            {/* Gallery Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
                  <i className="fa-solid fa-images text-brand-green"></i>
                  Photo Gallery
                </h2>
                <p className="text-sm text-gray-600 mt-1">{images.length} {images.length === 1 ? 'photo' : 'photos'} available</p>
              </div>
              <button
                onClick={() => openLightbox(0)}
                className="px-4 py-2 bg-brand-green hover:bg-green-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-expand"></i>
                View All
              </button>
            </div>

            {/* Main Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
              {images.slice(0, Math.min(images.length, 6)).map((image, index) => {
                const gridClass = getGridClass(Math.min(images.length, 6), index)
                const isLastVisible = index === 5 && images.length > 6

                return (
                  <button
                    key={image.id}
                    onClick={() => openLightbox(index)}
                    className={`relative group rounded-lg overflow-hidden ${gridClass} hover:opacity-90 transition-all cursor-pointer shadow-md hover:shadow-xl`}
                  >
                    <Image
                      src={image.secureUrl}
                      alt={image.altText || `${title} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">
                        Photo {index + 1}
                      </div>
                    </div>
                    {isLastVisible && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-3xl font-bold mb-1">+{images.length - 6}</div>
                          <div className="text-sm">More Photos</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <i className="fa-solid fa-expand text-gray-800 text-sm"></i>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Thumbnail Strip - Show all images */}
            {images.length > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <i className="fa-solid fa-th text-brand-green"></i>
                    All Photos ({images.length})
                  </h3>
                  {images.length > 6 && (
                    <button
                      onClick={() => openLightbox(0)}
                      className="text-sm text-brand-green hover:text-green-800 font-medium"
                    >
                      View All →
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => openLightbox(index)}
                      className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all shadow-sm hover:shadow-md ${
                        lightboxIndex === index && lightboxOpen
                          ? 'border-brand-green ring-2 ring-brand-green/50 scale-105'
                          : 'border-gray-200 hover:border-brand-green/50 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image.secureUrl}
                        alt={image.altText || `${title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 text-center opacity-0 hover:opacity-100 transition-opacity">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Full Screen Lightbox Modal */}
      <Modal open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <ModalContent 
          className="fixed inset-0 w-screen h-screen max-w-none max-h-none p-0 m-0 bg-black border-0 rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0"
          style={{ 
            left: 0, 
            top: 0, 
            transform: 'none',
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none'
          }}
          onPointerEnter={() => setShowControls(true)}
          onPointerLeave={() => setShowControls(false)}
        >
          <div className="relative w-full h-full flex flex-col" onClick={() => setShowControls(!showControls)}>
            {/* Header Bar */}
            <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-4 md:p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="font-semibold text-lg md:text-xl">{title}</h3>
                  <p className="text-sm text-gray-300">
                    Photo {lightboxIndex + 1} of {images.length}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen().catch(() => {})
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition"
                    aria-label="Enter fullscreen"
                    title="Enter fullscreen (F11)"
                  >
                    <i className="fa-solid fa-expand text-sm"></i>
                  </button>
                  <ModalClose 
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fa-solid fa-times text-lg"></i>
                  </ModalClose>
                </div>
              </div>
            </div>

            {/* Main Image Container - Full Screen */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-full">
                <Image
                  src={images[lightboxIndex].secureUrl}
                  alt={images[lightboxIndex].altText || `${title} - Image ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              </div>

              {/* Navigation Arrows - Full Screen */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPrevious()
                    }}
                    className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-2xl z-40 border border-white/20 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Previous image"
                  >
                    <i className="fa-solid fa-chevron-left text-2xl md:text-3xl"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNext()
                    }}
                    className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-2xl z-40 border border-white/20 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Next image"
                  >
                    <i className="fa-solid fa-chevron-right text-2xl md:text-3xl"></i>
                  </button>
                </>
              )}
            </div>

            {/* Bottom Bar with Thumbnails - Full Screen */}
            {images.length > 1 && (
              <div className={`absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 md:p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-full max-w-7xl mx-auto">
                  <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightboxIndex(index)
                        }}
                        className={`relative flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all shadow-lg ${
                          lightboxIndex === index
                            ? 'border-white ring-4 ring-white/50 scale-110'
                            : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={image.secureUrl}
                          alt={image.altText || `${title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {lightboxIndex === index && (
                          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                            <i className="fa-solid fa-check text-white text-sm"></i>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
