import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travel.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@travel.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+1234567890',
    },
  })

  // Create sample customers
  const customerPassword = await bcrypt.hash('password123', 10)
  const customer1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+1234567891',
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+1234567892',
    },
  })

  // Create sample tours
  const tour1 = await prisma.tour.create({
    data: {
      title: 'Paris Weekend Getaway',
      slug: 'paris-weekend-getaway',
      locationCountry: 'France',
      locationCity: 'Paris',
      category: 'WEEKEND',
      durationDays: 3,
      basePrice: 899.99,
      discountPrice: 799.99,
      maxGroupSize: 20,
      description: 'Experience the romance and charm of Paris in this unforgettable weekend getaway. Visit iconic landmarks, enjoy world-class cuisine, and immerse yourself in French culture.',
      highlights: [
        'Eiffel Tower visit with skip-the-line access',
        'Seine River cruise',
        'Louvre Museum guided tour',
        'Traditional French dinner',
        'Montmartre district exploration',
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & City Tour',
          description: 'Arrive in Paris, check into hotel, and enjoy a guided city tour including the Eiffel Tower and Champs-Élysées.',
        },
        {
          day: 2,
          title: 'Museums & Culture',
          description: 'Visit the Louvre Museum in the morning, followed by a Seine River cruise and dinner in Montmartre.',
        },
        {
          day: 3,
          title: 'Departure',
          description: 'Free morning to explore local markets, then departure.',
        },
      ],
      isPublished: true,
      seoTitle: 'Paris Weekend Getaway - 3 Days in the City of Light',
      seoDescription: 'Discover Paris in a weekend with our curated tour package. Visit iconic landmarks and enjoy authentic French experiences.',
      images: {
        create: [
          {
            cloudinaryPublicId: 'sample/paris1',
            secureUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            altText: 'Eiffel Tower at sunset',
            sortOrder: 0,
          },
          {
            cloudinaryPublicId: 'sample/paris2',
            secureUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
            altText: 'Louvre Museum',
            sortOrder: 1,
          },
        ],
      },
    },
  })

  const tour2 = await prisma.tour.create({
    data: {
      title: 'Safari Adventure in Kenya',
      slug: 'safari-adventure-kenya',
      locationCountry: 'Kenya',
      locationCity: 'Nairobi',
      category: 'ADVENTURE',
      durationDays: 7,
      basePrice: 2499.99,
      maxGroupSize: 12,
      description: 'Embark on an incredible wildlife safari through Kenya\'s most famous national parks. Witness the Big Five and experience authentic African culture.',
      highlights: [
        'Game drives in Maasai Mara',
        'Big Five wildlife spotting',
        'Maasai village cultural experience',
        'Hot air balloon safari',
        'Luxury tented accommodation',
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Nairobi',
          description: 'Arrive in Nairobi, transfer to hotel, and briefing session.',
        },
        {
          day: 2,
          title: 'Nairobi to Maasai Mara',
          description: 'Drive to Maasai Mara, afternoon game drive.',
        },
        {
          day: 3,
          title: 'Full Day Safari',
          description: 'Early morning and afternoon game drives in search of the Big Five.',
        },
        {
          day: 4,
          title: 'Hot Air Balloon & Cultural Visit',
          description: 'Optional hot air balloon safari at sunrise, visit Maasai village in the afternoon.',
        },
        {
          day: 5,
          title: 'Lake Nakuru',
          description: 'Transfer to Lake Nakuru National Park, game drive to see flamingos and rhinos.',
        },
        {
          day: 6,
          title: 'Return to Nairobi',
          description: 'Morning game drive, return to Nairobi.',
        },
        {
          day: 7,
          title: 'Departure',
          description: 'Transfer to airport for departure.',
        },
      ],
      isPublished: true,
      seoTitle: 'Kenya Safari Adventure - 7 Days Wildlife Experience',
      seoDescription: 'Experience the ultimate African safari in Kenya. See the Big Five and immerse yourself in Maasai culture.',
      images: {
        create: [
          {
            cloudinaryPublicId: 'sample/kenya1',
            secureUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
            altText: 'Lion in Maasai Mara',
            sortOrder: 0,
          },
        ],
      },
    },
  })

  const tour3 = await prisma.tour.create({
    data: {
      title: 'Tropical Honeymoon in Maldives',
      slug: 'tropical-honeymoon-maldives',
      locationCountry: 'Maldives',
      locationCity: 'Malé',
      category: 'HONEYMOON',
      durationDays: 5,
      basePrice: 3499.99,
      discountPrice: 2999.99,
      maxGroupSize: 2,
      description: 'Celebrate your love in paradise with this romantic honeymoon package. Enjoy overwater villas, pristine beaches, and world-class spa treatments.',
      highlights: [
        'Overwater villa accommodation',
        'Private beach dinners',
        'Couples spa treatments',
        'Snorkeling and diving',
        'Sunset cruises',
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Welcome',
          description: 'Arrive in Maldives, seaplane transfer to resort, welcome dinner.',
        },
        {
          day: 2,
          title: 'Relaxation & Spa',
          description: 'Enjoy the resort facilities, couples spa treatment, and private beach time.',
        },
        {
          day: 3,
          title: 'Water Activities',
          description: 'Snorkeling or diving excursion, sunset cruise in the evening.',
        },
        {
          day: 4,
          title: 'Island Hopping',
          description: 'Visit nearby islands, enjoy local culture and cuisine.',
        },
        {
          day: 5,
          title: 'Departure',
          description: 'Final morning at leisure, then departure.',
        },
      ],
      isPublished: true,
      seoTitle: 'Maldives Honeymoon - Romantic Tropical Paradise',
      seoDescription: 'The perfect honeymoon destination. Enjoy luxury overwater villas and pristine beaches in the Maldives.',
      images: {
        create: [
          {
            cloudinaryPublicId: 'sample/maldives1',
            secureUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            altText: 'Overwater villa in Maldives',
            sortOrder: 0,
          },
        ],
      },
    },
  })

  const tour4 = await prisma.tour.create({
    data: {
      title: 'Family Fun in Orlando',
      slug: 'family-fun-orlando',
      locationCountry: 'USA',
      locationCity: 'Orlando',
      category: 'FAMILY',
      durationDays: 5,
      basePrice: 1999.99,
      maxGroupSize: 6,
      description: 'The ultimate family vacation! Visit world-famous theme parks, enjoy family-friendly activities, and create unforgettable memories.',
      highlights: [
        'Multi-park theme park tickets',
        'Family-friendly accommodations',
        'Character dining experiences',
        'Water park access',
        'Kids club activities',
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Theme Park',
          description: 'Arrive in Orlando, check into family resort, visit first theme park.',
        },
        {
          day: 2,
          title: 'Magic Kingdom',
          description: 'Full day at Magic Kingdom with character meet-and-greets.',
        },
        {
          day: 3,
          title: 'Water Park & Relaxation',
          description: 'Enjoy water park activities, afternoon at resort pool.',
        },
        {
          day: 4,
          title: 'Universal Studios',
          description: 'Explore Universal Studios and Islands of Adventure.',
        },
        {
          day: 5,
          title: 'Departure',
          description: 'Final morning shopping or last-minute park visit, then departure.',
        },
      ],
      isPublished: true,
      seoTitle: 'Orlando Family Vacation - Theme Park Adventure',
      seoDescription: 'Perfect family vacation package for Orlando. Visit theme parks and create magical memories.',
      images: {
        create: [
          {
            cloudinaryPublicId: 'sample/orlando1',
            secureUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
            altText: 'Theme park in Orlando',
            sortOrder: 0,
          },
        ],
      },
    },
  })

  const tour5 = await prisma.tour.create({
    data: {
      title: 'Cultural Journey Through Japan',
      slug: 'cultural-journey-japan',
      locationCountry: 'Japan',
      locationCity: 'Tokyo',
      category: 'CULTURAL',
      durationDays: 10,
      basePrice: 3999.99,
      maxGroupSize: 15,
      description: 'Discover the rich culture and traditions of Japan. From ancient temples to modern cities, experience the best of both worlds.',
      highlights: [
        'Tokyo city exploration',
        'Traditional tea ceremony',
        'Kyoto temple visits',
        'Bullet train experience',
        'Authentic Japanese cuisine',
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Tokyo',
          description: 'Arrive in Tokyo, check into hotel, welcome dinner.',
        },
        {
          day: 2,
          title: 'Tokyo Exploration',
          description: 'Visit Senso-ji Temple, explore Asakusa district, and enjoy traditional lunch.',
        },
        {
          day: 3,
          title: 'Modern Tokyo',
          description: 'Explore Shibuya, Harajuku, and experience modern Japanese culture.',
        },
        {
          day: 4,
          title: 'Travel to Kyoto',
          description: 'Bullet train to Kyoto, afternoon temple visits.',
        },
        {
          day: 5,
          title: 'Kyoto Temples',
          description: 'Visit Fushimi Inari Shrine, Kinkaku-ji, and participate in tea ceremony.',
        },
        {
          day: 6,
          title: 'Nara Day Trip',
          description: 'Day trip to Nara to see deer park and ancient temples.',
        },
        {
          day: 7,
          title: 'Osaka',
          description: 'Travel to Osaka, explore Dotonbori district and local cuisine.',
        },
        {
          day: 8,
          title: 'Hiroshima',
          description: 'Visit Hiroshima Peace Memorial Park and Museum.',
        },
        {
          day: 9,
          title: 'Return to Tokyo',
          description: 'Return to Tokyo, free time for shopping and exploration.',
        },
        {
          day: 10,
          title: 'Departure',
          description: 'Final morning in Tokyo, then departure.',
        },
      ],
      isPublished: true,
      seoTitle: 'Japan Cultural Tour - 10 Days of Tradition and Modernity',
      seoDescription: 'Experience the best of Japan with this comprehensive cultural tour. Visit temples, experience traditions, and enjoy authentic cuisine.',
      images: {
        create: [
          {
            cloudinaryPublicId: 'sample/japan1',
            secureUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
            altText: 'Traditional Japanese temple',
            sortOrder: 0,
          },
        ],
      },
    },
  })

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      userId: customer1.id,
      tourId: tour1.id,
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-17'),
      adults: 2,
      children: 0,
      totalAmount: 1599.98,
      currency: 'INR',
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      specialRequests: 'Window seat preference if possible',
      payment: {
        create: {
          provider: 'STRIPE',
          providerPaymentId: 'mock_payment_001',
          amount: 1599.98,
          currency: 'INR',
          status: 'succeeded',
        },
      },
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      userId: customer2.id,
      tourId: tour3.id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-05'),
      adults: 2,
      children: 0,
      totalAmount: 5999.98,
      currency: 'INR',
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      payment: {
        create: {
          provider: 'STRIPE',
          providerPaymentId: 'mock_payment_002',
          amount: 5999.98,
          currency: 'INR',
          status: 'succeeded',
        },
      },
    },
  })

  // Create sample reviews
  await prisma.review.create({
    data: {
      tourId: tour1.id,
      userId: customer1.id,
      rating: 5,
      comment: 'Amazing experience! The tour was well-organized and we saw all the major attractions. Highly recommend!',
      isApproved: true,
    },
  })

  await prisma.review.create({
    data: {
      tourId: tour3.id,
      userId: customer2.id,
      rating: 5,
      comment: 'Perfect honeymoon destination! The overwater villa was incredible and the service was outstanding.',
      isApproved: true,
    },
  })

  // Create homepage content
  await prisma.homepageContent.upsert({
    where: { key: 'HERO_SECTION' },
    update: {},
    create: {
      key: 'HERO_SECTION',
      content: {
        headline: 'Discover Your Next Adventure',
        subheadline: 'Explore the world with our curated travel experiences',
        ctaPrimary: 'Explore Tours',
        ctaSecondary: 'Plan Your Trip',
      },
    },
  })

  await prisma.homepageContent.upsert({
    where: { key: 'TESTIMONIALS' },
    update: {},
    create: {
      key: 'TESTIMONIALS',
      content: {
        testimonials: [
          {
            name: 'John Doe',
            rating: 5,
            comment: 'Best travel experience ever! Everything was perfectly organized.',
            tour: 'Paris Weekend Getaway',
          },
          {
            name: 'Jane Smith',
            rating: 5,
            comment: 'The honeymoon package exceeded all our expectations. Truly magical!',
            tour: 'Tropical Honeymoon in Maldives',
          },
        ],
      },
    },
  })

  await prisma.homepageContent.upsert({
    where: { key: 'FAQ' },
    update: {},
    create: {
      key: 'FAQ',
      content: {
        faqs: [
          {
            question: 'What is included in the tour price?',
            answer: 'The tour price includes accommodation, transportation, guided tours, and most meals as specified in the itinerary.',
          },
          {
            question: 'Can I cancel my booking?',
            answer: 'Yes, cancellations are allowed up to 30 days before departure for a full refund. Please check our cancellation policy for details.',
          },
          {
            question: 'Do you offer travel insurance?',
            answer: 'Yes, we recommend purchasing travel insurance. We can help you arrange comprehensive coverage for your trip.',
          },
          {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards and bank transfers. Payment plans are available for select tours.',
          },
        ],
      },
    },
  })

  console.log('Seeding completed!')
  console.log('Admin credentials:')
  console.log('Email: admin@travel.com')
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

