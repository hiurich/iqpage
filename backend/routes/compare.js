const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { requirePlan } = require('../middleware/usageCheck');
const { checkAndUpdateCost } = require('../utils/costTracker');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', requirePlan('power'), async (req, res) => {
  const { articles } = req.body; // array of { text, url, title }

  if (!Array.isArray(articles) || articles.length < 2 || articles.length > 3) {
    return res.status(400).json({ error: 'Provide 2 or 3 articles to compare' });
  }

  const { id: userId, profile } = req.user;

  const articleSections = articles.map((a, i) => {
    const truncated = (a.text ?? '').split(/\s+/).slice(0, 2500).join(' ');
    return `### Article ${i + 1}: ${a.title ?? `Article ${i + 1}`}\nURL: ${a.url ?? 'N/A'}\n\n${truncated}`;
  });

  const prompt = `You are an expert analyst. Compare the following ${articles.length} articles and provide:

1. **Common Themes** — what all articles agree on
2. **Key Differences** — where they diverge (facts, tone, perspective, emphasis)
3. **Unique Insights** — what each article uniquely contributes
4. **Overall Assessment** — which provides the most comprehensive coverage and why
5. **Contradiction Check** — any factual contradictions between the articles

---
${articleSections.join('\n\n---\n\n')}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251001', // Always use Sonnet for comparison (Power only)
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const comparison = response.content[0].text;
    const { input_tokens, output_tokens } = response.usage;

    await checkAndUpdateCost(userId, profile.plan, 'claude-sonnet-4-5-20251001', input_tokens, output_tokens);

    res.json({ comparison });
  } catch (err) {
    console.error('Compare error:', err);
    res.status(500).json({ error: 'Failed to compare articles' });
  }
});

module.exports = router;
