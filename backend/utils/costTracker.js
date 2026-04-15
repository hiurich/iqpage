const supabase = require('./supabase');

// Approximate cost per 1M tokens (input/output blended estimate)
const COST_PER_1M_TOKENS = {
  'claude-haiku-4-5': 0.80,      // ~$0.80 blended per 1M tokens
  'claude-sonnet-4-5': 3.00,     // ~$3.00 blended per 1M tokens
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
 * Check if user is within daily cost limit and atomically increment if allowed.
 *
 * Uses a Postgres RPC (increment_daily_cost) to perform the read-check-write
 * in a single atomic operation, eliminating the TOCTOU race where concurrent
 * requests could all pass the limit check before any update is committed.
 *
 * Required Supabase SQL (run once in SQL editor):
 *
 *   CREATE OR REPLACE FUNCTION increment_daily_cost(
 *     p_user_id uuid,
 *     p_cost numeric,
 *     p_limit numeric,
 *     p_today date
 *   ) RETURNS json LANGUAGE plpgsql AS $$
 *   DECLARE
 *     v_current numeric;
 *   BEGIN
 *     UPDATE profiles
 *     SET
 *       daily_api_cost = CASE WHEN last_reset_date < p_today THEN p_cost
 *                             ELSE daily_api_cost + p_cost END,
 *       last_reset_date = p_today
 *     WHERE id = p_user_id
 *     RETURNING daily_api_cost INTO v_current;
 *
 *     RETURN json_build_object(
 *       'allowed',       v_current <= p_limit,
 *       'current_cost',  v_current
 *     );
 *   END;
 *   $$;
 */
async function checkAndUpdateCost(userId, plan, model, inputTokens, outputTokens) {
  const cost = estimateCost(model, inputTokens, outputTokens);
  const limit = DAILY_LIMITS[plan] ?? 0.20;
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.rpc('increment_daily_cost', {
    p_user_id: userId,
    p_cost: cost,
    p_limit: limit,
    p_today: today,
  });

  if (error) throw new Error('Failed to update daily cost');

  return {
    allowed: data.allowed,
    currentCost: data.current_cost,
    limit,
  };
}

module.exports = { estimateCost, checkAndUpdateCost };
