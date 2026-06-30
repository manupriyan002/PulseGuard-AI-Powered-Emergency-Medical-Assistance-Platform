const nodemailer = require('nodemailer');

/**
 * Create email transporter from environment variables
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"PulseGuard Emergency" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Generate SOS alert email HTML
 */
const generateSOSEmailHTML = ({ userName, location, trackingUrl, timestamp }) => {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #DC2626; color: white; padding: 20px; border-radius: 16px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚨 EMERGENCY SOS ALERT</h1>
      </div>
      <div style="padding: 24px; background: #f9f9f7; border-radius: 16px; margin-top: 16px;">
        <p style="font-size: 18px; color: #1a1c1b;"><strong>${userName}</strong> has triggered an emergency SOS.</p>
        <p style="color: #3f493f;">📍 <strong>Location:</strong> ${location.lat}, ${location.lng}</p>
        <p style="color: #3f493f;">🕐 <strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <a href="${trackingUrl}" style="display: inline-block; background: #15803D; color: white; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          📡 Track Live Location
        </a>
      </div>
      <p style="color: #6f7a6e; font-size: 13px; margin-top: 16px; text-align: center;">
        This is an automated alert from PulseGuard Emergency System.
      </p>
    </div>
  `;
};

module.exports = { sendEmail, generateSOSEmailHTML };
