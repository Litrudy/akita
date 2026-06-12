'use strict';

const nodemailer = require('nodemailer');

const KIND_LABEL = { quote: 'Quote enquiry', tracking: 'Tracking request' };

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== '0',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

/**
 * Send the notification mail for one enquiry row.
 * Returns true on success, false when SMTP is unconfigured or sending fails —
 * the caller stores the flag but never fails the request because of mail.
 */
async function sendEnquiryMail(e) {
  const t = getTransporter();
  if (!t) {
    console.log('[mail] SMTP not configured — skipped notification for enquiry #%d', e.id);
    return false;
  }

  const label = KIND_LABEL[e.kind] || 'Enquiry';
  const subject = `[Website] ${label} — ${e.service || e.reference || e.name || 'no subject'}`;

  const lines = [
    `Kind:        ${e.kind}`,
    `Name:        ${e.name || '-'}`,
    `Company:     ${e.company || '-'}`,
    `Email:       ${e.email || '-'}`,
    `Phone:       ${e.phone || '-'}`,
    `Route:       ${e.origin || '-'} -> ${e.destination || '-'}`,
    `Service:     ${e.service || '-'}`,
    `Reference:   ${e.reference || '-'}`,
    `Language:    ${e.lang}`,
    `Submitted:   ${new Date().toISOString()}`,
    `IP:          ${e.ip}`,
    '',
    'Message:',
    e.message || '(empty)'
  ];

  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || 'logistics@akitagn.com',
      replyTo: e.email || undefined,
      subject,
      text: lines.join('\n')
    });
    return true;
  } catch (err) {
    console.error('[mail] send failed for enquiry #%d: %s', e.id, err.message);
    return false;
  }
}

module.exports = { sendEnquiryMail };
