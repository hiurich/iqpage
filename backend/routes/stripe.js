const express = require('express');
const Stripe = require('stripe');
const supabase = require('../utils/supabase');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_EDU]: 'edu',
  [process.env.STRIPE_PRICE_POWER]: 'power',
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
      success_url: successUrl ?? `${process.env.FRONTEND_URL}/success`,
      cancel_url: cancelUrl ?? `${process.env.FRONTEND_URL}/cancel`,
      metadata: { supabase_user_id: req.user.id, plan: PRICE_TO_PLAN[priceId] },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
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
      if (userId && plan) {
        const subEnd = session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription)).current_period_end
          : null;

        await supabase.from('profiles').update({
          plan,
          subscription_end: subEnd ? new Date(subEnd * 1000).toISOString() : null,
        }).eq('id', userId);
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
