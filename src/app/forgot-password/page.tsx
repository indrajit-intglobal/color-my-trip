'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Failed to send reset email', 'error')
        setLoading(false)
        return
      }

      if (data.success) {
        setSent(true)
        showToast(data.message || 'Password reset link sent to your email', 'success')
      } else {
        showToast(data.error || 'Failed to send reset email', 'error')
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-green to-green-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
            alt="Travel"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center">
              <i className="fa-solid fa-plane-departure text-white"></i>
            </div>
            <span className="text-3xl font-serif font-bold tracking-wide">GoFly</span>
          </Link>
          <h2 className="text-4xl font-serif font-bold mb-4">Reset Your Password</h2>
          <p className="text-lg text-gray-200 leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-brand-light via-white to-brand-beige">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center">
              <i className="fa-solid fa-plane-departure text-white"></i>
            </div>
            <span className="text-3xl font-serif font-bold text-brand-green tracking-wide">GoFly</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-key text-brand-green text-2xl"></i>
              </div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">
                {sent
                  ? 'Check your email for reset instructions'
                  : "No worries! Enter your email and we'll send you reset instructions."}
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-brand-green hover:bg-green-800 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-check text-green-600 text-3xl"></i>
                </div>
                <p className="text-gray-700">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Please check your inbox and click on the link to reset your password. The link will expire in 1 hour.
                </p>
                <Button
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-brand-green transition inline-flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

