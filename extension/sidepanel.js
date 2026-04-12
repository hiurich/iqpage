// PageIQ — Side Panel Script

// ─── Helpers ──────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function show(el) { el?.classList.remove('hidden'); }
function hide(el) { el?.classList.add('hidden'); }
function msg(type, data = {}) {
  return chrome.runtime.sendMessage({ type, ...data });
}

// ─── State ────────────────────────────────────────────────────────────────────
let chatHistory = [];      // [{ role: 'user'|'assistant', content: string }]
let pageContext = null;    // { text, url, title }
let currentDomain = '';
let currentPlan = 'free';
let isOnline = navigator.onLine;

// ─── Tab Switching ────────────────────────────────────────────────────────────
function activateTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach((c) => hide(c));
  document.getElementById(`btn-tab-${tabId}`)?.classList.add('active');
  show(document.getElementById(`tab-${tabId}`));
  if (tabId === 'history') loadHistory();
  if (tabId === 'citations') loadCitations();
}

$('btn-tab-chat').addEventListener('click', () => activateTab('chat'));
$('btn-tab-history').addEventListener('click', () => activateTab('history'));
$('btn-tab-citations').addEventListener('click', () => activateTab('citations'));

// ─── Context Loading ──────────────────────────────────────────────────────────
async function loadPageContext() {
  const statusEl = $('context-status');
  statusEl.textContent = '⟳ Loading context...';
  statusEl.className = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        text: document.body.innerText,
        url: location.href,
        title: document.title,
      }),
    });

    pageContext = results?.[0]?.result;
    if (!pageContext?.text) throw new Error('Could not extract text');

    currentDomain = new URL(pageContext.url).hostname;
    $('page-domain').textContent = currentDomain;

    statusEl.textContent = '✓ Page context loaded';
    statusEl.className = 'context-ok';
  } catch (err) {
    statusEl.textContent = '✗ Could not load context';
    statusEl.className = 'context-error';
  }
}

$('btn-reload-context').addEventListener('click', loadPageContext);

