# IQPage

AI-powered Chrome extension for page analysis, Q&A, bias detection, and smart highlights.

## Project Structure

```
IQPage/
├── extension/              # Chrome Extension (Manifest V3, vanilla JS)
│   ├── manifest.json
│   ├── background.js       # Service worker: auth, API calls, caching
│   ├── content.js          # Injected: highlight mini-menu
│   ├── popup.html/js       # Extension popup
│   ├── sidepanel.html/js   # Side panel: chat, history, citations
│   └── styles/
│       ├── popup.css
│       └── sidepanel.css
├── backend/                # Node.js + Express API
│   ├── server.js
│   ├── routes/
│   │   ├── summarize.js    # POST /api/summarize
│   │   ├── chat.js         # POST /api/chat
│   │   ├── highlight.js    # POST /api/highlight
│   │   ├── bias.js         # POST /api/bias
│   │   ├── niche.js        # POST /api/niche
│   │   ├── compare.js      # POST /api/compare
│   │   ├── user.js         # GET /api/me, GET /api/me/history
│   │   └── stripe.js       # POST /api/create-checkout-session, POST /stripe/webhook
│   ├── middleware/
│   │   ├── auth.js         # Supabase JWT validation
│   │   ├── usageCheck.js   # Plan limits + counter increment
│   │   └── rateLimit.js    # 50 req/hour per user
│   └── utils/
│       ├── supabase.js     # Supabase client
│       ├── modelSelector.js # Claude model selection logic
│       └── costTracker.js  # Daily API cost guard
└── supabase_schema.sql     # Database schema + RLS policies
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
```

### 2. Supabase

1. Create a project at supabase.com
2. Run `supabase_schema.sql` in the SQL Editor
3. Enable Google OAuth in Authentication > Providers
4. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env`

### 3. Stripe

1. Create products and prices in Stripe Dashboard
2. Copy price IDs to `.env` (`STRIPE_PRICE_PRO`, `STRIPE_PRICE_EDU`, `STRIPE_PRICE_POWER`)
3. Set up webhook endpoint pointing to `https://your-backend.com/stripe/webhook`
4. Copy `STRIPE_WEBHOOK_SECRET` to `.env`

### 4. Extension

1. Open `extension/background.js` and update:
   - `BACKEND_URL` → your backend URL
   - `SUPABASE_URL` → your Supabase project URL
   - `SUPABASE_ANON_KEY` → your Supabase anon key

2. Open `extension/manifest.json` and update:
   - `oauth2.client_id` → your Google OAuth client ID

3. Load the extension in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/` folder

4. Update `STRIPE_PRICES` in `popup.js` with your actual Stripe price IDs

## Plans

| Feature | Free | Edu ($5/mo) | Pro ($12/mo) | Power ($29/mo) |
|---|---|---|---|---|
| Summaries | 5/week | 80/month | 100/month | 500/month |
| Q&A | 10/week | 500/month | 500/month | 2000/month |
| Highlights | 5/week | Unlimited | Unlimited | Unlimited |
| Model | Haiku | Haiku | Haiku+Sonnet | Sonnet |
| Export PDF/Word | ✗ | ✓ | ✓ | ✓ |
| Bias Detection | ✗ | ✓ | ✓ | ✓ |
| History | ✗ | 30 days | 30 days | Unlimited |
| Active Reading Q's | ✗ | ✓ | ✗ | ✓ |
| Article Compare | ✗ | ✗ | ✗ | ✓ |
| Export Markdown | ✗ | ✗ | ✗ | ✓ |

## API Endpoints

| Endpoint | Method | Auth | Plan |
|---|---|---|---|
| `/api/summarize` | POST | JWT | All |
| `/api/chat` | POST | JWT | All |
| `/api/highlight` | POST | JWT | All |
| `/api/bias` | POST | JWT | Pro/Edu/Power |
| `/api/niche` | POST | JWT | All |
| `/api/compare` | POST | JWT | Power |
| `/api/me` | GET | JWT | All |
| `/api/me/history` | GET | JWT | Pro/Edu/Power |
| `/api/create-checkout-session` | POST | JWT | All |
| `/stripe/webhook` | POST | Stripe sig | — |
