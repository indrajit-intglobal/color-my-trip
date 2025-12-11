import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is set - no fallbacks, must come from environment
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please configure it in your Vercel environment variables.'
  )
}

// Validate DATABASE_URL format for Supabase in Vercel production runtime only
// Skip validation during build phase to prevent build failures
if (
  typeof window === 'undefined' &&
  process.env.DATABASE_URL.includes('supabase.co') &&
  process.env.VERCEL === '1' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  try {
    const url = new URL(process.env.DATABASE_URL)
    const hasSslMode = url.searchParams.has('sslmode')
    const hasPgbouncer = url.searchParams.has('pgbouncer')
    
    if (!hasSslMode || !hasPgbouncer) {
      const errorMessage = 
        'DATABASE_URL for Supabase is missing required parameters for Vercel deployment.\n' +
        'Required format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require&pgbouncer=true\n' +
        'Use the "Connection Pooling" URL from your Supabase dashboard.\n' +
        'Direct connection URLs will not work in Vercel serverless functions.'
      
      console.error('❌', errorMessage)
      throw new Error(errorMessage)
    }
  } catch (error) {
    // If URL parsing fails, let Prisma handle the connection error
    if (error instanceof Error && !error.message.includes('DATABASE_URL')) {
      console.warn('Could not parse DATABASE_URL for validation:', error.message)
    } else {
      // Re-throw our validation errors
      throw error
    }
  }
}

// Vercel-safe Prisma Client singleton pattern
// This pattern prevents connection pool exhaustion in serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

// Preserve instance in non-production to prevent multiple instances during development
// In Vercel production, each serverless function invocation gets a fresh globalThis,
// so we don't need to preserve (and Prisma handles connection pooling automatically)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