// ─── Chat ─────────────────────────────────────────────────────────────────────
function appendMessage(role, content) {
  const container = $('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function showTyping() {
  const container = $('chat-messages');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  $('typing-indicator')?.remove();
}

async function sendMessage(text) {
  if (!text.trim()) return;
  const sendBtn = $('btn-send');
  const input = $('chat-input');

  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;

  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  // Offline check
  if (!navigator.onLine) {
    removeTyping();
    const offlineMsg = 'You are currently offline. Chat requires an internet connection.';
    appendMessage('error', offlineMsg);
    chatHistory.push({ role: 'assistant', content: offlineMsg });
    sendBtn.disabled = false;
    return;
  }

  showTyping();

  try {
    const data = await msg('API_REQUEST', {
      endpoint: '/api/chat',
      method: 'POST',
      body: {
        message: text,
        history: chatHistory.slice(-20),
        pageContext: pageContext?.text ?? '',
        pageUrl: pageContext?.url ?? '',
        pageTitle: pageContext?.title ?? '',
      },
    });

    removeTyping();
    appendMessage('assistant', data.reply);
    chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    removeTyping();
    const errMsg = `Error: ${err.message}`;
    appendMessage('error', errMsg);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

$('btn-send').addEventListener('click', () => {
  sendMessage($('chat-input').value);
});

$('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage($('chat-input').value);
  }
});

// Auto-resize textarea
$('chat-input').addEventListener('input', (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
});

// Suggested prompts
document.querySelectorAll('.suggest-btn').forEach((btn) => {
  btn.addEventListener('click', () => sendMessage(btn.dataset.prompt));
});

// ─── History Tab ──────────────────────────────────────────────────────────────
async function loadHistory(domainFilter = '') {
  const container = $('history-list');
  container.innerHTML = '<div class="empty-state">Loading...</div>';

  if (currentPlan === 'free') {
    container.innerHTML = '<div class="empty-state">History requires a Pro or higher plan.<br><br><a href="#" id="upgrade-from-history" style="color:#a78bfa">Upgrade →</a></div>';
    return;
  }

  try {
    const params = domainFilter ? `?domain=${encodeURIComponent(domainFilter)}` : '';
    const data = await msg('API_REQUEST', {
      endpoint: `/api/me/history${params}`,
      method: 'GET',
    });

    if (!data.history?.length) {
      container.innerHTML = '<div class="empty-state">No history found for this domain.</div>';
      return;
    }

    container.innerHTML = '';
    data.history.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      const date = new Date(item.created_at).toLocaleDateString();
      div.innerHTML = `
        <div class="hi-title">${escapeHtml(item.page_title ?? 'Untitled')}</div>
        <div class="hi-domain">${escapeHtml(item.domain)}</div>
        <div class="hi-date">${date}</div>
        <div class="hi-summary">${escapeHtml((item.summary ?? '').slice(0, 120))}${item.summary?.length > 120 ? '…' : ''}</div>
      `;
      div.addEventListener('click', () => showHistoryDetail(item));
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load history: ${escapeHtml(err.message)}</div>`;
  }
}

function showHistoryDetail(item) {
  activateTab('chat');
  appendMessage('assistant', `📄 **${item.page_title}**\n\n${item.summary}`);
}

$('history-domain-filter').addEventListener('input', (e) => {
  loadHistory(e.target.value.trim());
});
$('btn-clear-history-filter').addEventListener('click', () => {
  $('history-domain-filter').value = '';
  loadHistory();
});

// ─── Citations Tab ────────────────────────────────────────────────────────────
async function loadCitations() {
  const container = $('citations-list');
  container.innerHTML = '<div class="empty-state">Loading...</div>';

  $('citations-domain-label').textContent = currentDomain || 'Current domain';

  const { citations } = await msg('GET_CITATIONS', { domain: currentDomain });

  if (!citations?.length) {
    container.innerHTML = '<div class="empty-state">No citations saved for this domain yet.<br>Select text on the page and click "Save".</div>';
    return;
  }

  container.innerHTML = '';
  citations.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'citation-item';
    const date = c.savedAt ? new Date(c.savedAt).toLocaleDateString() : '';
    div.innerHTML = `
      <div class="ci-text">"${escapeHtml(c.text)}"</div>
      ${c.note ? `<div class="ci-note">📝 ${escapeHtml(c.note)}</div>` : ''}
      <div class="ci-url">${escapeHtml(c.pageUrl ?? '')}</div>
      ${date ? `<div class="ci-date">${date}</div>` : ''}
    `;
    container.appendChild(div);
  });
}

$('btn-export-citations-md').addEventListener('click', async () => {
  const { citations } = await msg('GET_CITATIONS', { domain: currentDomain });
  if (!citations?.length) return;

  let md = `# PageIQ Citations — ${currentDomain}\n\n_Exported ${new Date().toLocaleString()}_\n\n---\n\n`;
  citations.forEach((c, i) => {
    md += `## Citation ${i + 1}\n\n> ${c.text}\n\n`;
    if (c.note) md += `**Note:** ${c.note}\n\n`;
    md += `*Source: ${c.pageUrl}*\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: `pageiq-citations-${currentDomain}-${Date.now()}.md` });
});

// ─── Offline Mode ─────────────────────────────────────────────────────────────
window.addEventListener('online', () => {
  isOnline = true;
  hide($('offline-banner'));
});

window.addEventListener('offline', async () => {
  isOnline = false;
  show($('offline-banner'));

  // Load cached summaries in chat
  const { summaries } = await msg('GET_CACHED_SUMMARIES');
  if (summaries?.length) {
    appendMessage('assistant', `📦 You're offline. Here are your ${summaries.length} cached summaries:\n\n` +
      summaries.map((s, i) => `${i + 1}. **${s.title ?? s.url}**\n${s.summary?.slice(0, 200)}…`).join('\n\n'));
  }
});

// ─── Utility ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function setPlanBadge(plan) {
  const badge = $('plan-badge');
  const classMap = { pro: 'pro', edu: 'edu', power: 'power' };
  badge.textContent = plan.toUpperCase();
  badge.className = `badge ${classMap[plan] ?? ''}`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  // Load plan
  try {
    const data = await msg('API_REQUEST', { endpoint: '/api/me', method: 'GET' });
    currentPlan = data.plan;
    setPlanBadge(data.plan);
  } catch {}

  await loadPageContext();

  // If offline, show banner
  if (!navigator.onLine) {
    show($('offline-banner'));
  }
}

init();
