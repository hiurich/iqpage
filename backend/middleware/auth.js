const supabase = require('../utils/supabase');

/**
 * Validates Supabase JWT from Authorization header.
 * Attaches user and profile to req.user.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Fetch only the columns consumed by middleware and route handlers.
  // Avoid select('*') to minimize data exposure in logs and memory.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select([
      'plan',
      'stripe_customer_id',
      'daily_api_cost',
      'last_reset_date',
      'subscription_end',
      'summaries_used_this_period',
      'qa_used_this_period',
      'highlights_used_this_period',
    ].join(', '))
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'User profile not found' });
  }

  req.user = { ...user, profile };
  next();
}

module.exports = authMiddleware;
