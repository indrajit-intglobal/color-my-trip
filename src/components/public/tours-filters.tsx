'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ToursFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 when filters change
    router.push(`/tours?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/tours')
  }

  // Count active filters
  const activeFiltersCount = Array.from(searchParams.entries()).filter(
    ([key]) => !['page', 'limit'].includes(key)
  ).length

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 sm:right-6 z-40 h-14 px-4 sm:px-6 rounded-full shadow-2xl bg-gradient-to-r from-brand-green to-green-700 hover:from-brand-green hover:to-green-800 text-white font-semibold flex items-center gap-2 sm:gap-3 transition-all hover:scale-105"
      >
        <i className="fa-solid fa-filter text-lg"></i>
        <span className="hidden sm:inline">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Off-Canvas Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-brand-green via-green-700 to-green-800 text-white p-6 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className="fa-solid fa-filter text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold">Filters</h2>
                <p className="text-sm text-white/80 mt-0.5">Refine your search</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Close filters"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-8">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-brand-green"></i>
              <span>Search Destinations</span>
            </label>
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <Input
                placeholder="Search destinations..."
                defaultValue={searchParams.get('search') || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-11 h-12 rounded-xl border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-base"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-tags text-brand-green"></i>
              <span>Category</span>
            </label>
            <Select
              value={searchParams.get('category') || undefined}
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams.toString())
                if (value === 'ALL') {
                  params.delete('category')
                } else {
                  params.set('category', value)
                }
                params.delete('page')
                router.push(`/tours?${params.toString()}`)
              }}
            >
              <SelectTrigger className="w-full h-12 rounded-xl border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-base">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="ADVENTURE">Adventure</SelectItem>
                <SelectItem value="FAMILY">Family</SelectItem>
                <SelectItem value="HONEYMOON">Honeymoon</SelectItem>
                <SelectItem value="WEEKEND">Weekend</SelectItem>
                <SelectItem value="CULTURAL">Cultural</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-indian-rupee-sign text-brand-green"></i>
              <span>Price Range</span>
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min ₹"
                  defaultValue={searchParams.get('minPrice') || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full h-12 rounded-xl border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-base"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max ₹"
                  defaultValue={searchParams.get('maxPrice') || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full h-12 rounded-xl border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-base"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-brand-green"></i>
              <span>Duration (Days)</span>
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  defaultValue={searchParams.get('minDuration') || ''}
                  onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                  className="w-full h-12 rounded-xl border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-base"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  defaultValue={searchParams.get('maxDuration') || ''}
                  onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                  className="w-full h-12 rounded-xl border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-base"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3 border-t border-gray-200">
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              <i className="fa-solid fa-rotate-left mr-2"></i>
              Clear All Filters
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full h-12 bg-gradient-to-r from-brand-green to-green-700 hover:from-brand-green hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
