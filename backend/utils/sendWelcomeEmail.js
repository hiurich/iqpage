/**
 * Sends a welcome email via Brevo transactional API (template ID 2).
 * Logs errors silently — never interrupts the caller flow.
 */
async function sendWelcomeEmail(email) {
  if (!email || !process.env.BREVO_API_KEY) return;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        to: [{ email }],
        templateId: 2,
        sender: { name: 'Hiurich — IQPage', email: 'info@iqpage.app' },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[IQPage] Brevo welcome email failed:', res.status, body);
    } else {
      console.log('[IQPage] Welcome email sent to', email);
    }
  } catch (err) {
    console.error('[IQPage] Brevo welcome email error:', err.message);
  }
}

module.exports = { sendWelcomeEmail };
