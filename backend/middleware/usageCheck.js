const supabase = require('../utils/supabase');

const PLAN_LIMITS = {
  free: {
    summaries_per_period: 3,        // per week
    qa_per_period: 5,
    highlights_per_period: 5,
  },
  edu: {
    summaries_per_period: 80,       // per month
    qa_per_period: 500,
    highlights_per_period: Infinity,
  },
  pro: {
    summaries_per_period: 100,      // per month
    qa_per_period: 500,
    highlights_per_period: Infinity,
  },
  power: {
    summaries_per_period: 500,      // per month
    qa_per_period: 2000,
    highlights_per_period: Infinity,
  },
};

/**
 * Factory: creates a middleware that checks and increments a usage counter.
 * @param {'summaries'|'qa'|'highlights'} type
 */
function checkUsage(type) {
  return async (req, res, next) => {
    const profile = req.user.profile;
    const plan = profile.plan ?? 'free';
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    const field = `${type}_used_this_period`;
    const limitField = `${type}_per_period`;
    const used = profile[field] ?? 0;
    const limit = limits[limitField];

    if (used >= limit) {
      return res.status(429).json({
        error: 'Usage limit reached',
        type,
        used,
        limit,
        plan,
      });
    }

    // Atomic conditional increment: only succeeds if the counter is still under
    // the limit at write time, closing the TOCTOU window for concurrent requests.
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ [field]: used + 1 })
      .eq('id', req.user.id)
      .lt(field, limit)   // condition: abort if another request already pushed us over
      .select(field)
      .single();

    if (updateError || !updated) {
      return res.status(429).json({
        error: 'Usage limit reached',
        type,
        limit,
        plan,
      });
    }

    next();
  };
}

/**
 * Middleware factory: restricts endpoint to specific plans.
 */
function requirePlan(...allowedPlans) {
  return (req, res, next) => {
    const plan = req.user.profile.plan ?? 'free';
    if (!allowedPlans.includes(plan)) {
      return res.status(403).json({
        error: 'This feature requires a higher plan',
        requiredPlans: allowedPlans,
        currentPlan: plan,
      });
    }
    next();
  };
}

module.exports = { checkUsage, requirePlan, PLAN_LIMITS };
