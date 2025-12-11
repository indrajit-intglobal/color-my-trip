import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div>
      {/* Hero Banner */}
      <header className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center torn-paper-bottom">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2670&auto=format&fit=crop"
            alt="About Us"
            fill
            className="object-cover brightness-[0.85]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-brand-green/30"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <p className="text-brand-accent font-bold tracking-[0.25em] uppercase mb-6">Get to Know Us</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            About <span className="text-brand-accent">GoFly</span>
          </h1>
          <p className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
            Your trusted partner for unforgettable travel experiences around the world.
          </p>
          <Link href="/tours">
            <Button className="!bg-white !text-brand-green hover:!bg-brand-accent hover:!text-white px-10 py-4 rounded-full font-bold transition shadow-xl hover:scale-105 transform duration-300">
              Explore Our Tours
            </Button>
          </Link>
        </div>
      </header>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="prose max-w-none space-y-8">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to <span className="font-bold text-brand-green">GoFly</span>, your trusted partner for unforgettable travel experiences around the world. With years of experience in the travel industry, we specialize in creating curated tours that combine adventure, culture, and relaxation.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our team of travel experts carefully selects each destination and activity to ensure you have the trip of a lifetime. We believe that travel is not just about visiting places—it's about creating memories, experiencing new cultures, and discovering yourself along the way.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              To make world-class travel experiences accessible to everyone, while providing exceptional service and creating lasting memories for our customers. We strive to be the bridge between your travel dreams and reality.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-4">Our Vision</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              To become the world's most trusted and innovative travel company, known for our commitment to excellence, sustainability, and creating transformative travel experiences that enrich lives and connect cultures.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-6">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-light p-6 rounded-xl">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white mb-4">
                  <i className="fa-solid fa-map-marked-alt text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Expertly Curated Tours</h3>
                <p className="text-gray-600">Handpicked destinations and activities tailored to create amazing experiences</p>
              </div>
              
              <div className="bg-brand-light p-6 rounded-xl">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white mb-4">
                  <i className="fa-solid fa-headset text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">24/7 Customer Support</h3>
                <p className="text-gray-600">Round-the-clock assistance whenever you need help during your journey</p>
              </div>
              
              <div className="bg-brand-light p-6 rounded-xl">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white mb-4">
                  <i className="fa-solid fa-shield-alt text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Flexible Policies</h3>
                <p className="text-gray-600">Flexible booking and cancellation policies to give you peace of mind</p>
              </div>
              
              <div className="bg-brand-light p-6 rounded-xl">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white mb-4">
                  <i className="fa-solid fa-dollar-sign text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Best Prices</h3>
                <p className="text-gray-600">Competitive prices with no hidden fees—transparency you can trust</p>
              </div>
              
              <div className="bg-brand-light p-6 rounded-xl">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white mb-4">
                  <i className="fa-solid fa-users text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Small Groups</h3>
                <p className="text-gray-600">Personalized experiences with small group sizes for better attention</p>
              </div>
              
              <div className="bg-brand-light p-6 rounded-xl">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white mb-4">
                  <i className="fa-solid fa-award text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Award Winning</h3>
                <p className="text-gray-600">Recognized excellence with multiple travel industry awards</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-6">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded with a passion for travel and a commitment to excellence, GoFly has grown from a small startup to a trusted name in the travel industry. Our journey began with a simple belief: that everyone deserves to experience the wonders of the world.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Over the years, we've built lasting relationships with local partners around the globe, ensuring authentic experiences and supporting local communities. We're not just tour operators—we're storytellers, memory makers, and your gateway to the world.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
