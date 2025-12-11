'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function HeroSearchBar() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [budget, setBudget] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('search', destination)
    if (date) params.set('date', date)
    if (budget) params.set('budget', budget)
    router.push(`/tours?${params.toString()}`)
  }

  return (
    <div className="absolute -bottom-16 md:-bottom-12 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] max-w-5xl z-20">
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-b-4 border-brand-green">
        <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
          <label className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Destination</label>
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-location-dot text-brand-green text-lg flex-shrink-0"></i>
            <input
              type="text"
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full outline-none text-gray-800 font-medium placeholder-gray-400 text-base bg-transparent py-2 focus:text-brand-green transition-colors cursor-text"
            />
          </div>
        </div>

        <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4 md:pl-4">
          <label className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Date</label>
          <div className="flex items-center gap-3">
            <i className="fa-regular fa-calendar text-brand-green text-lg flex-shrink-0"></i>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full outline-none text-gray-800 font-medium placeholder-gray-400 text-base bg-transparent py-2 focus:text-brand-green transition-colors cursor-text [color-scheme:light]"
            />
          </div>
        </div>

        <div className="flex-1 w-full pb-4 md:pb-0 md:pl-4">
          <label className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Budget</label>
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-wallet text-brand-green text-lg flex-shrink-0"></i>
            <input
              type="text"
              placeholder="₹5,000 - ₹20,000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full outline-none text-gray-800 font-medium placeholder-gray-400 text-base bg-transparent py-2 focus:text-brand-green transition-colors cursor-text"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-brand-green hover:bg-green-900 text-white w-full md:w-auto p-4 rounded-xl transition shadow-lg flex items-center justify-center min-w-[60px]"
        >
          <i className="fa-solid fa-magnifying-glass text-xl"></i>
        </button>
      </form>
    </div>
  )
}

