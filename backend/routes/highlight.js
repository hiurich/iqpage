const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { checkUsage } = require('../middleware/usageCheck');
const { selectModel } = require('../utils/modelSelector');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ACTION_PROMPTS = {
  explain: (text) =>
    `Explain the following text clearly and concisely in simple terms:\n\n"${text}"`,
  translate: (text) =>
    `Translate the following text to Spanish. Return only the translation:\n\n"${text}"`,
  expand_note: (text, note) =>
    `The user has selected this text: "${text}"\n\nThe user's personal note: "${note}"\n\nExpand or critically analyze this note in relation to the selected text. Be insightful.`,
};

router.post('/', checkUsage('highlights'), async (req, res) => {
  const { selectedText, action, userNote, pageUrl, domain } = req.body;

  if (!selectedText?.trim()) {
    return res.status(400).json({ error: 'selectedText is required' });
  }

  const validActions = ['explain', 'translate', 'save', 'expand_note'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action', validActions });
  }

  // 'save' action just stores citation — no AI call needed
  if (action === 'save') {
    return res.json({
      result: null,
      citation: {
        text: selectedText,
        pageUrl,
        domain,
        savedAt: new Date().toISOString(),
        note: userNote ?? '',
      },
    });
  }

  const { profile } = req.user;
  const model = selectModel({ userPlan: profile.plan, task: 'highlight', wordCount: 0 });

  const promptFn = ACTION_PROMPTS[action];
  const userPrompt = action === 'expand_note'
    ? promptFn(selectedText, userNote)
    : promptFn(selectedText);

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 512,
      messages: [{ role: 'user', content: userPrompt }],
    });

    res.json({ result: response.content[0].text, model });
  } catch (err) {
    console.error('Highlight error:', err);
    res.status(500).json({ error: 'Failed to process highlight action' });
  }
});

module.exports = router;
