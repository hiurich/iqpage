require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeRouter);

app.use(express.json({ limit: '2mb' }));
app.use(cors({
  origin: (origin, cb) => {
    // Allow Chrome extensions and configured frontend
    if (!origin || origin.startsWith('chrome-extension://') || origin === process.env.FRONTEND_URL) {
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

// Error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`IQPage backend running on port ${PORT}`));
