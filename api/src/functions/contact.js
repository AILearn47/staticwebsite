// POST /api/contact — validates, rejects bots (honeypot), rate-limits per IP, emails the site owner.
// Configure in Azure SWA > Environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
// CONTACT_TO (recipient) and optionally CONTACT_FROM.
const { app } = require('@azure/functions');
const nodemailer = require('nodemailer');

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// In-memory and per instance: a light brake on abuse, not a guarantee.
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: async (request, context) => {
    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) return { status: 429, jsonBody: { error: 'Too many requests' } };

    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: 'Invalid JSON' } };
    }

    // Honeypot: real users never fill this field. Pretend success so bots learn nothing.
    if (clean(body.website, 200)) return { status: 200, jsonBody: { ok: true } };

    const name = clean(body.name, 100);
    const email = clean(body.email, 200);
    const message = clean(body.message, 3000);
    const locale = ['en', 'hi', 'mr'].includes(body.locale) ? body.locale : 'en';
    if (!name || !isEmail(email) || message.length < 10) {
      return { status: 400, jsonBody: { error: 'Invalid input' } };
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM } = process.env;
    if (!SMTP_HOST || !CONTACT_TO) {
      context.error('Contact form is not configured (SMTP_HOST / CONTACT_TO missing)');
      return { status: 500, jsonBody: { error: 'Not configured' } };
    }

    try {
      const transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT) === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      });
      await transport.sendMail({
        from: CONTACT_FROM ?? SMTP_USER ?? CONTACT_TO,
        to: CONTACT_TO,
        replyTo: `${name.replace(/[\r\n<>"]/g, '')} <${email}>`,
        subject: `Website enquiry (${locale}) from ${name.replace(/[\r\n]/g, ' ')}`,
        text: `Name: ${name}\nEmail: ${email}\nLanguage: ${locale}\n\n${message}`,
      });
      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      context.error('sendMail failed', err);
      return { status: 502, jsonBody: { error: 'Could not send' } };
    }
  },
});
