// PageIQ — Popup Script

const STRIPE_PRICES = {
  pro: 'price_pro_placeholder',
  edu: 'price_edu_placeholder',
  power: 'price_power_placeholder',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

function msg(type, data = {}) {
  return chrome.runtime.sendMessage({ type, ...data });
}

function setLoading(text = 'Analyzing page...') {
  $('loading-text').textContent = text;
  show($('loading-overlay'));
}
function clearLoading() { hide($('loading-overlay')); }

function showResult(label, content) {
  $('result-label').textContent = label;
  $('result-content').textContent = content;
  hide($('reading-questions'));
  show($('result-area'));
}

function showError(message) {
  showResult('Error', `⚠️  ${message}`);
}

// ─── View router ──────────────────────────────────────────────────────────────

function showView(name) {
  ['loading', 'auth', 'main'].forEach((v) => hide($(`view-${v}`)));
  show($(`view-${name}`));
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
  document.querySelectorAll('.pro-feature').forEach((el) => {
    el.disabled = plan === 'free';
  });
  document.querySelectorAll('.power-feature').forEach((el) => {
    el.disabled = plan !== 'power';
  });
  if (plan !== 'power') {
    document.querySelectorAll('.power-only').forEach((el) => hide(el));
  }
}

// ─── Page Context ─────────────────────────────────────────────────────────────

async function getCurrentTabContext() {
  const context = await msg('GET_PAGE_CONTEXT');
  if (context?.error && !context?.text) return null;
  return context ?? null;
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportToPDF(content, title) {
  if (typeof window.jspdf === 'undefined') {
    showError('PDF export requires jsPDF bundled with the extension.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(16);
  doc.text('PageIQ — ' + title, 15, 20);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(content, 180), 15, 32);
  doc.save(`pageiq-${Date.now()}.pdf`);
}

function exportToWord(content, title) {
  const html = `<html><head><meta charset='UTF-8'></head><body>
    <h2>PageIQ — ${title}</h2>
    <pre style="font-family:Arial;font-size:12pt;white-space:pre-wrap">${content}</pre>
  </body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'application/msword' }));
  chrome.downloads.download({ url, filename: `pageiq-${Date.now()}.doc` });
}

function exportToMarkdown(content, title) {
  const md = `# PageIQ: ${title}\n\n_Generated ${new Date().toLocaleString()}_\n\n---\n\n${content}`;
  const url = URL.createObjectURL(new Blob([md], { type: 'text/plain' }));
  chrome.downloads.download({ url, filename: `pageiq-${Date.now()}.md` });
}

// ─── State ────────────────────────────────────────────────────────────────────

let currentPlan = 'free';

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  // Show loading immediately so the popup is never blank.
  showView('loading');

  let user = null;
  try {
    const result = await msg('GET_USER');
    user = result?.user ?? null;
  } catch (err) {
    // Background service worker may have been terminated; treat as logged out.
    console.warn('GET_USER failed:', err);
  }

  if (!user) {
    showView('auth');
    return;
  }

  // ── Authenticated: load plan and page info ──
  showView('main');

  // Load plan & usage (non-blocking: show main UI immediately)
  msg('API_REQUEST', { endpoint: '/api/me', method: 'GET' })
    .then((data) => {
      currentPlan = data.plan ?? 'free';
      setPlanBadge(currentPlan);
      enforcePlanFeatures(currentPlan);
      updateUsageMeter('summaries', data.usage.summaries.used, data.usage.summaries.limit);
      updateUsageMeter('qa', data.usage.qa.used, data.usage.qa.limit);
    })
    .catch(() => {
      // Not fatal — user can still see the UI
    });

  // Show current tab domain/title
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      try { $('page-domain').textContent = new URL(tab.url).hostname; } catch {}
      $('page-title').textContent = tab.title ?? '';
    }
  } catch {}
}

// ─── Auth Flow ────────────────────────────────────────────────────────────────

