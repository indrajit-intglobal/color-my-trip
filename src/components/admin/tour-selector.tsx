'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Tour {
  id: string
  title: string
  slug: string
  locationCity: string
  locationCountry: string
}

interface TourSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TourSelector({ value, onChange, placeholder = 'Select or search for a tour...' }: TourSelectorProps) {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch tours on mount
  useEffect(() => {
    fetchTours()
  }, [])

  // Filter tours based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTours(tours)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTours(
        tours.filter(
          (tour) =>
            tour.title.toLowerCase().includes(query) ||
            tour.locationCity.toLowerCase().includes(query) ||
            tour.locationCountry.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, tours])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchTours = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tours?limit=1000')
      const data = await res.json()

      if (data.success) {
        setTours(data.data || [])
        setFilteredTours(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedTour = tours.find((tour) => `/tours/${tour.slug}` === value || tour.id === value)
  const isCustomLink = value && !selectedTour && value !== ''

  const handleSelect = (tour: Tour) => {
    onChange(`/tours/${tour.slug}`)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCustomLink = () => {
    // Allow custom link if user types something that doesn't match
    if (searchQuery) {
      const link = searchQuery.startsWith('/') ? searchQuery : `/${searchQuery}`
      onChange(link)
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleClear = () => {
    onChange('')
    setSearchQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={isOpen ? searchQuery : (selectedTour?.title || (isCustomLink ? value : '') || '')}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearchQuery(selectedTour?.title || '')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filteredTours.length > 0) {
                handleSelect(filteredTours[0])
              } else if (searchQuery) {
                handleCustomLink()
              }
            } else if (e.key === 'Escape') {
              setIsOpen(false)
            }
          }}
          placeholder={placeholder}
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Clear selection"
            >
              <i className="fa-solid fa-times text-sm"></i>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-sm`}></i>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              Loading tours...
            </div>
          ) : filteredTours.length > 0 ? (
            <>
              {filteredTours.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => handleSelect(tour)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    value === `/tours/${tour.slug}` ? 'bg-brand-green/10 text-brand-green font-medium' : ''
                  }`}
                >
                  <div className="font-medium">{tour.title}</div>
                  <div className="text-xs text-gray-500">
                    {tour.locationCity}, {tour.locationCountry}
                  </div>
                </button>
              ))}
              {searchQuery && !tours.some((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())) && (
                <div className="border-t border-gray-200 p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCustomLink}
                    className="w-full text-xs"
                  >
                    Use custom link: {searchQuery.startsWith('/') ? searchQuery : `/${searchQuery}`}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchQuery ? (
                <>
                  <p>No tours found matching "{searchQuery}"</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCustomLink}
                    className="mt-2 text-xs"
                  >
                    Use custom link: {searchQuery.startsWith('/') ? searchQuery : `/${searchQuery}`}
                  </Button>
                </>
              ) : (
                'No tours available'
              )}
            </div>
          )}
        </div>
      )}

      {value && !isOpen && (
        <p className="text-xs text-gray-500 mt-1">
          <i className={`fa-solid ${selectedTour ? 'fa-map-location-dot' : 'fa-link'} mr-1`}></i>
          {selectedTour ? `Tour: ${selectedTour.title}` : `Custom Link: ${value}`}
        </p>
      )}
    </div>
  )
}

