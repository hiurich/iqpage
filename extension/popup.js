// IQPage — Popup Script

const STRIPE_PRICES = {
  pro: 'price_pro_placeholder',
  edu: 'price_edu_placeholder',
  power: 'price_power_placeholder',
};

// ─── PostHog Analytics ────────────────────────────────────────────────────────

const POSTHOG_KEY = 'phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j';
const POSTHOG_HOST = 'https://us.i.posthog.com';

function phCapture(event, properties = {}) {
  try {
    const distinctId = chrome.runtime.id ?? 'extension-user';
    fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: {
          ...properties,
          extension_version: chrome.runtime.getManifest().version,
          $lib: 'iqpage-extension',
        },
      }),
    }).catch(() => {});
  } catch {}
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

// ─── View router ──────────────────────────────────────────────────────────────

function showView(name) {
  ['loading', 'auth', 'main'].forEach((v) => {
    const el = $(`view-${v}`);
    if (el) el.classList.toggle('hidden', v !== name);
  });
}

// ─── Background messaging ─────────────────────────────────────────────────────

function sendMsg(type, data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          setTimeout(() => {
            try {
              chrome.runtime.sendMessage({ type, ...data }, (resp2) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(resp2);
                }
              });
            } catch (e) { reject(e); }
          }, 300);
        } else {
          resolve(response);
        }
      });
    } catch (e) { reject(e); }
  });
}

// ─── Loading / error helpers ──────────────────────────────────────────────────

function setLoading(text = 'Analyzing page…') {
  if ($('loading-text')) $('loading-text').textContent = text;
  show($('loading-overlay'));
}
function clearLoading() { hide($('loading-overlay')); }

function showResult(label, content) {
  if ($('result-label')) $('result-label').textContent = label;
  if ($('result-content')) $('result-content').textContent = content;
  hide($('reading-questions'));
  show($('result-area'));
}
function showError(message) { showResult('Error', `⚠️  ${message}`); }

// ─── Usage meters ─────────────────────────────────────────────────────────────

function updateUsageMeter(type, used, limit) {
  const pct = (limit === Infinity || limit === 0) ? 0 : Math.min((used / limit) * 100, 100);
  const fill = $(`usage-${type}`);
  const text = $(`usage-${type}-text`);
  if (!fill || !text) return;
  fill.style.width = `${pct}%`;
  fill.className = 'usage-fill' + (pct >= 90 ? ' critical' : pct >= 70 ? ' warning' : '');
  text.textContent = (limit === Infinity) ? `${used}/∞` : `${used}/${limit}`;
}

// ─── Plan badge ───────────────────────────────────────────────────────────────

let currentPlan = 'free';

function setPlanBadge(plan) {
  currentPlan = plan;
  const badge = $('plan-badge');
  if (!badge) return;
  const classMap = { pro: 'pro', edu: 'edu', power: 'power' };
  badge.textContent = plan.toUpperCase();
  badge.className = `badge ${classMap[plan] ?? ''}`;
}

function enforcePlanFeatures(plan) {
  document.querySelectorAll('.pro-feature').forEach((el) => {
    el.disabled = (plan === 'free');
  });
  document.querySelectorAll('.power-feature').forEach((el) => {
    el.disabled = (plan !== 'power');
  });
  if (plan !== 'power') {
    document.querySelectorAll('.power-only').forEach((el) => hide(el));
  }
}

// ─── Auth status message ──────────────────────────────────────────────────────

function setAuthStatus(msg, isError = false) {
  const el = $('auth-status');
  if (!el) return;
  if (!msg) { hide(el); return; }
  el.textContent = msg;
  el.className = `auth-status ${isError ? 'auth-error' : 'auth-info'}`;
  show(el);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  showView('loading');

  try {
    const stored = await chrome.storage.local.get(['jwt', 'user']);
    const hasToken = Boolean(stored.jwt);

    if (!hasToken) {
      showView('auth');
      return;
    }

    showView('main');
    phCapture('popup_opened');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url && !tab.url.startsWith('chrome://')) {
        try { $('page-domain').textContent = new URL(tab.url).hostname; } catch {}
        if ($('page-title')) $('page-title').textContent = tab.title ?? '';
      }
    } catch {}

    sendMsg('API_REQUEST', { endpoint: '/api/me', method: 'GET' })
      .then((data) => {
        if (!data || data.error) return;
        setPlanBadge(data.plan ?? 'free');
        enforcePlanFeatures(data.plan ?? 'free');
        if (data.usage) {
          updateUsageMeter('summaries', data.usage.summaries.used, data.usage.summaries.limit);
          updateUsageMeter('qa', data.usage.qa.used, data.usage.qa.limit);
        }
      })
      .catch(() => {});

  } catch (err) {
    console.error('Init error:', err);
    showView('auth');
  }
}

