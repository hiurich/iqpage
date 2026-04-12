const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { selectModel } = require('../utils/modelSelector');
const { checkAndUpdateCost } = require('../utils/costTracker');
const { checkUsage } = require('../middleware/usageCheck');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NICHE_PROMPTS = {
  legal_analysis: {
    task: 'legal_analysis',
    system: 'You are a legal analyst with expertise in case law and legal reasoning.',
    userTemplate: (text) => `Extract and analyze legal arguments, precedents, rights, obligations, and risks from this content:\n\n${text}`,
  },
  study_guide: {
    task: 'study',
    system: 'You are an expert educator who creates comprehensive study materials.',
    userTemplate: (text) => `Create a detailed study guide with: key concepts, definitions, main arguments, examples, and 5 practice questions from:\n\n${text}`,
  },
  social_post: {
    task: 'social',
    system: 'You are a social media strategist who creates engaging content.',
    userTemplate: (text) => `Convert the following content into 3 social media posts: one for LinkedIn (professional), one for Twitter/X (concise, with hashtags), one for Instagram (engaging):\n\n${text}`,
  },
  consulting_summary: {
    task: 'consulting',
    system: 'You are a senior management consultant who writes executive briefings.',
    userTemplate: (text) => `Create an executive consulting summary with: situation, key findings, business implications, risks, and recommended actions from:\n\n${text}`,
  },
  scientific_analysis: {
    task: 'niche_academic',
    system: 'You are a research scientist who critically evaluates academic content.',
    userTemplate: (text) => `Analyze the scientific methodology, data quality, statistical validity, conclusions, limitations, and practical implications of:\n\n${text}`,
  },
};

router.post('/', checkUsage('qa'), async (req, res) => {
  const { pageText, promptType } = req.body;

  if (!pageText || pageText.trim().length < 100) {
    return res.status(400).json({ error: 'Page text is too short' });
  }

  if (!NICHE_PROMPTS[promptType]) {
    return res.status(400).json({
      error: 'Invalid promptType',
      validTypes: Object.keys(NICHE_PROMPTS),
    });
  }

  const { id: userId, profile } = req.user;
  const config = NICHE_PROMPTS[promptType];
  const wordCount = pageText.split(/\s+/).length;
  const model = selectModel({ userPlan: profile.plan, task: config.task, wordCount });
  const truncatedText = pageText.split(/\s+/).slice(0, 6000).join(' ');

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1536,
      system: config.system,
      messages: [{ role: 'user', content: config.userTemplate(truncatedText) }],
    });

    const result = response.content[0].text;
    const { input_tokens, output_tokens } = response.usage;

    await checkAndUpdateCost(userId, profile.plan, model, input_tokens, output_tokens);

    res.json({ result, promptType, model });
  } catch (err) {
    console.error('Niche prompt error:', err);
    res.status(500).json({ error: 'Failed to process niche prompt' });
  }
});

module.exports = router;