$('btn-signin').addEventListener('click', async () => {
  const btn = $('btn-signin');
  const statusEl = $('auth-status');

  btn.disabled = true;
  btn.textContent = 'Opening sign-in…';
  hide(statusEl);

  try {
    const result = await msg('SIGN_IN');

    if (result?.success) {
      // Re-init to transition to main view.
      await init();
    } else {
      const errMsg = result?.error ?? 'Sign-in failed. Please try again.';
      statusEl.textContent = `⚠️ ${errMsg}`;
      statusEl.className = 'auth-status auth-error';
      show(statusEl);
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google`;
    }
  } catch (err) {
    statusEl.textContent = `⚠️ Unexpected error: ${err.message}`;
    statusEl.className = 'auth-status auth-error';
    show(statusEl);
    btn.disabled = false;
    btn.textContent = 'Try again';
  }
});

// ─── Header Controls ──────────────────────────────────────────────────────────

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
  const win = await chrome.windows.getCurrent();
  chrome.sidePanel.open({ windowId: win.id });
  window.close();
});

$('menu-upgrade').addEventListener('click', async (e) => {
  e.preventDefault();
  hide($('dropdown-menu'));
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
    showError(`Upgrade error: ${err.message}`);
  }
});

$('btn-open-panel').addEventListener('click', async () => {
  const win = await chrome.windows.getCurrent();
  chrome.sidePanel.open({ windowId: win.id });
  window.close();
});

$('btn-close-result').addEventListener('click', () => hide($('result-area')));

// ─── Summarize ────────────────────────────────────────────────────────────────

$('btn-summarize').addEventListener('click', async () => {
  setLoading('Summarizing page…');
  try {
    const ctx = await getCurrentTabContext();
    if (!ctx?.text) {
      clearLoading();
      showError('Could not extract page content. Make sure you are on a regular web page.');
      return;
    }

    const targetLanguage = $('target-lang').value || null;
    const data = await msg('API_REQUEST', {
      endpoint: '/api/summarize',
      method: 'POST',
      body: { pageText: ctx.text, pageUrl: ctx.url, pageTitle: ctx.title, targetLanguage },
    });

    clearLoading();
    showResult('Summary', data.summary);

    // Cache for offline
    try {
      await msg('CACHE_SUMMARY', {
        data: { url: ctx.url, title: ctx.title, domain: new URL(ctx.url).hostname, summary: data.summary },
      });
    } catch {}

    // Reading questions (edu / power)
    if (data.readingQuestions?.length) {
      const qEl = $('reading-questions');
      qEl.innerHTML = `<div class="rq-label">📖 Active Reading Questions</div>
        <ol>${data.readingQuestions.map((q) => `<li>${q}</li>`).join('')}</ol>`;
      show(qEl);
    }
  } catch (err) {
    clearLoading();
    showError(err.message);
  }
});

// ─── Bias Detection ───────────────────────────────────────────────────────────

$('btn-bias').addEventListener('click', async () => {
  if (currentPlan === 'free') {
    showResult('Upgrade Required', 'Bias detection requires a Pro or higher plan.');
    return;
  }
  setLoading('Detecting bias…');
  try {
    const ctx = await getCurrentTabContext();
    if (!ctx?.text) { clearLoading(); showError('Could not extract page content.'); return; }

    const data = await msg('API_REQUEST', {
      endpoint: '/api/bias',
      method: 'POST',
      body: { pageText: ctx.text, pageUrl: ctx.url },
    });
    clearLoading();
    const a = data.analysis;
    showResult('Bias Analysis', [
      `Political lean: ${a.political_lean ?? 'N/A'} (${a.political_lean_score ?? '?'}/100)`,
      `Commercial bias: ${a.commercial_bias ?? 'N/A'} — ${a.commercial_bias_explanation ?? ''}`,
      `Source quality: ${a.source_quality ?? 'N/A'} — ${a.source_quality_notes ?? ''}`,
      `Objectivity: ${a.objectivity_score ?? '?'}/100 — ${a.objectivity_notes ?? ''}`,
      '',
      'Key indicators:',
      ...(a.key_bias_indicators ?? []).map((i) => `  • ${i}`),
      '',
      a.overall_summary ?? '',
    ].join('\n'));
  } catch (err) {
    clearLoading();
    showError(err.message);
  }
});

// ─── Compare Tabs (Power) ─────────────────────────────────────────────────────

$('btn-compare').addEventListener('click', async () => {
  if (currentPlan !== 'power') {
    showResult('Power Plan Required', 'Article comparison requires the Power plan.');
    return;
  }
  setLoading('Gathering open tabs…');
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabIds = tabs.slice(0, 3).map((t) => t.id);
    const { contexts } = await msg('GET_TAB_CONTEXTS', { tabIds });
    const articles = contexts ?? [];
    if (articles.length < 2) {
      clearLoading();
      showError('Open at least 2 tabs with readable content to compare.');
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

// ─── Niche Prompts ────────────────────────────────────────────────────────────

const NICHE_LABELS = {
  legal_analysis: 'Legal Analysis',
  study_guide: 'Study Guide',
  social_post: 'Social Posts',
  consulting_summary: 'Consulting Summary',
  scientific_analysis: 'Scientific Analysis',
};

document.querySelectorAll('.niche-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const promptType = btn.dataset.prompt;
    setLoading(`Running ${NICHE_LABELS[promptType]}…`);
    try {
      const ctx = await getCurrentTabContext();
      if (!ctx?.text) { clearLoading(); showError('Could not extract page content.'); return; }

      const data = await msg('API_REQUEST', {
        endpoint: '/api/niche',
        method: 'POST',
        body: { pageText: ctx.text, promptType },
      });
      clearLoading();
      showResult(NICHE_LABELS[promptType], data.result);
    } catch (err) {
      clearLoading();
      showError(err.message);
    }
  });
});

// ─── Export Buttons ───────────────────────────────────────────────────────────

$('btn-export-pdf').addEventListener('click', () => {
  if (currentPlan === 'free') { showError('Export requires Pro or higher.'); return; }
  exportToPDF($('result-content').textContent, $('result-label').textContent);
});

$('btn-export-word').addEventListener('click', () => {
  if (currentPlan === 'free') { showError('Export requires Pro or higher.'); return; }
  exportToWord($('result-content').textContent, $('result-label').textContent);
});

$('btn-export-md').addEventListener('click', () => {
  if (currentPlan !== 'power') { showError('Markdown export requires Power plan.'); return; }
  exportToMarkdown($('result-content').textContent, $('result-label').textContent);
});

// ─── Q&A Chat ─────────────────────────────────────────────────────────────────

$('btn-open-chat').addEventListener('click', async () => {
  const win = await chrome.windows.getCurrent();
  chrome.sidePanel.open({ windowId: win.id });
  window.close();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
init();
