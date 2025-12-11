'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/tours', label: 'Tours', icon: '✈️' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/contact', label: 'Contact Messages', icon: '📧' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/content', label: 'Content', icon: '📝' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-6 overflow-y-auto z-40">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-2xl font-bold">
          Admin Panel
        </Link>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-8 pt-8 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}

