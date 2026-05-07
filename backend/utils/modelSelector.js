function selectModel({ userPlan, task, wordCount = 0, powerFairUse = false }) {
  if (userPlan === 'free' || userPlan === 'edu') {
    return 'claude-haiku-4-5';
  }

  const complexTasks = [
    'legal_analysis',
    'bias_detection',
    'deep_qa',
    'niche_academic',
    'article_compare',
  ];

  if (userPlan === 'power') {
    // Fair use: silently downgrade to Haiku above 600 summaries/month
    if (powerFairUse) return 'claude-haiku-4-5';
    return 'claude-sonnet-4-5';
  }

  if (complexTasks.includes(task) || wordCount > 1500) {
    return 'claude-sonnet-4-5';
  }

  return 'claude-haiku-4-5';
}

module.exports = { selectModel };