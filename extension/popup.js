// PageIQ — Popup Script

const STRIPE_PRICES = {
  pro: 'price_pro_placeholder',    // Replace with STRIPE_PRICE_PRO env value
  edu: 'price_edu_placeholder',    // Replace with STRIPE_PRICE_EDU env value
  power: 'price_power_placeholder', // Replace with STRIPE_PRICE_POWER env value
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }
function show(el) { el?.classList.remove('hidden'); }
function hide(el) { el?.classList.add('hidden'); }

function msg(type, data = {}) {
  return chrome.runtime.sendMessage({ type, ...data });
}

function setLoading(text = 'Analyzing page...') {
  show($('loading-overlay'));
  $('loading-text').textContent = text;
}
function clearLoading() {
  hide($('loading-overlay'));
}

function showResult(label, content) {
  $('result-label').textContent = label;
  $('result-content').textContent = content;
  hide($('reading-questions'));
  show($('result-area'));
}

function showError(message) {
  showResult('Error', `⚠️ ${message}`);
}

// ─── Usage Meters ─────────────────────────────────────────────────────────────

function updateUsageMeter(type, used, limit) {
  const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
  const fill = $(`usage-${type}`);
  const text = $(`usage-${type}-text`);
  if (!fill || !text) return;

  fill.style.width = `${pct}%`;
  fill.className = 'usage-fill' + (pct >= 90 ? ' critical' : pct >= 70 ? ' warning' : '');
  text.textContent = limit === Infinity ? `${used}/∞` : `${used}/${limit}`;
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────

function setPlanBadge(plan) {
  const badge = $('plan-badge');
  const classMap = { pro: 'pro', edu: 'edu', power: 'power' };
  badge.textContent = plan.toUpperCase();
  badge.className = `badge ${classMap[plan] ?? ''}`;
}

function enforcePlanFeatures(plan) {
  const proFeatures = document.querySelectorAll('.pro-feature');
  const powerFeatures = document.querySelectorAll('.power-feature');

  if (plan === 'free' || plan === 'edu') {
    proFeatures.forEach((el) => {
      if (plan !== 'edu') el.disabled = true;
    });
  }
  if (plan !== 'power') {
    powerFeatures.forEach((el) => { el.disabled = true; });
  }

  // Hide power-only export button
  if (plan !== 'power') {
    document.querySelectorAll('.power-only').forEach((el) => hide(el));
  }
}

// ─── Page Context ─────────────────────────────────────────────────────────────

async function getCurrentTabContext() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      text: document.body.innerText,
      url: location.href,
      title: document.title,
    }),
  });
  return result?.[0]?.result ?? null;
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportToPDF(content, title) {
  // jsPDF is loaded via CDN script tag — for production bundle it with the extension
  if (typeof window.jspdf === 'undefined') {
    alert('PDF export requires jsPDF. Please check your extension setup.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(16);
  doc.text('PageIQ — ' + title, 15, 20);
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 15, 32);
  doc.save(`pageiq-${Date.now()}.pdf`);
}

function exportToWord(content, title) {
  // Creates a simple .doc (HTML-based) — works in most Word processors
  const html = `<html><head><meta charset='UTF-8'></head><body>
    <h2>PageIQ — ${title}</h2>
    <pre style="font-family:Arial;font-size:12pt;white-space:pre-wrap">${content}</pre>
  </body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: `pageiq-${Date.now()}.doc` });
}

function exportToMarkdown(content, title) {
  const md = `# PageIQ: ${title}\n\n_Generated on ${new Date().toLocaleString()}_\n\n---\n\n${content}`;
  const blob = new Blob([md], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: `pageiq-${Date.now()}.md` });
}

// ─── Main Init ────────────────────────────────────────────────────────────────

let currentUser = null;
let currentPlan = 'free';
let currentContext = null;

