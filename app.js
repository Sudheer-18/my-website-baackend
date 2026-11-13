require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sendMail } = require('./Controller/Mailsending');

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10kb' }));

const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const contactRequests = new Map();

function limitContactRequests(req, res, next) {
  const now = Date.now();
  const clientIp = req.ip;
  const current = contactRequests.get(clientIp);

  if (!current || now - current.windowStartedAt >= requestWindowMs) {
    contactRequests.set(clientIp, { windowStartedAt: now, count: 1 });
    return next();
  }

  if (current.count >= maxRequestsPerWindow) {
    const retryAfterSeconds = Math.ceil((requestWindowMs - (now - current.windowStartedAt)) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ success: false, message: 'Too many messages. Please try again later.' });
  }

  current.count += 1;
  return next();
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.post('/api/contact', limitContactRequests, sendMail);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  const status = error.type === 'entity.too.large' ? 413 : error.message === 'Origin is not allowed by CORS.' ? 403 : 400;
  return res.status(status).json({
    success: false,
    message: status === 413 ? 'Request body is too large.' : status === 403 ? 'Origin is not allowed.' : 'Invalid request.',
  });
});

module.exports = app;
