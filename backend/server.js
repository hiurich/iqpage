require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authMiddleware = require('./middleware/auth');
const { adaptiveLimiter } = require('./middleware/rateLimit');

const summarizeRouter = require('./routes/summarize');
const chatRouter = require('./routes/chat');
const highlightRouter = require('./routes/highlight');
const biasRouter = require('./routes/bias');
const nicheRouter = require('./routes/niche');
const compareRouter = require('./routes/compare');
const userRouter = require('./routes/user');
const stripeRouter = require('./routes/stripe');

const app = express();

// Security headers — applied to every response before any route handler
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameSrc:   ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeRouter);

app.use(express.json({ limit: '2mb' }));
// Only the specific extension ID is allowed, not any chrome-extension:// origin.
// Set EXTENSION_ID in .env and Railway environment variables.
const ALLOWED_ORIGINS = new Set([
  process.env.FRONTEND_URL,
  process.env.EXTENSION_ID ? `chrome-extension://${process.env.EXTENSION_ID}` : null,
].filter(Boolean));

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server requests (no Origin header) and known origins only
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Public routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Protected routes — all require JWT
app.use('/api', authMiddleware, adaptiveLimiter);

app.use('/api/summarize', summarizeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/highlight', highlightRouter);
app.use('/api/bias', biasRouter);
app.use('/api/niche', nicheRouter);
app.use('/api/compare', compareRouter);
app.use('/api/me', userRouter);
app.use('/api', stripeRouter); // /api/create-checkout-session

// Error handler — never leak internal details in production
app.use((err, req, res, _next) => {
  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status ?? 500).json({
    error: isDev ? (err.message ?? 'Internal server error') : 'Internal server error',
  });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`IQPage backend running on port ${PORT}`));