async function init() {
  const { user } = await msg('GET_USER');

  if (!user) {
    show($('view-auth'));
    hide($('view-main'));
    return;
  }

  currentUser = user;
  hide($('view-auth'));
  show($('view-main'));

  // Load usage & plan
  try {
    const data = await msg('API_REQUEST', { endpoint: '/api/me', method: 'GET' });
    currentPlan = data.plan;
    setPlanBadge(data.plan);
    enforcePlanFeatures(data.plan);
    updateUsageMeter('summaries', data.usage.summaries.used, data.usage.summaries.limit);
    updateUsageMeter('qa', data.usage.qa.used, data.usage.qa.limit);
  } catch (err) {
    console.error('Failed to load user data:', err);
  }

  // Load current page
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const domain = new URL(tab.url).hostname;
      $('page-domain').textContent = domain;
      $('page-title').textContent = tab.title ?? '';
    }
  } catch {}
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

$('btn-signin').addEventListener('click', async () => {
  const result = await msg('SIGN_IN');
  if (result.success) init();
  else alert(`Sign in failed: ${result.error}`);
});

$('btn-menu').addEventListener('click', (e) => {
  e.stopPropagation();
  $('dropdown-menu').classList.toggle('hidden');
});

document.addEventListener('click', () => hide($('dropdown-menu')));

$('menu-signout').addEventListener('click', async (e) => {
  e.preventDefault();
  await msg('SIGN_OUT');
  location.reload();
});

$('menu-history').addEventListener('click', async (e) => {
  e.preventDefault();
  hide($('dropdown-menu'));
  // Open side panel
  chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
  window.close();
});

$('menu-upgrade').addEventListener('click', async (e) => {
  e.preventDefault();
  hide($('dropdown-menu'));
  // Open upgrade page — trigger Stripe checkout for Pro
  try {
    const { url } = await msg('API_REQUEST', {
      endpoint: '/api/create-checkout-session',
      method: 'POST',
      body: {
        priceId: STRIPE_PRICES.pro,
        successUrl: chrome.runtime.getURL('popup.html') + '?upgraded=1',
        cancelUrl: chrome.runtime.getURL('popup.html'),
      },
    });
    chrome.tabs.create({ url });
  } catch (err) {
    alert(`Upgrade error: ${err.message}`);
  }
});

$('btn-open-panel').addEventListener('click', async () => {
  const win = await chrome.windows.getCurrent();
  chrome.sidePanel.open({ windowId: win.id });
  window.close();
});

$('btn-close-result').addEventListener('click', () => hide($('result-area')));

// Summarize
$('btn-summarize').addEventListener('click', async () => {
  setLoading('Summarizing page...');
  try {
    const ctx = await getCurrentTabContext();
    if (!ctx?.text) {
      clearLoading();
      showError('Could not extract page content.');
      return;
    }

    const targetLanguage = $('target-lang').value || null;
    const data = await msg('API_REQUEST', {
      endpoint: '/api/summarize',
      method: 'POST',
      body: {
        pageText: ctx.text,
        pageUrl: ctx.url,
        pageTitle: ctx.title,
        targetLanguage,
      },
    });

    clearLoading();
    showResult('Summary', data.summary);

    // Cache for offline
    await msg('CACHE_SUMMARY', {
      data: {
        url: ctx.url,
        title: ctx.title,
        domain: new URL(ctx.url).hostname,
        summary: data.summary,
      },
    });

    // Show reading questions for edu/power
    if (data.readingQuestions?.length) {
      const qEl = $('reading-questions');
      qEl.innerHTML = `
        <div class="rq-label">📖 Active Reading Questions</div>
        <ol>${data.readingQuestions.map((q) => `<li>${q}</li>`).join('')}</ol>
      `;
      show(qEl);
    }
  } catch (err) {
    clearLoading();
    showError(err.message);
  }
});

