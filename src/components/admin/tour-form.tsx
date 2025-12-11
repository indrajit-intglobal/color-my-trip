'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

interface TourImage {
  public_id: string
  secure_url: string
  alt_text?: string
}

interface Tour {
  id?: string
  title: string
  slug: string
  locationCountry: string
  locationCity: string
  category: string
  durationDays: number
  basePrice: number | string
  discountPrice?: number | string | null
  maxGroupSize: number
  description: string
  highlights: string[] | any
  itinerary: any[]
  isPublished: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  images?: Array<{ cloudinaryPublicId: string; secureUrl: string; altText?: string | null }>
}

export function TourForm({ tour }: { tour?: Tour | null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<TourImage[]>([])

  const [itinerary, setItinerary] = useState<Array<{ day: number; title: string; description: string }>>(
    Array.isArray(tour?.itinerary) && tour.itinerary.length > 0
      ? tour.itinerary
      : []
  )

  // Auto-update duration based on itinerary length
  useEffect(() => {
    if (itinerary.length > 0) {
      setFormData((prev) => ({ ...prev, durationDays: itinerary.length }))
    }
  }, [itinerary.length])

  const [formData, setFormData] = useState({
    title: tour?.title || '',
    slug: tour?.slug || '',
    locationCountry: tour?.locationCountry || '',
    locationCity: tour?.locationCity || '',
    category: tour?.category || 'ADVENTURE',
    durationDays: tour?.durationDays || 3,
    basePrice: tour?.basePrice || '',
    discountPrice: tour?.discountPrice || '',
    maxGroupSize: tour?.maxGroupSize || 20,
    description: tour?.description || '',
    highlights: Array.isArray(tour?.highlights) ? tour.highlights.join('\n') : '',
    isPublished: tour?.isPublished || false,
    seoTitle: tour?.seoTitle || '',
    seoDescription: tour?.seoDescription || '',
  })

  useEffect(() => {
    if (tour?.images) {
      setImages(
        tour.images.map((img) => ({
          public_id: img.cloudinaryPublicId,
          secure_url: img.secureUrl,
          alt_text: img.altText || '',
        }))
      )
    }
  }, [tour])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedImages: TourImage[] = []
    let successCount = 0
    let errorCount = 0

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errorCount++
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errorCount++
          continue
        }

        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', 'travel-agency/tours')

          const res = await fetch('/api/admin/upload-image', {
            method: 'POST',
            body: formData,
          })

          const data = await res.json()

          if (data.success) {
            uploadedImages.push({ ...data.data, alt_text: '' })
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      // Add all successfully uploaded images
      if (uploadedImages.length > 0) {
        setImages([...images, ...uploadedImages])
      }

      // Show appropriate toast message
      if (successCount > 0 && errorCount === 0) {
        showToast(
          successCount === 1 
            ? 'Image uploaded successfully' 
            : `${successCount} images uploaded successfully`,
          'success'
        )
      } else if (successCount > 0 && errorCount > 0) {
        showToast(
          `${successCount} image(s) uploaded, ${errorCount} failed`,
          'error'
        )
      } else {
        showToast('Failed to upload images', 'error')
      }
    } catch (error) {
      showToast('An error occurred while uploading images', 'error')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice as string),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice as string) : null,
        durationDays: itinerary.length > 0 ? itinerary.length : Number(formData.durationDays),
        maxGroupSize: Number(formData.maxGroupSize),
        highlights: formData.highlights.split('\n').filter((h) => h.trim()),
        itinerary: itinerary,
        images: images.map((img, index) => ({
          public_id: img.public_id,
          secure_url: img.secure_url,
          alt_text: img.alt_text || formData.title,
        })),
      }

      const url = tour?.id ? `/api/admin/tours/${tour.id}` : '/api/admin/tours'
      const method = tour?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        showToast(tour?.id ? 'Tour updated successfully' : 'Tour created successfully', 'success')
        router.push('/admin/tours')
      } else {
        showToast(data.error || 'Failed to save tour', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country *</label>
              <Input
                value={formData.locationCountry}
                onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <Input
                value={formData.locationCity}
                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADVENTURE">Adventure</SelectItem>
                  <SelectItem value="FAMILY">Family</SelectItem>
                  <SelectItem value="HONEYMOON">Honeymoon</SelectItem>
                  <SelectItem value="WEEKEND">Weekend</SelectItem>
                  <SelectItem value="CULTURAL">Cultural</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (days) *</label>
              <Input
                type="number"
                min="1"
                value={itinerary.length > 0 ? itinerary.length : formData.durationDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 1
                  setFormData({ ...formData, durationDays: days })
                  // If manually changed and itinerary exists, sync itinerary
                  if (itinerary.length > 0 && days !== itinerary.length) {
                    if (days > itinerary.length) {
                      // Add days
                      const newDays = []
                      for (let i = itinerary.length + 1; i <= days; i++) {
                        newDays.push({ day: i, title: `Day ${i}`, description: '' })
                      }
                      setItinerary([...itinerary, ...newDays])
                    } else if (days < itinerary.length) {
                      // Remove days
                      setItinerary(itinerary.slice(0, days))
                    }
                  }
                }}
                required
                className="bg-gray-50"
                title={itinerary.length > 0 ? `Auto-calculated from itinerary (${itinerary.length} days)` : 'Enter duration or add itinerary days'}
              />
              {itinerary.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Auto-calculated from itinerary ({itinerary.length} {itinerary.length === 1 ? 'day' : 'days'})
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Group Size</label>
              <Input
                type="number"
                min="1"
                value={formData.maxGroupSize}
                onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) || 20 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Base Price *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description & Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Highlights (one per line)</label>
            <Textarea
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              rows={6}
              placeholder="Highlight 1&#10;Highlight 2&#10;Highlight 3"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Itinerary</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextDay = itinerary.length + 1
                  setItinerary([
                    ...itinerary,
                    { day: nextDay, title: `Day ${nextDay}`, description: '' },
                  ])
                }}
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Add Day
              </Button>
            </div>
            <div className="space-y-4">
              {itinerary.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-2">No itinerary days added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setItinerary([{ day: 1, title: 'Day 1', description: '' }])
                    }}
                  >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add First Day
                  </Button>
                </div>
              ) : (
                itinerary.map((day, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="!p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm">
                            {day.day}
                          </span>
                          <span className="text-sm font-medium text-gray-600">Day {day.day}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newItinerary = itinerary.filter((_, i) => i !== index)
                            // Renumber days
                            const renumbered = newItinerary.map((d, i) => ({ ...d, day: i + 1 }))
                            setItinerary(renumbered)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">Title</label>
                        <Input
                          value={day.title}
                          onChange={(e) => {
                            const newItinerary = [...itinerary]
                            newItinerary[index].title = e.target.value
                            setItinerary(newItinerary)
                          }}
                          placeholder="Day title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">Description</label>
                        <Textarea
                          value={day.description}
                          onChange={(e) => {
                            const newItinerary = [...itinerary]
                            newItinerary[index].description = e.target.value
                            setItinerary(newItinerary)
                          }}
                          rows={3}
                          placeholder="Day description..."
                        />
                      </div>
                      {index === itinerary.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const nextDay = itinerary.length + 1
                            setItinerary([
                              ...itinerary,
                              { day: nextDay, title: `Day ${nextDay}`, description: '' },
                            ])
                          }}
                        >
                          <i className="fa-solid fa-plus mr-2"></i>
                          Add Next Day
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can select multiple images at once. Maximum 5MB per image.
            </p>
            {uploading && (
              <div className="mt-2 flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin text-brand-green"></i>
                <p className="text-sm text-gray-500">Uploading images...</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <div className="relative h-32 w-full rounded overflow-hidden">
                  <Image
                    src={img.secure_url}
                    alt={img.alt_text || 'Tour image'}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                  className="mt-2 w-full"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO & Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SEO Title</label>
            <Input
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SEO Description</label>
            <Textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Publish tour</label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : tour?.id ? 'Update Tour' : 'Create Tour'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/tours')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

