const supabase = require('./supabase');

// Approximate cost per 1M tokens (input/output blended estimate)
const COST_PER_1M_TOKENS = {
  'claude-haiku-4-5-20251001': 0.80,      // ~$0.80 blended per 1M tokens
  'claude-sonnet-4-5-20251001': 3.00,     // ~$3.00 blended per 1M tokens
};

const DAILY_LIMITS = {
  free: 0.20,
  edu: 1.00,
  pro: 3.00,
  power: 8.00,
};

/**
 * Estimate API cost for a given model and token count.
 */
function estimateCost(model, inputTokens, outputTokens) {
  const rate = COST_PER_1M_TOKENS[model] ?? 1.00;
  return ((inputTokens + outputTokens) / 1_000_000) * rate;
}

/**
 * Check if user is within daily cost limit. Returns true if allowed.
 */
async function checkAndUpdateCost(userId, plan, model, inputTokens, outputTokens) {
  const cost = estimateCost(model, inputTokens, outputTokens);
  const limit = DAILY_LIMITS[plan] ?? 0.20;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('daily_api_cost, last_reset_date')
    .eq('id', userId)
    .single();

  if (error) throw new Error('Failed to fetch profile for cost check');

  const today = new Date().toISOString().split('T')[0];
  let currentCost = profile.daily_api_cost ?? 0;

  // Reset daily cost if it's a new day
  if (profile.last_reset_date !== today) {
    currentCost = 0;
    await supabase
      .from('profiles')
      .update({ daily_api_cost: 0, last_reset_date: today })
      .eq('id', userId);
  }

  if (currentCost + cost > limit) {
    return { allowed: false, currentCost, limit };
  }

  // Optimistically update cost
  await supabase
    .from('profiles')
    .update({ daily_api_cost: currentCost + cost })
    .eq('id', userId);

  return { allowed: true, currentCost: currentCost + cost, limit };
}

module.exports = { estimateCost, checkAndUpdateCost };
