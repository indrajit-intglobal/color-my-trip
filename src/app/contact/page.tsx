'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Recaptcha, useRecaptcha } from '@/components/public/recaptcha'

export default function ContactPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [siteKey, setSiteKey] = useState<string>('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const { executeRecaptcha } = useRecaptcha(siteKey)

  useEffect(() => {
    // Fetch reCAPTCHA site key
    fetch('/api/recaptcha/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.siteKey) {
          setSiteKey(data.siteKey)
        }
      })
      .catch(err => {
        console.error('Failed to load reCAPTCHA config:', err)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Execute reCAPTCHA if available
      let recaptchaToken = null
      if (recaptchaReady && siteKey) {
        recaptchaToken = await executeRecaptcha('contact_form')
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      })

      const data = await res.json()

      if (data.success) {
        showToast(data.message || 'Message sent successfully!', 'success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        showToast(data.error || 'Failed to send message', 'error')
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {siteKey && <Recaptcha siteKey={siteKey} onLoad={() => setRecaptchaReady(true)} />}
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-600">support@travelagency.com</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Address</h3>
            <p className="text-gray-600">123 Travel St, City, Country</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

