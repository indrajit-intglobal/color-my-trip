interface BookingData {
  bookingId: string
  tourTitle: string
  userName: string
  startDate: string
  endDate: string
  adults: number
  children: number
  totalAmount: string
  location: string
}

interface PaymentData {
  bookingId: string
  paymentId: string
  amount: string
  currency: string
  method: string
}

export function getBookingConfirmationEmail(data: BookingData): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed - ${data.tourTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A4D2E 0%, #2d7a4d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #1A4D2E; font-weight: 600; }
          .button { display: inline-block; background: #1A4D2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your adventure awaits</p>
          </div>
          <div class="content">
            <p>Dear ${data.userName},</p>
            <p>We're excited to confirm your booking for <strong>${data.tourTitle}</strong>!</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${data.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tour:</span>
                <span class="detail-value">${data.tourTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${data.location}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travel Dates:</span>
                <span class="detail-value">${data.startDate} to ${data.endDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travelers:</span>
                <span class="detail-value">${data.adults} Adult(s)${data.children > 0 ? `, ${data.children} Child(ren)` : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">${data.totalAmount}</span>
              </div>
            </div>

            <p>We'll send you more details about your trip soon. If you have any questions, please don't hesitate to contact us.</p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/bookings/${data.bookingId}/confirmation" class="button">View Booking Details</a>
            
            <div class="footer">
              <p>Thank you for choosing GoFly!</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getPaymentReceiptEmail(data: PaymentData): { subject: string; html: string } {
  return {
    subject: `Payment Receipt - Booking ${data.bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1A4D2E; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 32px; color: #1A4D2E; font-weight: bold; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <p>Thank you for your payment!</p>
            
            <div class="receipt">
              <div class="amount">${data.amount}</div>
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              <p><strong>Payment Method:</strong> ${data.method}</p>
              <p><strong>Status:</strong> <span style="color: green;">Paid</span></p>
            </div>

            <p>Your payment has been successfully processed. This email serves as your receipt.</p>
            
            <div class="footer">
              <p>Thank you for choosing GoFly!</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getPasswordResetEmail(resetLink: string, userName: string): { subject: string; html: string } {
  return {
    subject: 'Reset Your Password - GoFly',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1A4D2E; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #1A4D2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>We received a request to reset your password for your GoFly account.</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #1A4D2E;">${resetLink}</p>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing GoFly!</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getWelcomeEmail(userName: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to GoFly!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A4D2E 0%, #2d7a4d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #1A4D2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to GoFly! ✈️</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Welcome to GoFly! We're thrilled to have you join our travel community.</p>
            <p>Start exploring amazing destinations and create unforgettable memories with us.</p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/tours" class="button">Explore Tours</a>
            
            <div class="footer">
              <p>Thank you for choosing GoFly!</p>
              <p>Happy Travels! 🌍</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getBookingCancellationEmail(data: BookingData): { subject: string; html: string } {
  return {
    subject: `Booking Cancelled - ${data.tourTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${data.userName},</p>
            <p>Your booking for <strong>${data.tourTitle}</strong> has been cancelled.</p>
            
            <div class="booking-details">
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              <p><strong>Tour:</strong> ${data.tourTitle}</p>
              <p><strong>Amount:</strong> ${data.totalAmount}</p>
            </div>

            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div class="footer">
              <p>Thank you for choosing GoFly!</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getContactNotificationEmail(name: string, email: string, message: string): { subject: string; html: string } {
  return {
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1A4D2E; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1A4D2E; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Message</h1>
          </div>
          <div class="content">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            
            <div class="message-box">
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="footer">
              <p>GoFly Admin Panel</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getAdminBookingNotificationEmail(data: BookingData & { userEmail: string; userPhone?: string }): { subject: string; html: string } {
  return {
    subject: `New Booking - ${data.tourTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A4D2E 0%, #2d7a4d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #1A4D2E; font-weight: 600; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Booking Received</h1>
            <p>Action Required</p>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            <p>A new booking has been received for <strong>${data.tourTitle}</strong>.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${data.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${data.userName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Email:</span>
                <span class="detail-value">${data.userEmail}</span>
              </div>
              ${data.userPhone ? `
              <div class="detail-row">
                <span class="detail-label">Customer Phone:</span>
                <span class="detail-value">${data.userPhone}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Tour:</span>
                <span class="detail-value">${data.tourTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${data.location}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travel Dates:</span>
                <span class="detail-value">${data.startDate} to ${data.endDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travelers:</span>
                <span class="detail-value">${data.adults} Adult(s)${data.children > 0 ? `, ${data.children} Child(ren)` : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">${data.totalAmount}</span>
              </div>
            </div>

            <div class="alert">
              <p><strong>⚠️ Action Required:</strong> Please review this booking in the admin panel and confirm the booking status.</p>
            </div>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/bookings" style="display: inline-block; background: #1A4D2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View in Admin Panel</a>
            
            <div class="footer">
              <p>GoFly Admin Panel</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

