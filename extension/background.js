// IQPage — Background Service Worker (Manifest V3)

const BACKEND_URL = 'https://iqpage-production.up.railway.app';
const SUPABASE_URL = 'https://vwpdzxhwnztcfvyuhxaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cGR6eGh3bnp0Y2Z2eXVoeGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjkyNzksImV4cCI6MjA5MTYwNTI3OX0.GX-EKJUH0-5PL5bkX7zA_0ldeWTN7XZiFWsBxRDv5MY';

// ─── Side Panel ──────────────────────────────────────────────────────────────

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch(() => {});

// ─── Context Menu ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'IQPage-explain',
    title: 'IQPage: Explain selection',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'IQPage-translate',
    title: 'IQPage: Translate to Spanish',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'IQPage-save-citation',
    title: 'IQPage: Save as citation',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const actionMap = {
    'IQPage-explain': 'explain',
    'IQPage-translate': 'translate',
    'IQPage-save-citation': 'save',
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
  return true;
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

const GOOGLE_WEB_CLIENT_ID = '946684141879-3gjnvkjjatv4tte01bta8b13sb5t42bk.apps.googleusercontent.com';

async function sha256hex(text) {
  const bytes = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns a valid JWT, refreshing it automatically if it expires in less than
 * 5 minutes. This prevents "Invalid or expired token" errors in the side panel.
 */
async function getAuthToken() {
  const { jwt, refresh_token } = await chrome.storage.local.get(['jwt', 'refresh_token']);
  if (!jwt) return { jwt: null };

  // Decode JWT payload to check expiration
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const expiresAt = payload.exp * 1000; // convert seconds → ms
    const fiveMinutes = 5 * 60 * 1000;

    // Refresh if token expires in less than 5 minutes
    if (expiresAt - Date.now() < fiveMinutes && refresh_token) {
      console.log('[IQPage] JWT expiring soon, refreshing...');
      const refreshed = await refreshToken(refresh_token);
      if (refreshed) return { jwt: refreshed };
    }
  } catch {
    // If decode fails, return the existing token and let the server decide
  }

  return { jwt };
}

/**
 * Refreshes the Supabase session using the stored refresh_token.
 * Returns the new access_token on success, or null on failure.
 */
async function refreshToken(refresh_token) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!res.ok) return null;

    const session = await res.json();
    if (!session.access_token) return null;

    await chrome.storage.local.set({
      jwt: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
    });

    console.log('[IQPage] JWT refreshed successfully');
    return session.access_token;
  } catch (err) {
    console.error('[IQPage] Token refresh failed:', err);
    return null;
  }
}

async function signIn() {
  try {
    const redirectUrl = chrome.identity.getRedirectURL();
    const rawNonce = crypto.randomUUID();
    const hashedNonce = await sha256hex(rawNonce);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_WEB_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', hashedNonce);
    authUrl.searchParams.set('prompt', 'select_account');

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

    const fragment = new URLSearchParams(new URL(responseUrl).hash.slice(1));
    const idToken = fragment.get('id_token');
    if (!idToken) {
      const errDesc = fragment.get('error_description') ?? fragment.get('error') ?? 'id_token missing';
      throw new Error(`Google did not return an id_token: ${errDesc}`);
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=id_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        provider: 'google',
        id_token: idToken,
        nonce: rawNonce,
      }),
    });

    const session = await res.json();
    if (!res.ok || !session.access_token) {
      const detail = session.error_description ?? session.msg ?? session.error ?? `HTTP ${res.status}`;
      throw new Error(`Supabase auth failed: ${detail}`);
    }

    await chrome.storage.local.set({
      jwt: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
    });

    return { success: true, user: session.user };

  } catch (err) {
    console.error('[IQPage] Sign in error:', err);
    return { success: false, error: err.message };
  }
}

async function signOut() {
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

/**
 * Makes an authenticated request to the backend.
 * Automatically refreshes the JWT if expired before retrying once.
 */
async function apiRequest(endpoint, method = 'POST', body = null) {
  let { jwt } = await getAuthToken();
  if (!jwt) throw new Error('Not authenticated');

  const makeRequest = async (token) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    if (body && method !== 'GET') options.body = JSON.stringify(body);
    return fetch(`${BACKEND_URL}${endpoint}`, options);
  };

  let res = await makeRequest(jwt);

  // If 401, try refreshing the token once and retry
  if (res.status === 401) {
    console.log('[IQPage] Got 401, attempting token refresh...');
    const { refresh_token } = await chrome.storage.local.get('refresh_token');
    if (refresh_token) {
      const newJwt = await refreshToken(refresh_token);
      if (newJwt) {
        res = await makeRequest(newJwt);
      }
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

// ─── Page Context ─────────────────────────────────────────────────────────────

async function getPageContext(senderTab) {
  let tabId = senderTab?.id;

  if (!tabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    tabId = activeTab?.id;
  }

  if (!tabId) return { text: '', url: '', title: '', error: 'No active tab found' };

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
  const updated = [{ ...data, cachedAt: Date.now() }, ...cached_summaries].slice(0, 5);
  await chrome.storage.local.set({ cached_summaries: updated });
  return { success: true };
}