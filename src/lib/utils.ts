import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateTotalPrice(
  basePrice: number,
  discountPrice: number | null | undefined,
  adults: number,
  children: number,
  childDiscount: number = 0.5
): number {
  const pricePerPerson = discountPrice ?? basePrice
  const adultTotal = pricePerPerson * adults
  const childTotal = pricePerPerson * childDiscount * children
  return adultTotal + childTotal
}

export function generateBookingReference(): string {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

