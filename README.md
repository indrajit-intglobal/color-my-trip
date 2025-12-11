# Travel Agency - Full-Stack Web Application

A modern, production-ready travel agency web application built with Next.js, TypeScript, PostgreSQL, and Cloudinary. Features both a customer-facing website and an admin dashboard for managing tours, bookings, users, and content.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React Server Components
- **Styling**: Tailwind CSS with headless UI components (Radix UI)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **File Storage**: Cloudinary for image management
- **Payments**: Razorpay integration with UPI, Cards, Net Banking, and Wallets support
- **Email**: Gmail SMTP for transactional emails

## Features

### Customer-Facing Site
- Browse and search tours with filters (category, price, duration, location)
- Detailed tour pages with image carousels, itineraries, and reviews
- Multi-step booking flow with Razorpay payment processing (UPI, Cards, Net Banking, Wallets)
- User accounts with booking history and cancellation
- Password reset functionality
- Contact form and FAQ section
- Responsive design for mobile, tablet, and desktop

### Admin Dashboard
- Dashboard with statistics and recent bookings
- Tour management (create, edit, delete tours with image uploads)
- Booking management with status updates
- Review management (approve/reject reviews)
- Contact messages management
- User management
- Content management (homepage sections, testimonials, FAQ)
- Settings configuration (Razorpay, SMTP, General)

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Cloudinary account (for image uploads)
- Razorpay account (for payment processing)
- Gmail account with App Password (for email notifications)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-agency
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/travel_agency?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Razorpay Payment Gateway (Optional - can be configured in admin panel)
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_SECRET_KEY="your-secret-key"

   # Gmail SMTP (Optional - can be configured in admin panel)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_EMAIL="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM_NAME="GoFly Travel Agency"
   SMTP_ENABLED="true"

   # App Configuration
   SUPPORT_EMAIL="support@gofly.com"
   ```

4. **Set up the database**
   
   Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed the database**
   
   Populate the database with sample data:
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Configuration

### Razorpay Setup

1. **Create a Razorpay Account**
   - Sign up at [https://razorpay.com](https://razorpay.com)
   - Complete KYC verification

2. **Get API Keys**
   - Go to Razorpay Dashboard → Settings → API Keys
   - Copy your Key ID and Secret Key
   - For testing, use Test Mode keys (starts with `rzp_test_`)

3. **Configure in Admin Panel**
   - Log in as admin
   - Go to Settings → Razorpay Payment Gateway
   - Enter your Key ID and Secret Key
   - Save settings

   Alternatively, you can set them in `.env` file:
   ```env
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_SECRET_KEY="your-secret-key"
   ```

### Gmail SMTP Setup

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "GoFly Travel Agency" as the name
   - Copy the generated 16-character password

3. **Configure in Admin Panel**
   - Log in as admin
   - Go to Settings → Email Settings (Gmail SMTP)
   - Enable Email Notifications
   - Enter your Gmail address
   - Enter the App Password (not your regular password)
   - Save settings

   Alternatively, you can set them in `.env` file:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_EMAIL="your-email@gmail.com"
   SMTP_PASSWORD="your-16-char-app-password"
   SMTP_FROM_NAME="GoFly Travel Agency"
   SMTP_ENABLED="true"
   ```

## Default Credentials

After seeding the database, you can log in with:

**Admin Account:**
- Email: `admin@travel.com`
- Password: `admin123`

**Customer Accounts:**
- Email: `john@example.com` or `jane@example.com`
- Password: `password123`

## Project Structure

```
travel-agency/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/         # Public routes
│   │   ├── admin/            # Admin dashboard
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── public/           # Public site components
│   │   ├── admin/            # Admin components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility libraries
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── cloudinary.ts     # Cloudinary client
│   │   └── payments.ts       # Mock payment logic
│   └── types/                # TypeScript types
├── public/                   # Static assets
└── package.json
```

