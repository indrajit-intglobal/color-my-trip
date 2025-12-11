'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="absolute top-0 left-0 w-full z-50 py-4 px-6 md:px-12 flex justify-between items-center text-white animate-fade-in-down">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
          <i className="fa-solid fa-plane-departure text-white text-sm"></i>
        </div>
        <span className="text-2xl font-serif font-bold tracking-wide">GoFly</span>
      </div>
      
      <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
        <Link href="/" className="hover:text-brand-accent transition-colors duration-200">Home</Link>
        <Link href="/about" className="hover:text-brand-accent transition-colors duration-200">About Us</Link>
        <Link href="/tours" className="hover:text-brand-accent transition-colors duration-200">Packages</Link>
        <Link href="/contact" className="hover:text-brand-accent transition-colors duration-200">Contact Us</Link>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {session ? (
          <>
            {session.user.role === 'ADMIN' ? (
              <Link href="/admin/dashboard" className="text-sm font-medium hover:text-brand-accent transition">
                Dashboard
              </Link>
            ) : (
              <Link href="/profile" className="text-sm font-medium hover:text-brand-accent transition">
                Profile
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-sm font-medium hover:text-brand-accent transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium hover:text-brand-accent transition">
              Log In
            </Link>
            <Link
              href="/login?signup=true"
              className="bg-brand-accent hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium transition shadow-lg"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
      
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white text-2xl"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm md:hidden">
          <div className="flex flex-col p-6 gap-4">
            <Link href="/" className="text-white hover:text-brand-accent transition">Home</Link>
            <Link href="/about" className="text-white hover:text-brand-accent transition">About Us</Link>
            <Link href="/tours" className="text-white hover:text-brand-accent transition">Packages</Link>
            <Link href="/contact" className="text-white hover:text-brand-accent transition">Contact Us</Link>
            {session ? (
              <>
                {session.user.role === 'ADMIN' ? (
                  <Link href="/admin/dashboard" className="text-white hover:text-brand-accent transition">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/profile" className="text-white hover:text-brand-accent transition">
                    Profile
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-white hover:text-brand-accent transition text-left"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-brand-accent transition">
                  Log In
                </Link>
                <Link
                  href="/login?signup=true"
                  className="bg-brand-accent hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium transition text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
