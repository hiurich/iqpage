const express = require('express');
const { PLAN_LIMITS } = require('../middleware/usageCheck');
const supabase = require('../utils/supabase');

const router = express.Router();

// GET /api/me — returns current user state, plan, and usage
router.get('/', async (req, res) => {
  const { profile } = req.user;
  const plan = profile.plan ?? 'free';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  res.json({
    id: req.user.id,
    email: req.user.email,
    plan,
    usage: {
      summaries: {
        used: profile.summaries_used ?? 0,
        limit: limits.summaries_per_period,
      },
      qa: {
        used: profile.qa_used ?? 0,
        limit: limits.qa_per_period,
      },
      highlights: {
        used: profile.highlights_used ?? 0,
        limit: limits.highlights_per_period,
      },
    },
    dailyApiCost: profile.daily_api_cost ?? 0,
    subscriptionEnd: profile.subscription_end,
  });
});

// GET /api/me/history?domain=example.com
router.get('/history', async (req, res) => {
  const { domain, limit = 20, offset = 0 } = req.query;
  const plan = req.user.profile.plan ?? 'free';

  // Free plan: no history
  if (plan === 'free') {
    return res.json({ history: [], message: 'History requires Pro or higher plan' });
  }

  // Pro/Edu: 30 days; Power: unlimited
  let query = supabase
    .from('history')
    .select('id, domain, page_url, page_title, summary, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (domain) query = query.eq('domain', domain);

  if (plan === 'pro' || plan === 'edu') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', thirtyDaysAgo);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Failed to fetch history' });

  res.json({ history: data });
});

module.exports = router;
