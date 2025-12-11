import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#051C12] text-white pt-20 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Company Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
              <i className="fa-solid fa-plane-departure text-white text-sm"></i>
            </div>
            <span className="text-2xl font-serif font-bold tracking-wide">GoFly</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Skyline Plaza, 5th Floor, 123 Main Street Los Angeles, CA 90001, USA
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent transition">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent transition">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent transition">
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold mb-6 font-serif">Quick Links</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li>
              <Link href="/about" className="hover:text-brand-accent transition">About GoFly</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-accent transition">Health & Safety</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-accent transition">Visa Processing</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-brand-accent transition">Travel Inspirations</Link>
            </li>
            <li>
              <Link href="/tours" className="hover:text-brand-accent transition">Traveler Reviews</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-bold mb-6 font-serif">Contact Info</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-start gap-3">
              <i className="fa-brands fa-whatsapp text-brand-accent mt-1"></i>
              <span>+91 345 533 865</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-envelope text-brand-accent mt-1"></i>
              <span>info@gofly.com</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-phone text-brand-accent mt-1"></i>
              <span>+91 456 453 345</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-bold mb-6 font-serif">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe to get up to 10% off on all packages.</p>
          <form className="relative">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-accent"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bg-brand-accent hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} GoFly Inc. All rights reserved.</p>
        <div className="flex gap-4 text-2xl mt-4 md:mt-0">
          <i className="fa-brands fa-cc-visa hover:text-white transition cursor-pointer"></i>
          <i className="fa-brands fa-cc-mastercard hover:text-white transition cursor-pointer"></i>
          <i className="fa-brands fa-cc-paypal hover:text-white transition cursor-pointer"></i>
        </div>
      </div>
    </footer>
  )
}
