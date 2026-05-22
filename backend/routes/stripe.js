const express = require('express');
const Stripe = require('stripe');
const supabase = require('../utils/supabase');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Allowlist of URL origins permitted as Stripe redirect targets.
 * Prevents open-redirect and SSRF via attacker-controlled successUrl/cancelUrl.
 */
function buildAllowedOrigins() {
  const origins = new Set();
  if (process.env.FRONTEND_URL) origins.add(new URL(process.env.FRONTEND_URL).origin);
  if (process.env.EXTENSION_ID) origins.add(`chrome-extension://${process.env.EXTENSION_ID}`);
  return origins;
}

function validateRedirectUrl(url, fallback) {
  if (!url) return fallback;
  try {
    const { origin } = new URL(url);
    if (buildAllowedOrigins().has(origin)) return url;
  } catch {}
  return fallback;
}

async function reportGoogleAdsConversion(value) {
  const conversionId = process.env.GOOGLE_ADS_CONVERSION_ID;
  const label = process.env.GOOGLE_ADS_CONVERSION_LABEL;
  if (!conversionId || !label) return;
  const url = `https://www.googleadservices.com/pagead/conversion/${conversionId}/?value=${value}&currency_code=USD&label=${encodeURIComponent(label)}&guid=ON&script=0`;
  try {
    await fetch(url);
  } catch (err) {
    console.error('Google Ads conversion reporting error:', err.message);
  }
}

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_EDU]: 'edu',
  [process.env.STRIPE_PRICE_POWER]: 'power',
  [process.env.STRIPE_PRICE_EDU_ANNUAL]: 'edu',
  [process.env.STRIPE_PRICE_PRO_ANNUAL]: 'pro',
  [process.env.STRIPE_PRICE_POWER_ANNUAL]: 'power',
};

// POST /api/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;

  if (!PRICE_TO_PLAN[priceId]) {
    return res.status(400).json({ error: 'Invalid price ID' });
  }

  const { profile } = req.user;

  try {
    // Reuse or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { supabase_user_id: req.user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: validateRedirectUrl(successUrl, `${process.env.FRONTEND_URL}/success`),
      cancel_url: validateRedirectUrl(cancelUrl, `${process.env.FRONTEND_URL}/cancel`),
      metadata: { supabase_user_id: req.user.id, plan: PRICE_TO_PLAN[priceId] },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/create-portal-session
router.post('/create-portal-session', async (req, res) => {
  const { profile } = req.user;

  if (!profile.stripe_customer_id) {
    return res.status(400).json({ error: 'No active subscription found' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: 'https://iqpage.app',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// POST /stripe/webhook — raw body, no auth middleware
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;
      const email = !userId ? session.customer_details?.email : null;

      if (plan && (userId || email)) {
        const subEnd = session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription)).current_period_end
          : null;

        const updatePayload = {
          plan,
          subscription_end: subEnd ? new Date(subEnd * 1000).toISOString() : null,
        };

        if (userId) {
          await supabase.from('profiles').update(updatePayload).eq('id', userId);
        } else {
          await supabase.from('profiles').update(updatePayload).eq('email', email);
        }

        await reportGoogleAdsConversion(12);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const priceId = sub.items.data[0]?.price?.id;
      const plan = PRICE_TO_PLAN[priceId];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer);

      if (profiles?.length && plan) {
        await supabase.from('profiles').update({
          plan,
          subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('stripe_customer_id', sub.customer);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await supabase.from('profiles').update({
        plan: 'free',
        subscription_end: null,
      }).eq('stripe_customer_id', sub.customer);
      break;
    }
  }

  res.json({ received: true });
});

module.exports = router;