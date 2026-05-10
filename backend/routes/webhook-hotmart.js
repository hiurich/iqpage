const express = require('express');
const supabase = require('../utils/supabase');

const router = express.Router();

const PRODUCT_TO_PLAN = {
  'IQPage Edu': 'edu',
  'IQPage Pro': 'pro',
  'IQPage Power': 'power',
  'IQPage Pro Anual': 'pro',
  'IQPage Power Anual': 'power',
};

// Valida que el webhook viene de Hotmart usando el hottok
function validateHotmart(req) {
  const hottok = req.query.hottok || req.headers['x-hotmart-hottok'];
  return hottok === process.env.HOTMART_HOTTOK;
}

// POST /api/webhook/hotmart
router.post('/', async (req, res) => {
  // Validar autenticidad
  if (!validateHotmart(req)) {
    console.error('Hotmart webhook: hottok inválido');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body;
  const eventType = event?.event;
  const buyer = event?.data?.buyer;
  const product = event?.data?.product;

  if (!eventType || !buyer?.email) {
    return res.status(400).json({ error: 'Payload inválido' });
  }

  const email = buyer.email.toLowerCase();
  const productName = product?.name || '';
  const plan = PRODUCT_TO_PLAN[productName];

  console.log(`Hotmart webhook recibido: ${eventType} — ${email} — ${productName}`);

  try {
    switch (eventType) {
      case 'PURCHASE_COMPLETE': {
        if (!plan) {
          console.warn(`Hotmart: producto no reconocido — "${productName}"`);
          break;
        }

        const isAnual = productName.includes('Anual');
        const subscriptionEnd = isAnual
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        await supabase
          .from('profiles')
          .update({ plan, subscription_end: subscriptionEnd })
          .eq('email', email);

        console.log(`Plan actualizado: ${email} → ${plan} (${isAnual ? 'anual' : 'mensual'})`);
        break;
      }

      case 'PURCHASE_CANCELLED':
      case 'PURCHASE_REFUNDED': {
        await supabase
          .from('profiles')
          .update({ plan: 'free', subscription_end: null })
          .eq('email', email);

        console.log(`Plan revertido a free: ${email}`);
        break;
      }

      default:
        console.log(`Hotmart: evento ignorado — ${eventType}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Hotmart webhook error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;