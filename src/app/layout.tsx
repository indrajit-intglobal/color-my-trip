import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/ui/toast'
import { ConditionalNavbar } from '@/components/shared/conditional-navbar'
import { ConditionalFooter } from '@/components/shared/conditional-footer'
import { Chatbot } from '@/components/public/chatbot'

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
      <body className="font-sans overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
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

