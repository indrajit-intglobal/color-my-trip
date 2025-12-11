'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'
import { TourSelector } from './tour-selector'

export function ContentEditor({ contentKey, initialContent }: { contentKey: string; initialContent: any }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({})
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Initialize testimonials, FAQs, and hero slides from content
  useEffect(() => {
    if (contentKey === 'TESTIMONIALS' && content.testimonials) {
      setTestimonials(Array.isArray(content.testimonials) ? content.testimonials : [])
    }
    if (contentKey === 'FAQ' && content.faqs) {
      setFaqs(Array.isArray(content.faqs) ? content.faqs : [])
    }
    if (contentKey === 'HERO_SECTION') {
      if (content.slides && Array.isArray(content.slides)) {
        setHeroSlides(content.slides)
      } else if (content.headline) {
        // Migrate old format to new format
        setHeroSlides([{
          image: content.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop',
          headline: content.headline || '',
          subheadline: content.subheadline || '',
          ctaText: content.ctaPrimary || 'Explore Now',
          ctaLink: content.ctaPrimaryLink || '/tours',
          offerBadge: content.offerBadge || '',
        }])
      } else {
        setHeroSlides([])
      }
    }
  }, [contentKey, content])

  const handleImageUpload = async (slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('File must be an image', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    setUploadingImages((prev) => ({ ...prev, [slideIndex]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'travel-agency/hero')

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        const newSlides = [...heroSlides]
        newSlides[slideIndex].image = data.data.secure_url
        setHeroSlides(newSlides)
        showToast('Image uploaded successfully', 'success')
      } else {
        showToast(data.error || 'Failed to upload image', 'error')
      }
    } catch (error) {
      showToast('An error occurred while uploading', 'error')
    } finally {
      setUploadingImages((prev) => ({ ...prev, [slideIndex]: false }))
      // Reset file input
      if (fileInputRefs.current[slideIndex]) {
        fileInputRefs.current[slideIndex]!.value = ''
      }
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let contentToSave = content
      
      // Update content with current testimonials, FAQs, or hero slides
      if (contentKey === 'TESTIMONIALS') {
        contentToSave = { testimonials }
      } else if (contentKey === 'FAQ') {
        contentToSave = { faqs }
      } else if (contentKey === 'HERO_SECTION') {
        contentToSave = { slides: heroSlides }
      }

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: contentKey,
          content: contentToSave,
        }),
      })

      const data = await res.json()

      if (data.success) {
        showToast('Content saved successfully', 'success')
      } else {
        showToast(data.error || 'Failed to save content', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (contentKey === 'HERO_SECTION') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Manage hero slider slides with offers</p>
          {heroSlides.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setHeroSlides([
                  ...heroSlides,
                  {
                    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop',
                    headline: '',
                    subheadline: '',
                    ctaText: 'Explore Now',
                    ctaLink: '/tours',
                    offerBadge: '',
                  },
                ])
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add Slide
            </Button>
          )}
        </div>

        {heroSlides.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">No hero slides added yet</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setHeroSlides([
                  {
                    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop',
                    headline: '',
                    subheadline: '',
                    ctaText: 'Explore Now',
                    ctaLink: '/tours',
                    offerBadge: '',
                  },
                ])
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add First Slide
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {heroSlides.map((slide, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="!p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-600">Slide {index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHeroSlides(heroSlides.filter((_, i) => i !== index))
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Background Image *</label>
                    
                    {/* Image Preview */}
                    {slide.image && (
                      <div className="mb-3 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={slide.image}
                          alt={`Slide ${index + 1} preview`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex gap-2 mb-2">
                      <input
                        ref={(el) => {
                          fileInputRefs.current[index] = el
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        disabled={uploadingImages[index]}
                        className="hidden"
                        id={`hero-image-upload-${index}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImages[index]}
                        className="w-full"
                        onClick={() => {
                          fileInputRefs.current[index]?.click()
                        }}
                      >
                        {uploadingImages[index] ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-cloud-upload mr-2"></i>
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>

                    {/* URL Input */}
                    <div className="relative">
                      <Input
                        value={slide.image || ''}
                        onChange={(e) => {
                          const newSlides = [...heroSlides]
                          newSlides[index].image = e.target.value
                          setHeroSlides(newSlides)
                        }}
                        placeholder="Or paste image URL here..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload an image to Cloudinary or paste a URL from Cloudinary/Unsplash
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Headline *</label>
                    <Input
                      value={slide.headline || ''}
                      onChange={(e) => {
                        const newSlides = [...heroSlides]
                        newSlides[index].headline = e.target.value
                        setHeroSlides(newSlides)
                      }}
                      placeholder="Main headline text"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Subheadline *</label>
                    <Textarea
                      value={slide.subheadline || ''}
                      onChange={(e) => {
                        const newSlides = [...heroSlides]
                        newSlides[index].subheadline = e.target.value
                        setHeroSlides(newSlides)
                      }}
                      rows={2}
                      placeholder="Supporting text or description"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">CTA Button Text *</label>
                      <Input
                        value={slide.ctaText || ''}
                        onChange={(e) => {
                          const newSlides = [...heroSlides]
                          newSlides[index].ctaText = e.target.value
                          setHeroSlides(newSlides)
                        }}
                        placeholder="Explore Now"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">CTA Link *</label>
                      <TourSelector
                        value={slide.ctaLink || ''}
                        onChange={(value) => {
                          const newSlides = [...heroSlides]
                          newSlides[index].ctaLink = value
                          setHeroSlides(newSlides)
                        }}
                        placeholder="Select or search for a tour..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Offer Badge (Optional)</label>
                    <Input
                      value={slide.offerBadge || ''}
                      onChange={(e) => {
                        const newSlides = [...heroSlides]
                        newSlides[index].offerBadge = e.target.value
                        setHeroSlides(newSlides)
                      }}
                      placeholder="e.g., '50% OFF', 'Limited Time', 'Special Offer'"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to hide badge</p>
                  </div>
                  {index === heroSlides.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setHeroSlides([
                          ...heroSlides,
                          {
                            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop',
                            headline: '',
                            subheadline: '',
                            ctaText: 'Explore Now',
                            ctaLink: '/tours',
                            offerBadge: '',
                          },
                        ])
                      }}
                      className="w-full"
                    >
                      <i className="fa-solid fa-plus mr-2"></i>
                      Add Next Slide
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full bg-brand-green hover:bg-green-800">
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-save"></i>
              Save Changes
            </span>
          )}
        </Button>
      </div>
    )
  }

  if (contentKey === 'TESTIMONIALS') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Add and manage testimonials</p>
          {testimonials.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setTestimonials([
                  ...testimonials,
                  { name: '', rating: 5, comment: '', tour: '' },
                ])
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add Testimonial
            </Button>
          )}
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">No testimonials added yet</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTestimonials([{ name: '', rating: 5, comment: '', tour: '' }])
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add First Testimonial
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="!p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-600">Testimonial {index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTestimonials(testimonials.filter((_, i) => i !== index))
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">Name *</label>
                      <Input
                        value={testimonial.name || ''}
                        onChange={(e) => {
                          const newTestimonials = [...testimonials]
                          newTestimonials[index].name = e.target.value
                          setTestimonials(newTestimonials)
                        }}
                        placeholder="Customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">Rating *</label>
                      <Select
                        value={String(testimonial.rating || 5)}
                        onValueChange={(value) => {
                          const newTestimonials = [...testimonials]
                          newTestimonials[index].rating = parseInt(value)
                          setTestimonials(newTestimonials)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Tour</label>
                    <Input
                      value={testimonial.tour || ''}
                      onChange={(e) => {
                        const newTestimonials = [...testimonials]
                        newTestimonials[index].tour = e.target.value
                        setTestimonials(newTestimonials)
                      }}
                      placeholder="Tour name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Comment *</label>
                    <Textarea
                      value={testimonial.comment || ''}
                      onChange={(e) => {
                        const newTestimonials = [...testimonials]
                        newTestimonials[index].comment = e.target.value
                        setTestimonials(newTestimonials)
                      }}
                      rows={3}
                      placeholder="Customer review comment..."
                      required
                    />
                  </div>
                  {index === testimonials.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTestimonials([
                          ...testimonials,
                          { name: '', rating: 5, comment: '', tour: '' },
                        ])
                      }}
                      className="w-full"
                    >
                      <i className="fa-solid fa-plus mr-2"></i>
                      Add Next Testimonial
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full bg-brand-green hover:bg-green-800">
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-save"></i>
              Save Changes
            </span>
          )}
        </Button>
      </div>
    )
  }

  if (contentKey === 'FAQ') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Add and manage frequently asked questions</p>
          {faqs.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFaqs([...faqs, { question: '', answer: '' }])
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add FAQ
            </Button>
          )}
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">No FAQs added yet</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFaqs([{ question: '', answer: '' }])
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add First FAQ
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="!p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-600">FAQ {index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFaqs(faqs.filter((_, i) => i !== index))
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Question *</label>
                    <Input
                      value={faq.question || ''}
                      onChange={(e) => {
                        const newFaqs = [...faqs]
                        newFaqs[index].question = e.target.value
                        setFaqs(newFaqs)
                      }}
                      placeholder="Enter the question"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Answer *</label>
                    <Textarea
                      value={faq.answer || ''}
                      onChange={(e) => {
                        const newFaqs = [...faqs]
                        newFaqs[index].answer = e.target.value
                        setFaqs(newFaqs)
                      }}
                      rows={4}
                      placeholder="Enter the answer..."
                      required
                    />
                  </div>
                  {index === faqs.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFaqs([...faqs, { question: '', answer: '' }])
                      }}
                      className="w-full"
                    >
                      <i className="fa-solid fa-plus mr-2"></i>
                      Add Next FAQ
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full bg-brand-green hover:bg-green-800">
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-save"></i>
              Save Changes
            </span>
          )}
        </Button>
      </div>
    )
  }

  return null
}

