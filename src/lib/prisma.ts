import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please configure it in your Vercel environment variables.'
  )
}

// Validate DATABASE_URL format for Supabase
// Use a flag to ensure we only warn once during module initialization
let hasWarnedAboutDatabaseUrl = false

if (DATABASE_URL.includes('supabase.co') && typeof window === 'undefined') {
  // Check if we're in a serverless runtime context (Vercel)
  const isRuntime = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
  
  try {
    const url = new URL(DATABASE_URL)
    
    // Check if required parameters are present
    const hasSslMode = url.searchParams.has('sslmode')
    const hasPgbouncer = url.searchParams.has('pgbouncer')
    
    if (!hasSslMode || !hasPgbouncer) {
      // Only validate/warn once, and only in non-build contexts or first time
      if (!hasWarnedAboutDatabaseUrl && !isBuildPhase) {
        hasWarnedAboutDatabaseUrl = true
        
        const errorMessage = 
          '⚠️  DATABASE_URL for Supabase is missing required parameters.\n' +
          'For Vercel deployment with Supabase, your DATABASE_URL should include:\n' +
          '  - sslmode=require\n' +
          '  - pgbouncer=true\n\n' +
          'Use the "Connection Pooling" URL from your Supabase dashboard (not the Direct connection).\n' +
          'Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require&pgbouncer=true'
        
        // Only throw error in actual runtime (Vercel production)
        if (isRuntime) {
          console.error(errorMessage)
          throw new Error('Invalid DATABASE_URL format for Supabase. ' + errorMessage)
        } else {
          // During development, just warn once
          console.warn(errorMessage)
        }
      }
    }
  } catch (error) {
    // If it's our validation error and we're in runtime, rethrow it
    if (error instanceof Error && error.message.includes('Invalid DATABASE_URL')) {
      // Only throw in actual runtime
      if (isRuntime && !isBuildPhase) {
        throw error
      }
    }
    // Silently skip validation errors during build phase
    // (Next.js evaluates modules multiple times during build)
  }
}

// Singleton pattern for Prisma Client in serverless environments (Vercel)
// CRITICAL: Vercel serverless functions can reuse instances between invocations,
// so we must preserve the Prisma client in the global scope to prevent
// connection exhaustion and initialization errors
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create or reuse existing Prisma Client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error', 'warn'],
  })

// Preserve Prisma instance in ALL environments (critical for Vercel serverless)
// This prevents creating multiple Prisma Client instances, which can cause:
// - Connection pool exhaustion
// - "Can't reach database server" errors
// - Performance degradation
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

// Graceful connection cleanup on process termination (important for serverless)
if (typeof window === 'undefined') {
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Silently fail during cleanup to avoid masking other errors
      console.error('Error during Prisma disconnect:', error)
    }
  }
  
  // Register cleanup handlers
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

export default prisma