// Bias detection
$('btn-bias').addEventListener('click', async () => {
  if (currentPlan === 'free') {
    showResult('Upgrade Required', 'Bias detection requires a Pro or higher plan.');
    return;
  }
  setLoading('Detecting bias...');
  try {
    const ctx = await getCurrentTabContext();
    const data = await msg('API_REQUEST', {
      endpoint: '/api/bias',
      method: 'POST',
      body: { pageText: ctx.text, pageUrl: ctx.url },
    });
    clearLoading();
    const a = data.analysis;
    const formatted = [
      `Political lean: ${a.political_lean ?? 'N/A'} (${a.political_lean_score ?? '?'}/100)`,
      `Commercial bias: ${a.commercial_bias ?? 'N/A'} — ${a.commercial_bias_explanation ?? ''}`,
      `Source quality: ${a.source_quality ?? 'N/A'} — ${a.source_quality_notes ?? ''}`,
      `Objectivity: ${a.objectivity_score ?? '?'}/100 — ${a.objectivity_notes ?? ''}`,
      ``,
      `Key indicators:`,
      ...(a.key_bias_indicators ?? []).map((i) => `  • ${i}`),
      ``,
      a.overall_summary ?? '',
    ].join('\n');
    showResult('Bias Analysis', formatted);
  } catch (err) {
    clearLoading();
    showError(err.message);
  }
});

// Compare tabs (Power only)
$('btn-compare').addEventListener('click', async () => {
  if (currentPlan !== 'power') {
    showResult('Power Plan Required', 'Article comparison requires the Power plan.');
    return;
  }
  setLoading('Gathering open tabs...');
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const articles = [];
    for (const tab of tabs.slice(0, 3)) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            text: document.body.innerText,
            url: location.href,
            title: document.title,
          }),
        });
        if (results?.[0]?.result?.text) {
          articles.push(results[0].result);
        }
      } catch {}
    }
    if (articles.length < 2) {
      clearLoading();
      showError('Open at least 2 tabs to compare.');
      return;
    }
    const data = await msg('API_REQUEST', {
      endpoint: '/api/compare',
      method: 'POST',
      body: { articles },
    });
    clearLoading();
    showResult('Article Comparison', data.comparison);
  } catch (err) {
    clearLoading();
    showError(err.message);
  }
});

// Niche prompts
document.querySelectorAll('.niche-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const promptType = btn.dataset.prompt;
    const labelMap = {
      legal_analysis: 'Legal Analysis',
      study_guide: 'Study Guide',
      social_post: 'Social Posts',
      consulting_summary: 'Consulting Summary',
      scientific_analysis: 'Scientific Analysis',
    };
    setLoading(`Running ${labelMap[promptType]}...`);
    try {
      const ctx = await getCurrentTabContext();
      const data = await msg('API_REQUEST', {
        endpoint: '/api/niche',
        method: 'POST',
        body: { pageText: ctx.text, promptType },
      });
      clearLoading();
      showResult(labelMap[promptType], data.result);
    } catch (err) {
      clearLoading();
      showError(err.message);
    }
  });
});

// Export buttons
$('btn-export-pdf').addEventListener('click', () => {
  if (currentPlan === 'free') { showError('Export requires Pro or higher.'); return; }
  const content = $('result-content').textContent;
  const label = $('result-label').textContent;
  exportToPDF(content, label);
});

$('btn-export-word').addEventListener('click', () => {
  if (currentPlan === 'free') { showError('Export requires Pro or higher.'); return; }
  const content = $('result-content').textContent;
  const label = $('result-label').textContent;
  exportToWord(content, label);
});

$('btn-export-md').addEventListener('click', () => {
  if (currentPlan !== 'power') { showError('Markdown export requires Power plan.'); return; }
  const content = $('result-content').textContent;
  const label = $('result-label').textContent;
  exportToMarkdown(content, label);
});

// Open Q&A chat in side panel
$('btn-open-chat').addEventListener('click', async () => {
  const win = await chrome.windows.getCurrent();
  chrome.sidePanel.open({ windowId: win.id });
  window.close();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
init();
