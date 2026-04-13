// PageIQ — Background Service Worker (Manifest V3)

const BACKEND_URL = 'https://iqpage-production.up.railway.app';
const SUPABASE_URL = 'https://vwpdzxhwnztcfvyuhxaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cGR6eGh3bnp0Y2Z2eXVoeGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjkyNzksImV4cCI6MjA5MTYwNTI3OX0.GX-EKJUH0-5PL5bkX7zA_0ldeWTN7XZiFWsBxRDv5MY';

// ─── Side Panel ──────────────────────────────────────────────────────────────

// Keep the popup as the default action click behavior.
// The side panel is opened explicitly via the button inside the popup.
// Setting openPanelOnActionClick:true would suppress the popup entirely.

// ─── Context Menu ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'pageiq-explain',
    title: 'PageIQ: Explain selection',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'pageiq-translate',
    title: 'PageIQ: Translate to Spanish',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'pageiq-save-citation',
    title: 'PageIQ: Save as citation',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const actionMap = {
    'pageiq-explain': 'explain',
    'pageiq-translate': 'translate',
    'pageiq-save-citation': 'save',
  };
  const action = actionMap[info.menuItemId];
  if (!action || !info.selectionText) return;

  chrome.tabs.sendMessage(tab.id, {
    type: 'CONTEXT_MENU_ACTION',
    action,
    selectedText: info.selectionText,
    pageUrl: tab.url,
    domain: new URL(tab.url).hostname,
  });
});

// ─── Message Router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'GET_AUTH_TOKEN':
      return getAuthToken();

    case 'SIGN_IN':
      return signIn();

    case 'SIGN_OUT':
      return signOut();

    case 'GET_USER':
      return getUser();

    case 'API_REQUEST':
      return apiRequest(message.endpoint, message.method ?? 'POST', message.body);

    case 'GET_PAGE_CONTEXT':
      return getPageContext(sender.tab);

    case 'GET_TAB_CONTEXTS':
      return getTabContexts(message.tabIds);

    case 'SAVE_CITATION':
      return saveCitation(message.citation);

    case 'GET_CITATIONS':
      return getCitations(message.domain);

    case 'GET_CACHED_SUMMARIES':
      return getCachedSummaries();

    case 'CACHE_SUMMARY':
      return cacheSummary(message.data);

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getAuthToken() {
  const { jwt } = await chrome.storage.local.get('jwt');
  return { jwt: jwt ?? null };
}

async function signIn() {
  try {
    const redirectUrl = chrome.identity.getRedirectURL();
    const authUrl =
      `${SUPABASE_URL}/auth/v1/authorize?` +
      `provider=google&` +
      `redirect_to=${encodeURIComponent(redirectUrl)}&` +
      `response_type=code&` +
      `scopes=openid email profile`;

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    });

    // Extract code from redirect URL
    const url = new URL(responseUrl);
    const code = url.searchParams.get('code');
    if (!code) throw new Error('No auth code received');

    // Exchange code for session
    const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ auth_code: code, redirect_uri: redirectUrl }),
    });

    const session = await tokenRes.json();
    if (!session.access_token) throw new Error('Failed to exchange code for token');

    await chrome.storage.local.set({
      jwt: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
    });

    return { success: true, user: session.user };
  } catch (err) {
    console.error('Sign in error:', err);
    return { success: false, error: err.message };
  }
}

async function signOut() {
  await chrome.storage.local.remove(['jwt', 'refresh_token', 'user']);
  return { success: true };
}

async function getUser() {
  const { user } = await chrome.storage.local.get('user');
  return { user: user ?? null };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function apiRequest(endpoint, method = 'POST', body = null) {
  const { jwt } = await chrome.storage.local.get('jwt');
  if (!jwt) throw new Error('Not authenticated');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  };
  if (body && method !== 'GET') options.body = JSON.stringify(body);

  const res = await fetch(`${BACKEND_URL}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

// ─── Page Context ─────────────────────────────────────────────────────────────

async function getPageContext(senderTab) {
  // Prefer the tab that sent the message; fall back to the active tab in the
  // focused window (needed when the call comes from popup or side panel).
  let tabId = senderTab?.id;

  if (!tabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    tabId = activeTab?.id;
  }

  if (!tabId) return { text: '', url: '', title: '', error: 'No active tab found' };

  // chrome:// and edge:// pages cannot be scripted — bail out early.
  let tabInfo;
  try {
    tabInfo = await chrome.tabs.get(tabId);
  } catch {
    return { text: '', url: '', title: '', error: 'Cannot access tab info' };
  }

  const url = tabInfo.url ?? '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') || url.startsWith('about:')) {
    return { text: '', url, title: tabInfo.title ?? '', error: 'Cannot script browser pages' };
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Prefer article / main content; fall back to full body text.
        const article = document.querySelector('article, main, [role="main"]');
        const text = (article ?? document.body).innerText ?? '';
        return {
          text,
          url: location.href,
          title: document.title,
        };
      },
    });
    return results?.[0]?.result ?? { text: '', url, title: tabInfo.title ?? '' };
  } catch (err) {
    return { text: '', url, title: tabInfo.title ?? '', error: err.message };
  }
}

// Extract context from multiple specific tab IDs (for article compare)
async function getTabContexts(tabIds = []) {
  const results = [];
  for (const tabId of tabIds.slice(0, 3)) {
    const ctx = await getPageContext({ id: tabId });
    if (ctx?.text) results.push(ctx);
  }
  return { contexts: results };
}

// ─── Citations ────────────────────────────────────────────────────────────────

async function saveCitation(citation) {
  const domain = citation.domain;
  const key = `citations_${domain}`;
  const { [key]: existing = [] } = await chrome.storage.local.get(key);
  existing.unshift({ ...citation, id: Date.now() });
  await chrome.storage.local.set({ [key]: existing.slice(0, 100) });
  return { success: true };
}

async function getCitations(domain) {
  const key = `citations_${domain}`;
  const { [key]: citations = [] } = await chrome.storage.local.get(key);
  return { citations };
}

// ─── Offline Cache ────────────────────────────────────────────────────────────

async function getCachedSummaries() {
  const { cached_summaries = [] } = await chrome.storage.local.get('cached_summaries');
  return { summaries: cached_summaries };
}

async function cacheSummary(data) {
  const { cached_summaries = [] } = await chrome.storage.local.get('cached_summaries');
  // Keep last 5 summaries
  const updated = [{ ...data, cachedAt: Date.now() }, ...cached_summaries].slice(0, 5);
  await chrome.storage.local.set({ cached_summaries: updated });
  return { success: true };
}
