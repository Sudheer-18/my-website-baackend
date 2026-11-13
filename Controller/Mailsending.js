const nodemailer = require('nodemailer');

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendMail(req, res) {
  const { name, email, message } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (
    cleanName.length < 1 ||
    cleanName.length > 100 ||
    /[\r\n]/.test(cleanName) ||
    !isValidEmail(cleanEmail) ||
    cleanMessage.length < 1 ||
    cleanMessage.length > 5000
  ) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid name, email address, and message (up to 5,000 characters).',
    });
  }

  const { SMTP_HOST, SMTP_PORT = '587', SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) {
    return res.status(503).json({
      success: false,
      message: 'Email delivery is not configured on the server yet.',
    });
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return res.status(503).json({ success: false, message: 'Email delivery is not configured correctly.' });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: CONTACT_EMAIL,
      replyTo: cleanEmail,
      subject: `Portfolio contact from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
    });
    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact email delivery failed:', error);
    return res.status(502).json({
      success: false,
      message: 'The email could not be delivered. Please try again later or email me directly.',
    });
  }
}

module.exports = { sendMail };
