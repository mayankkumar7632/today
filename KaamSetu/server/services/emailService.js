// KaamSetu - Email Service
// This service sends emails using Gmail and Nodemailer.

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Wrap an email message in a simple mobile-friendly layout.
const emailTemplate = (title, bodyHtml) => `
  <div style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,sans-serif;color:#333;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
      <div style="padding:20px;background:#2563eb;color:#ffffff;text-align:center;font-size:24px;font-weight:bold;">
        KaamSetu
      </div>
      <div style="padding:24px;line-height:1.6;">
        <h2 style="margin-top:0;color:#1f2937;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px;background:#f9fafb;text-align:center;font-size:12px;color:#6b7280;">
        This is an automated message from KaamSetu
      </div>
    </div>
  </div>
`;

// Send an email. Email errors never escape this service.
const sendEmail = async (to, subject, text, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service warning: EMAIL_USER and EMAIL_PASS are required.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"KaamSetu" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || emailTemplate(subject, `<p>${text}</p>`)
    });
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

// Check Gmail credentials once at startup. Do not block server startup.
const verifyEmailSetup = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service warning: EMAIL_USER and EMAIL_PASS are required.');
    return;
  }

  try {
    await transporter.verify();
    console.log('Email service ready');
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = { sendEmail, verifyEmailSetup, emailTemplate };
