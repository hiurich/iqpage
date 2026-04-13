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

// Web OAuth 2.0 client ID (NOT the Chrome Extension type client).
// In Google Cloud Console: Credentials → Web application client.
// Authorized redirect URIs must include: https://<extension-id>.chromiumapp.org/
// Get your extension ID from chrome://extensions (enable Developer mode).
const GOOGLE_WEB_CLIENT_ID = '946684141879-3gjnvkjjatv4tte01bta8b13sb5t42bk.apps.googleusercontent.com';

/**
 * Hashes a string with SHA-256 and returns a lowercase hex string.
 * Required by the OIDC implicit flow: Google embeds the hashed nonce in the
 * id_token, and Supabase hashes the raw nonce to verify it matches.
 */
async function sha256hex(text) {
  const bytes = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getAuthToken() {
  const { jwt } = await chrome.storage.local.get('jwt');
  return { jwt: jwt ?? null };
}

/**
 * Auth flow: launchWebAuthFlow → Google id_token → Supabase signInWithIdToken
 *
 * Why this works (and getAuthToken didn't):
 *   - chrome.identity.getAuthToken() returns an opaque OAUTH2 ACCESS token.
 *     Supabase's grant_type=id_token verifies token signature — it needs a JWT.
 *   - launchWebAuthFlow with response_type=id_token asks Google to return an
 *     actual signed JWT (id_token) in the redirect URL fragment. ✓
 *
 * Google Cloud Console setup (Web application client):
 *   1. Create a new OAuth 2.0 client → type: "Web application"
 *   2. Authorized redirect URIs → add the URL printed by:
 *        chrome.identity.getRedirectURL()  (run in background console)
 *      Format: https://<extension-id>.chromiumapp.org/
 *   3. Copy the Client ID into GOOGLE_WEB_CLIENT_ID above.
 *
 * Supabase dashboard setup:
 *   Authentication → Providers → Google → enable, paste the same Client ID +
 *   Client Secret from the Web application client.
 */
async function signIn() {
  try {
    // ── Step 1: Build the Google OIDC authorization URL ─────────────────────
    const redirectUrl = chrome.identity.getRedirectURL(); // https://<id>.chromiumapp.org/

    // Raw nonce — sent to Supabase so it can verify the id_token's nonce claim.
    const rawNonce = crypto.randomUUID();
    // Hashed nonce — embedded by Google inside the id_token.
    const hashedNonce = await sha256hex(rawNonce);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_WEB_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', hashedNonce);   // hashed nonce → Google embeds in JWT
    authUrl.searchParams.set('prompt', 'select_account'); // always show account picker

    // ── Step 2: Open Google's sign-in page via Chrome Identity ──────────────
    const responseUrl = await new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: authUrl.toString(), interactive: true },
        (url) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!url) {
            reject(new Error('Auth flow closed without a response.'));
          } else {
            resolve(url);
          }
        }
      );
    });

    // ── Step 3: Extract id_token from the redirect URL fragment (#) ─────────
    // Google returns tokens in the hash, not the query string.
    const fragment = new URLSearchParams(new URL(responseUrl).hash.slice(1));
    const idToken = fragment.get('id_token');
    if (!idToken) {
      const errDesc = fragment.get('error_description') ?? fragment.get('error') ?? 'id_token missing';
      throw new Error(`Google did not return an id_token: ${errDesc}`);
    }

    // ── Step 4: Exchange id_token with Supabase ──────────────────────────────
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=id_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        provider: 'google',
        id_token: idToken,
        nonce: rawNonce, // raw nonce — Supabase hashes this and checks against JWT claim
      }),
    });

    const session = await res.json();
    if (!res.ok || !session.access_token) {
      const detail = session.error_description ?? session.msg ?? session.error ?? `HTTP ${res.status}`;
      throw new Error(`Supabase auth failed: ${detail}`);
    }

    // ── Step 5: Persist the Supabase session ────────────────────────────────
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
  // Best-effort: notify Supabase to invalidate the server-side session.
  try {
    const { jwt } = await chrome.storage.local.get('jwt');
    if (jwt) {
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${jwt}` },
      }).catch(() => {});
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
