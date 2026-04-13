// PageIQ — Background Service Worker (Manifest V3)

const BACKEND_URL = 'https://iqpage-production.up.railway.app';
const SUPABASE_URL = 'https://vwpdzxhwnztcfvyuhxaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cGR6eGh3bnp0Y2Z2eXVoeGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjkyNzksImV4cCI6MjA5MTYwNTI3OX0.GX-EKJUH0-5PL5bkX7zA_0ldeWTN7XZiFWsBxRDv5MY';

// ─── Side Panel ──────────────────────────────────────────────────────────────

// Explicitly disable "open side panel on action click" so the popup opens.
// This setting is PERSISTED by Chrome — removing the old call isn't enough;
// we must actively set it to false on every SW startup to override any
// previously stored true value.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch(() => {}); // Silently ignore if sidePanel API not available

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

/**
 * Step 1 — chrome.identity.getAuthToken()
 *   Chrome handles the entire OAuth dance for "Chrome Extension" type clients.
 *   No redirect_uri is involved, so redirect_uri_mismatch is impossible.
 *   Returns a Google OAuth2 access token from Chrome's internal token cache.
 *
 * Step 2 — Supabase signInWithIdToken (REST)
 *   POST /auth/v1/token?grant_type=id_token
 *   Supabase calls Google's tokeninfo endpoint to validate the access token,
 *   then creates/returns a Supabase session for the Google user.
 *
 * Prerequisites in Google Cloud Console (important):
 *   - OAuth client type must be "Chrome Extension"
 *   - Application ID must be set to your extension's ID (from chrome://extensions)
 *   - The same client_id must be in manifest.json → oauth2.client_id
 *
 * Prerequisites in Supabase dashboard:
 *   - Authentication → Providers → Google → must be enabled
 *   - Google Client ID and Secret must be filled in (same client_id as manifest)
 */
async function signIn() {
  try {
    // ── Step 1: Get Google OAuth token via Chrome Identity API ──────────────
    // Chrome uses the oauth2.client_id from manifest.json automatically.
    // No redirect URI, no popup — Chrome handles the auth flow natively.
    const googleToken = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!token) {
          reject(new Error('Google did not return a token. Check oauth2.client_id in manifest.json.'));
        } else {
          resolve(token);
        }
      });
    });

    // ── Step 2: Exchange Google token with Supabase ──────────────────────────
    // Supabase's grant_type=id_token endpoint accepts Google access tokens
    // and validates them against Google's tokeninfo API internally.
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=id_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        provider: 'google',
        id_token: googleToken,
      }),
    });

    const session = await res.json();

    if (!res.ok || !session.access_token) {
      // Provide a clear error message — common causes surfaced here:
      const detail = session.error_description ?? session.msg ?? session.error ?? `HTTP ${res.status}`;
      throw new Error(`Supabase auth failed: ${detail}`);
    }

    // ── Step 3: Persist session ──────────────────────────────────────────────
    await chrome.storage.local.set({
      jwt: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
    });

    return { success: true, user: session.user };

  } catch (err) {
    console.error('[PageIQ] Sign in error:', err);
    return { success: false, error: err.message };
  }
}

async function signOut() {
  // Revoke the cached Google token so Chrome doesn't reuse it silently.
  try {
    const cachedToken = await new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        resolve(chrome.runtime.lastError ? null : token);
      });
    });
    if (cachedToken) {
      // Remove from Chrome's token cache.
      await new Promise((resolve) => chrome.identity.removeCachedAuthToken({ token: cachedToken }, resolve));
      // Revoke on Google's side (best-effort, don't block sign-out if this fails).
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${cachedToken}`).catch(() => {});
    }
  } catch {}

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
