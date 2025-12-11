'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

export function ProfileForm() {
  const { data: session, update } = useSession()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setFormData({
              name: data.data.name,
              email: data.data.email,
              phone: data.data.phone || '',
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        showToast('Profile updated successfully!', 'success')
        await update()
      } else {
        showToast(data.error || 'Failed to update profile', 'error')
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const userInitials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <Card className="overflow-hidden">
      {/* Profile Header */}
      <div className="relative h-32 bg-gradient-to-r from-brand-green to-green-700">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            {(session?.user as any)?.image ? (
              <Image
                src={(session?.user as any)?.image}
                alt={formData.name || 'Profile'}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-accent to-orange-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{userInitials}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="!p-6 !pt-16">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">
            {formData.name || 'User'}
          </h3>
          <p className="text-sm text-gray-500">{formData.email}</p>
          {session?.user?.role === 'ADMIN' && (
            <span className="inline-block mt-2 px-3 py-1 bg-brand-accent/20 text-brand-accent text-xs font-semibold rounded-full">
              Administrator
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-user text-gray-400"></i>
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-envelope text-gray-400"></i>
              </div>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="pl-12 h-12 border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <i className="fa-solid fa-info-circle"></i>
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-phone text-gray-400"></i>
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand-green hover:bg-green-800 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Updating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-save"></i>
                Update Profile
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
