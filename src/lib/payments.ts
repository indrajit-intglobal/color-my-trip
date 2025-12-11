// Razorpay payment integration

import { createRazorpayOrder, verifyRazorpayPayment } from './razorpay'

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled'
  key?: string // Razorpay key ID for frontend
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'INR',
  receipt?: string
): Promise<PaymentIntent> {
  try {
    const order = await createRazorpayOrder(amount, currency, receipt)
    
    // Get Razorpay key ID for frontend
    const { prisma } = await import('./prisma')
    const keyIdSetting = await prisma.settings.findUnique({
      where: { key: 'RAZORPAY_KEY_ID' },
    })
    const keyId = (keyIdSetting?.value as string) || process.env.RAZORPAY_KEY_ID || ''

    return {
      id: order.id,
      client_secret: order.id, // Razorpay uses order ID as identifier
      amount: order.amount,
      currency: order.currency,
      status: 'requires_confirmation',
      key: keyId,
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    throw new Error(error.message || 'Failed to create payment order')
  }
}

export async function confirmPayment(
  orderId: string,
  paymentData: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const result = await verifyRazorpayPayment(
      paymentData.razorpay_order_id,
      paymentData.razorpay_payment_id,
      paymentData.razorpay_signature
    )

    if (!result.success || !result.payment) {
      return { success: false, error: result.error || 'Payment verification failed' }
    }

    return {
      success: true,
      paymentId: result.payment.id,
    }
  } catch (error: any) {
    console.error('Error confirming payment:', error)
    return { success: false, error: error.message || 'Payment confirmation failed' }
  }
}

export async function handleWebhook(
  payload: any,
  signature: string
): Promise<{ success: boolean }> {
  // Razorpay webhook handler
  // Verify signature and process webhook events
  try {
    const crypto = require('crypto')
    const { prisma } = await import('./prisma')
    
    // Get secret from settings
    const secretKeySetting = await prisma.settings.findUnique({
      where: { key: 'RAZORPAY_SECRET_KEY' },
    })
    const secretKey = (secretKeySetting?.value as string) || process.env.RAZORPAY_SECRET_KEY || ''

    // Verify webhook signature
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (generatedSignature !== signature) {
      return { success: false }
    }

    // Handle different webhook events
    const event = payload.event

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity
      // Update booking status if payment is captured
      // This is handled in the webhook route
    }

    return { success: true }
  } catch (error) {
    console.error('Error handling webhook:', error)
    return { success: false }
  }
}
