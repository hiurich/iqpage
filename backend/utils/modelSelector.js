function selectModel({ userPlan, task, wordCount = 0 }) {
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
    return 'claude-sonnet-4-5';
  }

  if (complexTasks.includes(task) || wordCount > 1500) {
    return 'claude-sonnet-4-5';
  }

  return 'claude-haiku-4-5';
}

module.exports = { selectModel };