// ─── Sign-in button ───────────────────────────────────────────────────────────

const signinBtn = $('btn-signin');
if (signinBtn) {
  signinBtn.addEventListener('click', async () => {
    signinBtn.disabled = true;
    signinBtn.textContent = 'Opening sign-in…';
    setAuthStatus('');

    try {
      const result = await sendMsg('SIGN_IN');
      if (result?.success) {
        phCapture('user_signed_in');
        await init();
      } else {
        const errText = result?.error ?? 'Sign-in failed. Please try again.';
        setAuthStatus(`⚠️ ${errText}`, true);
        resetSigninButton();
      }
    } catch (err) {
      setAuthStatus(`⚠️ ${err.message}`, true);
      resetSigninButton();
    }
  });
}

function resetSigninButton() {
  if (!signinBtn) return;
  signinBtn.disabled = false;
  signinBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    Sign in with Google`;
}

// ─── Header controls ──────────────────────────────────────────────────────────

const menuBtn = $('btn-menu');
const dropdownMenu = $('dropdown-menu');

if (menuBtn && dropdownMenu) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
  });
  document.addEventListener('click', () => hide(dropdownMenu));
}

const signoutLink = $('menu-signout');
if (signoutLink) {
  signoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    phCapture('user_signed_out');
    await sendMsg('SIGN_OUT').catch(() => {});
    await chrome.storage.local.remove(['jwt', 'refresh_token', 'user']).catch(() => {});
    location.reload();
  });
}

const historyLink = $('menu-history');
if (historyLink) {
  historyLink.addEventListener('click', async (e) => {
    e.preventDefault();
    hide(dropdownMenu);
    const win = await chrome.windows.getCurrent();
    chrome.sidePanel.open({ windowId: win.id });
    window.close();
  });
}

const upgradeLink = $('menu-upgrade');
if (upgradeLink) {
  upgradeLink.addEventListener('click', async (e) => {
    e.preventDefault();
    hide(dropdownMenu);
    phCapture('upgrade_clicked');
    try {
      const { url } = await sendMsg('API_REQUEST', {
        endpoint: '/api/create-checkout-session',
        method: 'POST',
        body: {
          priceId: STRIPE_PRICES.pro,
          successUrl: chrome.runtime.getURL('popup.html') + '?upgraded=1',
          cancelUrl: chrome.runtime.getURL('popup.html'),
        },
      });
      chrome.tabs.create({ url });
    } catch (err) { showError(`Upgrade error: ${err.message}`); }
  });
}

const openPanelBtn = $('btn-open-panel');
if (openPanelBtn) {
  openPanelBtn.addEventListener('click', async () => {
    const win = await chrome.windows.getCurrent();
    chrome.sidePanel.open({ windowId: win.id });
    window.close();
  });
}

const closeResultBtn = $('btn-close-result');
if (closeResultBtn) closeResultBtn.addEventListener('click', () => hide($('result-area')));

// ─── Page context (via SW) ────────────────────────────────────────────────────

async function getCurrentTabContext() {
  const context = await sendMsg('GET_PAGE_CONTEXT');
  if (context?.error && !context?.text) return null;
  return context ?? null;
}

// ─── Summarize ────────────────────────────────────────────────────────────────

const summarizeBtn = $('btn-summarize');
if (summarizeBtn) {
  summarizeBtn.addEventListener('click', async () => {
    setLoading('Summarizing page…');
    try {
      const ctx = await getCurrentTabContext();
      if (!ctx?.text) {
        clearLoading();
        showError('Could not extract page content. Make sure you are on a regular web page.');
        return;
      }
      const targetLanguage = $('target-lang')?.value || null;
      const data = await sendMsg('API_REQUEST', {
        endpoint: '/api/summarize',
        method: 'POST',
        body: { pageText: ctx.text, pageUrl: ctx.url, pageTitle: ctx.title, targetLanguage },
      });
      clearLoading();
      showResult('Summary', data.summary);
      phCapture('summary_generated', { url: ctx.url, language: targetLanguage ?? 'default' });

      try {
        await sendMsg('CACHE_SUMMARY', {
          data: { url: ctx.url, title: ctx.title, domain: new URL(ctx.url).hostname, summary: data.summary },
        });
      } catch {}

      if (data.readingQuestions?.length) {
        const qEl = $('reading-questions');
        if (qEl) {
          qEl.innerHTML = `<div class="rq-label">📖 Active Reading Questions</div>
            <ol>${data.readingQuestions.map((q) => `<li>${q}</li>`).join('')}</ol>`;
          show(qEl);
        }
      }
    } catch (err) { clearLoading(); showError(err.message); }
  });
}

// ─── Bias detection ───────────────────────────────────────────────────────────

const biasBtn = $('btn-bias');
if (biasBtn) {
  biasBtn.addEventListener('click', async () => {
    if (currentPlan === 'free') {
      showResult('Upgrade Required', 'Bias detection requires a Pro or higher plan.');
      phCapture('upgrade_wall_hit', { feature: 'bias_detection' });
      return;
    }
    setLoading('Detecting bias…');
    try {
      const ctx = await getCurrentTabContext();
      if (!ctx?.text) { clearLoading(); showError('Could not extract page content.'); return; }
      const data = await sendMsg('API_REQUEST', {
        endpoint: '/api/bias', method: 'POST',
        body: { pageText: ctx.text, pageUrl: ctx.url },
      });
      clearLoading();

      const a = data?.analysis ?? data ?? {};
      if (!a || typeof a !== 'object') {
        showError('Bias analysis returned an unexpected response. Please try again.');
        return;
      }

      showResult('Bias Analysis', [
        `Political lean: ${a.political_lean ?? 'N/A'} (${a.political_lean_score ?? '?'}/100)`,
        `Commercial bias: ${a.commercial_bias ?? 'N/A'} — ${a.commercial_bias_explanation ?? ''}`,
        `Source quality: ${a.source_quality ?? 'N/A'} — ${a.source_quality_notes ?? ''}`,
        `Objectivity: ${a.objectivity_score ?? '?'}/100 — ${a.objectivity_notes ?? ''}`,
        '', 'Key indicators:',
        ...(a.key_bias_indicators ?? []).map((i) => `  • ${i}`),
        '', a.overall_summary ?? '',
      ].join('\n'));
      phCapture('bias_detected', { url: ctx.url });
    } catch (err) { clearLoading(); showError(err.message); }
  });
}

// ─── Compare tabs (Power) — Modal con selección manual ───────────────────────

let compareSelectedIds = new Set();
let compareAllTabs = [];

function updateCompareButton() {
  const runBtn = $('btn-compare-run');
  const hint = $('compare-modal-hint');
  const count = compareSelectedIds.size;

  if (count < 2) {
    runBtn.disabled = true;
    hint.textContent = `Select at least 2 tabs (${count} selected)`;
  } else if (count > 3) {
    runBtn.disabled = true;
    hint.textContent = 'Maximum 3 tabs allowed';
  } else {
    runBtn.disabled = false;
    hint.textContent = `${count} tabs selected — ready to compare`;
  }
}

async function openCompareModal() {
  compareSelectedIds = new Set();
  compareAllTabs = [];

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const allTabs = await chrome.tabs.query({ currentWindow: true });
  compareAllTabs = allTabs.filter((t) =>
    t.url &&
    !t.url.startsWith('chrome') &&
    !t.url.startsWith('chrome-extension') &&
    !t.url.startsWith('about') &&
    t.title
  );

  if (compareAllTabs.length < 2) {
    showError('Open at least 2 tabs with readable articles to compare.');
    return;
  }

  if (activeTab?.id) compareSelectedIds.add(activeTab.id);

  const listEl = $('compare-tab-list');
  listEl.innerHTML = '';

  compareAllTabs.forEach((tab) => {
    const isActive = tab.id === activeTab?.id;
    const isSelected = compareSelectedIds.has(tab.id);

    let domain = '';
    try { domain = new URL(tab.url).hostname; } catch {}

    const item = document.createElement('div');
    item.className = `compare-tab-item${isSelected ? ' selected' : ''}${isActive ? ' active-tab' : ''}`;
    item.dataset.tabId = tab.id;

    item.innerHTML = `
      <input type="checkbox" class="compare-tab-checkbox" ${isSelected ? 'checked' : ''} />
      <div class="compare-tab-info">
        <div class="compare-tab-title" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</div>
        <div class="compare-tab-domain">${escapeHtml(domain)}</div>
      </div>
      ${isActive ? '<span class="compare-tab-badge">Current</span>' : ''}
    `;

    item.addEventListener('click', (e) => {
      const checkbox = item.querySelector('.compare-tab-checkbox');
      if (e.target !== checkbox) checkbox.checked = !checkbox.checked;

      if (checkbox.checked) {
        compareSelectedIds.add(tab.id);
        item.classList.add('selected');
      } else {
        compareSelectedIds.delete(tab.id);
        item.classList.remove('selected');
      }
      updateCompareButton();
    });

    listEl.appendChild(item);
  });

  updateCompareButton();
  show($('compare-modal-overlay'));
}

const compareBtn = $('btn-compare');
if (compareBtn) {
  compareBtn.addEventListener('click', async () => {
    if (currentPlan !== 'power') {
      showResult('Power Plan Required', 'Article comparison requires the Power plan.');
      phCapture('upgrade_wall_hit', { feature: 'compare' });
      return;
    }
    await openCompareModal();
  });
}

$('btn-compare-cancel')?.addEventListener('click', () => {
  hide($('compare-modal-overlay'));
});

$('btn-compare-run')?.addEventListener('click', async () => {
  hide($('compare-modal-overlay'));

  const selectedIds = [...compareSelectedIds];
  if (selectedIds.length < 2) {
    showError('Select at least 2 tabs to compare.');
    return;
  }

  setLoading('Comparing articles…');
  try {
    const { contexts } = await sendMsg('GET_TAB_CONTEXTS', { tabIds: selectedIds });

    if ((contexts ?? []).length < 2) {
      clearLoading();
      showError('Could not extract content from the selected tabs. Make sure they have readable articles.');
      return;
    }

    const data = await sendMsg('API_REQUEST', {
      endpoint: '/api/compare', method: 'POST', body: { articles: contexts },
    });
    clearLoading();
    showResult('Article Comparison', data.comparison);
    phCapture('compare_completed', { tab_count: selectedIds.length });
  } catch (err) {
    clearLoading();
    showError(err.message);
  }
});

// ─── Niche prompts ────────────────────────────────────────────────────────────

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
    setLoading(`Running ${NICHE_LABELS[promptType] ?? promptType}…`);
    try {
      const ctx = await getCurrentTabContext();
      if (!ctx?.text) { clearLoading(); showError('Could not extract page content.'); return; }
      const data = await sendMsg('API_REQUEST', {
        endpoint: '/api/niche', method: 'POST',
        body: { pageText: ctx.text, promptType },
      });
      clearLoading();
      showResult(NICHE_LABELS[promptType], data.result);
      phCapture('niche_prompt_used', { prompt_type: promptType });
    } catch (err) { clearLoading(); showError(err.message); }
  });
});

// ─── Export buttons ───────────────────────────────────────────────────────────

function exportToPDF(content, title) {
  if (typeof window.jspdf === 'undefined') { showError('PDF export: jsPDF not bundled.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(16);
  doc.text('IQPage — ' + title, 15, 20);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(content, 180), 15, 32);
  const pageTitle = title || document.title || 'summary';
  const safeName = pageTitle.replace(/[^a-z0-9]/gi, '-').substring(0, 50);
  doc.save(`IQPage-${safeName}.pdf`);
}

function exportToWord(content, title) {
  const html = `<html><head><meta charset='UTF-8'></head><body>
    <h2>IQPage — ${title}</h2>
    <pre style="font-family:Arial;font-size:12pt;white-space:pre-wrap">${content}</pre>
  </body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'application/msword' }));
  chrome.downloads.download({ url, filename: `IQPage-${Date.now()}.doc` });
}