## Database Schema

The application uses the following main models:
- `User` - Users (customers and admins)
- `Tour` - Tour packages
- `TourImage` - Tour images stored in Cloudinary
- `Booking` - Customer bookings
- `Payment` - Payment records
- `Review` - Tour reviews
- `ContactMessage` - Contact form submissions
- `HomepageContent` - CMS content for homepage

## API Routes

### Public Routes
- `GET /api/tours` - List tours with filters
- `GET /api/tours/[slug]` - Get tour details
- `POST /api/bookings` - Create booking
- `GET /api/bookings/me` - Get user's bookings
- `POST /api/reviews` - Create review
- `POST /api/contact` - Submit contact form

### Admin Routes (Protected)
- `GET /api/admin/tours` - List all tours
- `POST /api/admin/tours` - Create tour
- `PUT /api/admin/tours/[id]` - Update tour
- `DELETE /api/admin/tours/[id]` - Delete tour
- `GET /api/admin/bookings` - List bookings
- `PATCH /api/admin/bookings/[id]` - Update booking status
- `POST /api/admin/upload-image` - Upload image to Cloudinary

## Key Features Implementation

### Authentication
- NextAuth.js with credentials provider
- JWT-based sessions
- Protected routes with middleware
- Role-based access control (Admin vs Customer)

### Image Management
- Cloudinary integration for image uploads
- Multiple images per tour with ordering
- Automatic image optimization

### Payment Processing
- Razorpay integration with full payment gateway support
- Supports Cards, UPI, Net Banking, Wallets, and more
- Payment order creation and verification
- Automatic refund processing on booking cancellation
- Webhook support for payment status updates

### Booking Flow
- Multi-step booking process:
  1. Select dates and travelers
  2. Enter traveler information
  3. Review order summary
  4. Process payment via Razorpay (Cards, UPI, Net Banking, Wallets)
  5. Confirmation page with email notification

### Email Notifications
- Booking confirmation emails
- Payment receipt emails
- Booking cancellation emails
- Password reset emails
- Contact form notifications to admin
- All emails are sent via Gmail SMTP

## Development

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Code Quality
```bash
# Run linter
npm run lint
```

## Environment Variables

All environment variables are documented in `.env.example`. Make sure to:
- Use a strong `NEXTAUTH_SECRET` in production
- Configure your Cloudinary credentials
- Set up a PostgreSQL database connection string
- Update payment gateway keys if integrating with real payment provider

## Production Deployment

1. Set up a PostgreSQL database (e.g., on Railway, Supabase, or AWS RDS)
2. Configure environment variables on your hosting platform
3. Run database migrations: `npx prisma migrate deploy`
4. Build the application: `npm run build`
5. Start the production server: `npm start`

## Notes

- **Razorpay** is fully integrated and ready for production use. Configure your keys in admin settings or environment variables.
- **Gmail SMTP** is configured for transactional emails. Make sure to use an App Password, not your regular Gmail password.
- Cloudinary is required for image uploads. You can use a free tier account for development.
- The application uses server-side rendering (SSR) and React Server Components for optimal performance.
- All forms include client and server-side validation.
- Admin settings are stored in the database and can be configured through the admin panel.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database permissions

### Cloudinary Upload Failures
- Verify your Cloudinary credentials
- Check API key permissions
- Ensure the folder path is correct

### Authentication Issues
- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set
- Check that the user exists in the database

### Payment Issues
- Verify Razorpay keys are correctly configured in admin settings
- Check that you're using test keys for development (starts with `rzp_test_`)
- Ensure webhook URL is configured in Razorpay dashboard (for production)

### Email Issues
- Verify Gmail App Password is correct (not regular password)
- Check that 2-Step Verification is enabled on Google Account
- Ensure SMTP settings are enabled in admin panel
- Check spam folder if emails are not received

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please contact support@travelagency.com or create an issue in the repository.

