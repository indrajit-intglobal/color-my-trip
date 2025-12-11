import type { Metadata } from 'next'
import { Poppins, Playfair_Display } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/ui/toast'
import { ConditionalNavbar } from '@/components/shared/conditional-navbar'
import { ConditionalFooter } from '@/components/shared/conditional-footer'
import { Chatbot } from '@/components/public/chatbot'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'GoFly - Wander. Dream. Travel.',
  description: 'Every destination is backed by care, culture, and confidence. Discover the world with GoFly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${poppins.variable} ${playfair.variable} font-sans overflow-x-hidden`} style={{ scrollBehavior: 'smooth' }}>
        <SessionProvider>
          <ToastProvider>
            <ConditionalNavbar />
            <main>
              {children}
            </main>
            <ConditionalFooter />
            <Chatbot />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

