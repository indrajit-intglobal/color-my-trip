import Razorpay from 'razorpay'
import { prisma } from './prisma'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt?: string
  status: string
}

export interface RazorpayPayment {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  method: string
}

// Get Razorpay instance with admin-configured keys
async function getRazorpayInstance() {
  // Try to get from database settings first
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['RAZORPAY_KEY_ID', 'RAZORPAY_SECRET_KEY'],
      },
    },
  })

  const keyIdSetting = settings.find((s) => s.key === 'RAZORPAY_KEY_ID')
  const secretKeySetting = settings.find((s) => s.key === 'RAZORPAY_SECRET_KEY')

  const keyId = (keyIdSetting?.value as string) || process.env.RAZORPAY_KEY_ID
  const secretKey = (secretKeySetting?.value as string) || process.env.RAZORPAY_SECRET_KEY

  if (!keyId || !secretKey) {
    throw new Error('Razorpay credentials not configured. Please configure in admin settings.')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: secretKey,
  })
}

export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt?: string
): Promise<RazorpayOrder> {
  const razorpay = await getRazorpayInstance()

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1, // Auto capture payment
  })

  return {
    id: order.id,
    amount: order.amount / 100, // Convert back to rupees
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<{ success: boolean; payment?: RazorpayPayment; error?: string }> {
  try {
    const razorpay = await getRazorpayInstance()

    // Get secret key for signature verification
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ['RAZORPAY_SECRET_KEY'],
        },
      },
    })
    const secretKeySetting = settings.find((s) => s.key === 'RAZORPAY_SECRET_KEY')
    const secretKey = (secretKeySetting?.value as string) || process.env.RAZORPAY_SECRET_KEY || ''

    // Verify payment signature
    const crypto = require('crypto')
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (generatedSignature !== signature) {
      return { success: false, error: 'Invalid payment signature' }
    }

    // Fetch payment details
    const payment = await razorpay.payments.fetch(paymentId)

    return {
      success: true,
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
      },
    }
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error)
    return { success: false, error: error.message || 'Payment verification failed' }
  }
}

export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const razorpay = await getRazorpayInstance()

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
    })

    return {
      success: true,
      refundId: refund.id,
    }
  } catch (error: any) {
    console.error('Error processing Razorpay refund:', error)
    return { success: false, error: error.message || 'Refund failed' }
  }
}

