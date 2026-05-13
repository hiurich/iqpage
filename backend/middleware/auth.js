const supabase = require('../utils/supabase');
const { sendWelcomeEmail } = require('../utils/sendWelcomeEmail');

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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, plan, stripe_customer_id, subscription_end, summaries_used, qa_used, highlights_used, daily_api_cost, last_reset_date, created_at')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'User profile not found' });
  }

  // Fire welcome email for brand-new profiles (created in the last 5 minutes)
  if (profile.created_at) {
    const ageMs = Date.now() - new Date(profile.created_at).getTime();
    if (ageMs < 5 * 60 * 1000) {
      sendWelcomeEmail(user.email);
    }
  }

  req.user = { ...user, profile };
  next();
}

module.exports = authMiddleware;
