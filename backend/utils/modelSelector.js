/**
 * Selects the appropriate Claude model based on user plan, task type, and content length.
 */
function selectModel({ userPlan, task, wordCount = 0 }) {
  if (userPlan === 'free' || userPlan === 'edu') {
    return 'claude-haiku-4-5-20251001';
  }

  const complexTasks = [
    'legal_analysis',
    'bias_detection',
    'deep_qa',
    'niche_academic',
    'article_compare',
  ];

  if (userPlan === 'power') {
    return 'claude-sonnet-4-5-20251001';
  }

  // Pro plan: use Sonnet for complex tasks or long content
  if (complexTasks.includes(task) || wordCount > 1500) {
    return 'claude-sonnet-4-5-20251001';
  }

  return 'claude-haiku-4-5-20251001';
}

module.exports = { selectModel };
