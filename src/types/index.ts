import { User, Tour, Booking, Review, ContactMessage, TourImage } from '@prisma/client'

export type UserRole = 'CUSTOMER' | 'ADMIN'
export type TourCategory = 'ADVENTURE' | 'FAMILY' | 'HONEYMOON' | 'WEEKEND' | 'CULTURAL' | 'OTHER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type MessageStatus = 'NEW' | 'READ' | 'ARCHIVED'

export interface TourWithImages extends Tour {
  images: TourImage[]
  reviews?: ReviewWithUser[]
  _count?: {
    reviews: number
    bookings: number
  }
}

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'name' | 'email'>
}

export interface BookingWithTour extends Booking {
  tour: Tour
  user?: User
}

export interface BookingWithDetails extends Booking {
  tour: TourWithImages
  user: User
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TourFilters {
  country?: string
  city?: string
  category?: TourCategory
  minPrice?: number
  maxPrice?: number
  minDuration?: number
  maxDuration?: number
  search?: string
  isPublished?: boolean
}

export interface BookingFilters {
  userId?: string
  tourId?: string
  startDate?: Date
  endDate?: Date
  paymentStatus?: PaymentStatus
  bookingStatus?: BookingStatus
}

