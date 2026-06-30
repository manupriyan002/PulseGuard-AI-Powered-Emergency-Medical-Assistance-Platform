require('dotenv').config();
const { sendEmail } = require('./src/utils/email');

async function testEmail() {
  console.log('Testing SMTP Configuration...');
  try {
    const info = await sendEmail({
      to: process.env.SMTP_USER, // send to itself
      subject: '🚨 PulseGuard System Test',
      html: '<p>This is a test email to verify that your SMTP configuration is working correctly.</p>'
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
  }
}

testEmail();
