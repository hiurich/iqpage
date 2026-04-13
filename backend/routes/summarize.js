const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { checkUsage } = require('../middleware/usageCheck');
const { selectModel } = require('../utils/modelSelector');
const { checkAndUpdateCost } = require('../utils/costTracker');
const supabase = require('../utils/supabase');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', checkUsage('summaries'), async (req, res) => {
  const { pageText, pageUrl, pageTitle, targetLanguage } = req.body;

  if (!pageText || pageText.trim().length < 50) {
    return res.status(400).json({ error: 'Page text is too short or missing' });
  }

  const { id: userId, profile } = req.user;
  const wordCount = pageText.split(/\s+/).length;
  const model = selectModel({ userPlan: profile.plan, task: 'summarize', wordCount });

  // Truncate to ~8000 words to stay within token limits
  const truncatedText = pageText.split(/\s+/).slice(0, 8000).join(' ');

  const langInstruction = targetLanguage
    ? `Provide the summary in ${targetLanguage}.`
    : 'Provide the summary in the same language as the article.';

  const systemPrompt = `You are IQPage, an expert content analyst. Summarize web pages clearly and concisely.
${langInstruction}`;

  const userPrompt = `Analyze this web page and provide:
1. **Executive Summary** (2-3 sentences)
2. **Key Points** (5-7 bullet points)
3. **Main Takeaway** (1 sentence)

Page URL: ${pageUrl ?? 'unknown'}
Page Title: ${pageTitle ?? 'unknown'}

Content:
${truncatedText}`;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const summary = response.content[0].text;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    // Cost guard
    const costResult = await checkAndUpdateCost(userId, profile.plan, model, inputTokens, outputTokens);
    if (!costResult.allowed) {
      return res.status(429).json({ error: 'Daily API cost limit reached. Try again tomorrow.' });
    }

    // Save to history
    const domain = pageUrl ? new URL(pageUrl).hostname : 'unknown';
    await supabase.from('history').insert({
      user_id: userId,
      domain,
      page_url: pageUrl,
      page_title: pageTitle,
      summary,
      chat_history: [],
      citations: [],
    });

    // Active reading: 3 comprehension questions
    let readingQuestions = null;
    if (profile.plan === 'edu' || profile.plan === 'power') {
      const qResponse = await anthropic.messages.create({
        model,
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Based on this summary, generate exactly 3 comprehension questions to test understanding. Return as a JSON array of strings.\n\nSummary:\n${summary}`,
        }],
      });
      try {
        const raw = qResponse.content[0].text;
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        readingQuestions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        readingQuestions = null;
      }
    }

    res.json({ summary, readingQuestions, model, wordCount });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;
