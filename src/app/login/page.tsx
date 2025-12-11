'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session) {
      // Redirect admins to dashboard, users to their intended destination
      if (session.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
      }
    }
  }, [session, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error')
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          showToast(data.error || 'Failed to create account', 'error')
          setLoading(false)
          return
        }

        if (data.success) {
          showToast('Account created successfully! Please sign in.', 'success')
          setIsSignUp(false)
          setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        } else {
          showToast(data.error || 'Failed to create account', 'error')
        }
      } else {
        // Sign in
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          showToast('Invalid email or password', 'error')
        } else if (result?.ok) {
          // Session will update, useEffect will handle redirect based on role
          // Force a session update by waiting a bit
          setTimeout(async () => {
            await router.refresh()
            // The useEffect will redirect based on the updated session
          }, 100)
        }
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
          <h2 className="text-4xl font-serif font-bold mb-4">
            {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed mb-8">
            {isSignUp
              ? 'Join thousands of travelers exploring the world with GoFly. Create your account and start planning your next adventure today.'
              : 'Sign in to continue exploring amazing destinations and manage your travel bookings.'}
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <i className="fa-solid fa-globe text-brand-accent"></i>
              </div>
              <div>
                <div className="font-semibold">Explore Destinations</div>
                <div className="text-sm text-gray-300">Discover amazing places worldwide</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <i className="fa-solid fa-calendar-check text-brand-accent"></i>
              </div>
              <div>
                <div className="font-semibold">Easy Booking</div>
                <div className="text-sm text-gray-300">Book your dream trip in minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <i className="fa-solid fa-shield-halved text-brand-accent"></i>
              </div>
              <div>
                <div className="font-semibold">Secure & Safe</div>
                <div className="text-sm text-gray-300">Your data is protected with us</div>
              </div>
            </div>
          </div>
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
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h1>
              <p className="text-gray-600">
                {isSignUp ? 'Join GoFly and start exploring' : 'Welcome back! Please sign in to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
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
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-gray-400"></i>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 pr-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fa-solid fa-lock text-gray-400"></i>
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-12 pr-12 h-12 border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm font-medium text-brand-green hover:text-brand-accent transition">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-brand-green hover:bg-green-800 text-white rounded-xl font-semibold text-base shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Processing...
                  </span>
                ) : (
                  <>
                    {isSignUp ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-user-plus"></i>
                        Create Account
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-sign-in-alt"></i>
                        Sign In
                      </span>
                    )}
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                  }}
                  className="font-semibold text-brand-green hover:text-brand-accent transition"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-brand-green transition inline-flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to home
              </Link>
            </div>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            By {isSignUp ? 'signing up' : 'signing in'}, you agree to our{' '}
            <Link href="#" className="text-brand-green hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-brand-green hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
