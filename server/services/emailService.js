import nodemailer from 'nodemailer';

/**
 * Email Service
 * Handles sending booking confirmations and receipts via email
 * Uses nodemailer with SMTP transport
 */

// Create reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send booking confirmation email
 * 
 * @param {Object} booking - Booking details
 * @param {Object} room - Room details
 * @param {String} userEmail - Guest's email address
 * @param {String} userName - Guest's name
 * @returns {Promise<Object>} - Nodemailer send result
 */
export const sendBookingConfirmation = async (booking, room, userEmail, userName) => {
  const transporter = createTransporter();
  
  // Calculate number of nights
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  // Generate HTML email content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - NextGen HMS</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th { text-align: left; padding: 10px; background: #e5e7eb; color: #374151; }
        .details-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .total { font-size: 24px; font-weight: bold; color: #059669; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
          <p>Thank you for choosing NextGen HMS</p>
        </div>
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your booking has been confirmed! Here are your reservation details:</p>
          
          <table class="details-table">
            <tr>
              <th>Booking Reference</th>
              <td><strong>${booking._id.toString().slice(-8).toUpperCase()}</strong></td>
            </tr>
            <tr>
              <th>Room Number</th>
              <td>${room.number} (${room.type})</td>
            </tr>
            <tr>
              <th>Check-in Date</th>
              <td>${checkIn.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <th>Check-out Date</th>
              <td>${checkOut.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <th>Number of Nights</th>
              <td>${nights} night${nights > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <th>Guests</th>
              <td>${booking.guests} guest${booking.guests > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <th>Total Price</th>
              <td class="total">$${booking.totalPrice.toLocaleString()}</td>
            </tr>
          </table>
          
          ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
          
          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Check-in time: 3:00 PM</li>
            <li>Check-out time: 11:00 AM</li>
            <li>Please present a valid ID at check-in</li>
          </ul>
          
          <p>If you have any questions or need to modify your booking, please contact us.</p>
        </div>
        <div class="footer">
          <p>NextGen HMS - Modern Hotel Management</p>
          <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'NextGen HMS <noreply@nexgenhms.com>',
    to: userEmail,
    subject: `Booking Confirmed - Room ${room.number} | NextGen HMS`,
    html: htmlContent,
    text: `
Booking Confirmed!

Dear ${userName},

Your booking has been confirmed!

Booking Details:
- Reference: ${booking._id.toString().slice(-8).toUpperCase()}
- Room: ${room.number} (${room.type})
- Check-in: ${checkIn.toLocaleDateString()}
- Check-out: ${checkOut.toLocaleDateString()}
- Nights: ${nights}
- Guests: ${booking.guests}
- Total: $${booking.totalPrice}

Thank you for choosing NextGen HMS!
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment confirmation email
 * 
 * @param {Object} booking - Booking details
 * @param {Object} room - Room details
 * @param {String} userEmail - Guest's email address
 * @param {String} userName - Guest's name
 * @param {String} paymentId - Stripe payment ID
 * @returns {Promise<Object>}
 */
export const sendPaymentConfirmation = async (booking, room, userEmail, userName, paymentId) => {
  const transporter = createTransporter();
  
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - NextGen HMS</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .receipt-box { background: white; border: 2px dashed #059669; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total { font-size: 28px; font-weight: bold; color: #059669; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Received!</h1>
          <p>Thank you for your payment</p>
        </div>
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>We have received your payment. Your booking is now confirmed!</p>
          
          <div class="receipt-box">
            <h3>Payment Receipt</h3>
            <p><strong>Transaction ID:</strong> ${paymentId}</p>
            <p><strong>Booking Reference:</strong> ${booking._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Room:</strong> ${room.number} (${room.type})</p>
            <p><strong>Stay Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}</p>
            <p><strong>Check-in:</strong> ${checkIn.toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${checkOut.toLocaleDateString()}</p>
            <p class="total"><strong>Total Paid:</strong> $${booking.totalPrice.toLocaleString()}</p>
          </div>
          
          <p>Please save this receipt for your records.</p>
          <p>A detailed confirmation has also been sent to your email.</p>
        </div>
        <div class="footer">
          <p>NextGen HMS - Modern Hotel Management</p>
          <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'NextGen HMS <noreply@nexgenhms.com>',
    to: userEmail,
    subject: `Payment Receipt - $${booking.totalPrice} | NextGen HMS`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending payment email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendBookingConfirmation,
  sendPaymentConfirmation
};