function exportToMarkdown(content, title) {
  const md = `# IQPage: ${title}\n\n_Generated ${new Date().toLocaleString()}_\n\n---\n\n${content}`;
  const url = URL.createObjectURL(new Blob([md], { type: 'text/plain' }));
  chrome.downloads.download({ url, filename: `IQPage-${Date.now()}.md` });
}

const exportPdfBtn = $('btn-export-pdf');
if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => {
  if (currentPlan === 'free') { showError('Export requires Pro or higher.'); return; }
  phCapture('export_used', { format: 'pdf' });
  exportToPDF($('result-content')?.textContent ?? '', $('result-label')?.textContent ?? '');
});

const exportWordBtn = $('btn-export-word');
if (exportWordBtn) exportWordBtn.addEventListener('click', () => {
  if (currentPlan === 'free') { showError('Export requires Pro or higher.'); return; }
  phCapture('export_used', { format: 'word' });
  exportToWord($('result-content')?.textContent ?? '', $('result-label')?.textContent ?? '');
});

const exportMdBtn = $('btn-export-md');
if (exportMdBtn) exportMdBtn.addEventListener('click', () => {
  if (currentPlan !== 'power') { showError('Markdown export requires Power plan.'); return; }
  phCapture('export_used', { format: 'markdown' });
  exportToMarkdown($('result-content')?.textContent ?? '', $('result-label')?.textContent ?? '');
});

