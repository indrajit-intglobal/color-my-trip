'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, calculateTotalPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Tour {
  id: string
  title: string
  basePrice: number | string
  discountPrice?: number | string | null
  maxGroupSize: number
  images: Array<{ secureUrl: string }>
}

export function BookingFlow({ tour }: { tour: Tour }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  })

  const [bookingId, setBookingId] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  // Load Razorpay checkout script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => setRazorpayLoaded(true)
      document.body.appendChild(script)
    } else if (window.Razorpay) {
      setRazorpayLoaded(true)
    }
  }, [])

  const totalPrice = calculateTotalPrice(
    Number(tour.basePrice),
    tour.discountPrice ? Number(tour.discountPrice) : null,
    bookingData.adults,
    bookingData.children
  )

  const handleStep1 = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      showToast('Please select dates', 'error')
      return
    }
    if (bookingData.adults + bookingData.children > tour.maxGroupSize) {
      showToast(`Maximum group size is ${tour.maxGroupSize}`, 'error')
      return
    }
    setStep(2)
  }

  const handleStep2 = async () => {
    if (!bookingData.name || !bookingData.email || !bookingData.phone) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    setStep(3)
  }

  const handleStep3 = async () => {
    setLoading(true)
    try {
      // Create booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          adults: bookingData.adults,
          children: bookingData.children,
          specialRequests: bookingData.specialRequests,
        }),
      })

      const bookingResult = await bookingRes.json()
      if (!bookingResult.success) {
        throw new Error(bookingResult.error)
      }

      setBookingId(bookingResult.data.id)
      setStep(4)
    } catch (error: any) {
      showToast(error.message || 'Failed to create booking', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStep4 = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      showToast('Payment gateway is loading. Please wait...', 'error')
      return
    }

    if (!bookingId) {
      showToast('Booking not found. Please try again.', 'error')
      return
    }

    setLoading(true)
    try {
      // Create Razorpay order
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'INR',
          receipt: `booking_${bookingId}`,
        }),
      })

      const intentResult = await intentRes.json()
      if (!intentResult.success) {
        throw new Error(intentResult.error)
      }

      const order = intentResult.data

      // Initialize Razorpay checkout
      const options = {
        key: order.key,
        amount: Math.round(totalPrice * 100), // Amount in paise
        currency: order.currency,
        name: 'GoFly Travel Agency',
        description: `Booking for ${tour.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify and confirm payment
            const confirmRes = await fetch('/api/payments/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId,
                orderId: order.id,
                paymentData: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }),
            })

            const confirmResult = await confirmRes.json()
            if (!confirmResult.success) {
              throw new Error(confirmResult.error || 'Payment verification failed')
            }

            showToast('Booking confirmed!', 'success')
            router.push(`/bookings/${bookingId}/confirmation`)
          } catch (error: any) {
            showToast(error.message || 'Payment verification failed', 'error')
            setLoading(false)
          }
        },
        prefill: {
          name: bookingData.name,
          email: bookingData.email,
          contact: bookingData.phone,
        },
        theme: {
          color: '#1A4D2E',
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function (response: any) {
        showToast('Payment failed. Please try again.', 'error')
        setLoading(false)
      })
      razorpay.open()
    } catch (error: any) {
      showToast(error.message || 'Payment failed. Please try again.', 'error')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Dates & Travelers */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Dates & Travelers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Adults</label>
                <Input
                  type="number"
                  min="1"
                  max={tour.maxGroupSize}
                  value={bookingData.adults}
                  onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Children</label>
                <Input
                  type="number"
                  min="0"
                  max={tour.maxGroupSize - bookingData.adults}
                  value={bookingData.children}
                  onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button onClick={handleStep1} className="w-full">Continue</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Traveler Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Traveler Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={bookingData.name}
                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={bookingData.email}
                onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                type="tel"
                value={bookingData.phone}
                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
              <Textarea
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={handleStep2} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Order Summary */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">{tour.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Adults ({bookingData.adults})</span>
                <span>{formatCurrency(Number(tour.discountPrice || tour.basePrice) * bookingData.adults)}</span>
              </div>
              {bookingData.children > 0 && (
                <div className="flex justify-between">
                  <span>Children ({bookingData.children})</span>
                  <span>{formatCurrency(Number(tour.discountPrice || tour.basePrice) * 0.5 * bookingData.children)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleStep3} disabled={loading} className="flex-1">
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-brand-green to-green-700 text-white p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
              </div>
              <p className="text-sm text-green-100">
                Secure payment powered by Razorpay. Supports Cards, UPI, Net Banking, and Wallets.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-shield-halved text-blue-600 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Secure Payment</p>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure. We support multiple payment methods including UPI, Credit/Debit Cards, and Net Banking.
                  </p>
                </div>
              </div>
            </div>

            {!razorpayLoaded && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading payment gateway...</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1" disabled={loading}>
                Back
              </Button>
              <Button 
                onClick={handleStep4} 
                disabled={loading || !razorpayLoaded} 
                className="flex-1 bg-brand-green hover:bg-green-800"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-lock"></i>
                    Pay {formatCurrency(totalPrice)}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

