const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { requirePlan } = require('../middleware/usageCheck');
const { selectModel } = require('../utils/modelSelector');
const { checkAndUpdateCost } = require('../utils/costTracker');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', requirePlan('pro', 'edu', 'power'), async (req, res) => {
  const { pageText, pageUrl } = req.body;

  if (!pageText || pageText.trim().length < 100) {
    return res.status(400).json({ error: 'Page text is too short for bias analysis' });
  }

  const { id: userId, profile } = req.user;
  const wordCount = pageText.split(/\s+/).length;
  const model = selectModel({ userPlan: profile.plan, task: 'bias_detection', wordCount });
  const truncatedText = pageText.split(/\s+/).slice(0, 6000).join(' ');

  const prompt = `You are an expert media analyst. Analyze the following article for biases and return a JSON object with this exact structure:

{
  "political_lean": "left" | "center-left" | "center" | "center-right" | "right" | "none detected",
  "political_lean_score": 0-100,
  "commercial_bias": "low" | "medium" | "high",
  "commercial_bias_explanation": "brief explanation",
  "source_quality": "poor" | "fair" | "good" | "excellent",
  "source_quality_notes": "brief notes on sources cited",
  "objectivity_score": 0-100,
  "objectivity_notes": "brief explanation",
  "key_bias_indicators": ["indicator 1", "indicator 2", ...],
  "overall_summary": "2-3 sentence overall assessment"
}

Article URL: ${pageUrl ?? 'unknown'}
Article content:
${truncatedText}

Return ONLY the JSON object, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = response.content[0].text;
    const { input_tokens, output_tokens } = response.usage;

    await checkAndUpdateCost(userId, profile.plan, model, input_tokens, output_tokens);

    let analysis;
    try {
      // FIX: limpiar markdown code fences que Claude a veces agrega
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Si no hay JSON, devolver error claro
        console.error('Bias: no JSON found in response:', rawText);
        return res.status(500).json({ error: 'Could not parse bias analysis response' });
      }
    } catch (parseErr) {
      console.error('Bias JSON parse error:', parseErr, 'Raw:', rawText);
      return res.status(500).json({ error: 'Could not parse bias analysis response' });
    }

    res.json({ analysis, model });
  } catch (err) {
    console.error('Bias detection error:', err);
    res.status(500).json({ error: 'Failed to perform bias analysis' });
  }
});

module.exports = router;