// ─── Q&A Chat ─────────────────────────────────────────────────────────────────

const openChatBtn = $('btn-open-chat');
if (openChatBtn) {
  openChatBtn.addEventListener('click', async () => {
    phCapture('chat_opened');
    const win = await chrome.windows.getCurrent();
    chrome.sidePanel.open({ windowId: win.id });
    window.close();
  });
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

function positionTooltip(tooltipEl, targetEl) {
  const tr = targetEl.getBoundingClientRect();
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;
  const margin = 8;
  let left = tr.left + tr.width / 2 - tw / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top  = `${tr.top - th - 10}px`;
}

function showOnboardingTooltip(step) {
  if (step === 2) {
    const tooltip = $('ob-tooltip-2');
    show(tooltip);
    requestAnimationFrame(() => positionTooltip(tooltip, $('btn-summarize')));
  } else if (step === 3) {
    const tooltip = $('ob-tooltip-3');
    show(tooltip);
    requestAnimationFrame(() => positionTooltip(tooltip, $('btn-open-chat')));
  }
}

let obCurrentStep = 0;

async function initOnboarding() {
  const data = await chrome.storage.local.get(['onboarding_complete', 'onboarding_step']);
  if (data.onboarding_complete) return;

  obCurrentStep = data.onboarding_step ?? 1;

  if (obCurrentStep === 1) {
    show($('ob-welcome'));
    $('ob-start-btn')?.addEventListener('click', async () => {
      obCurrentStep = 2;
      await chrome.storage.local.set({ onboarding_step: 2 });
      hide($('ob-welcome'));
      showOnboardingTooltip(2);
      phCapture('onboarding_started');
    }, { once: true });
  } else {
    showOnboardingTooltip(obCurrentStep);
  }
}

$('btn-summarize')?.addEventListener('click', (e) => {
  if (obCurrentStep === 2) {
    hide($('ob-tooltip-2'));
    obCurrentStep = 3;
    chrome.storage.local.set({ onboarding_step: 3 });
    showOnboardingTooltip(3);
  }
}, true);

$('btn-open-chat')?.addEventListener('click', (e) => {
  if (obCurrentStep === 3) {
    hide($('ob-tooltip-3'));
    obCurrentStep = 0;
    chrome.storage.local.set({ onboarding_complete: true });
    phCapture('onboarding_completed');
  }
}, true);

// ─── Boot ─────────────────────────────────────────────────────────────────────
init().then(() => initOnboarding());