// IQPage — Content Script
// Injects the highlight mini-menu and handles text selection on the page.

(function () {
  'use strict';

  let miniMenu = null;
  let lastSelectedText = '';
  let lastRange = null;

  // ─── Mini Menu ──────────────────────────────────────────────────────────────

  function createMiniMenu() {
    const menu = document.createElement('div');
    menu.id = 'IQPage-mini-menu';
    menu.innerHTML = `
      <div class="IQPage-menu-inner">
        <button data-action="explain" title="Explain">💡 Explain</button>
        <button data-action="translate" title="Translate to Spanish">🌐 Translate</button>
        <button data-action="save" title="Save as citation">📌 Save</button>
        <button data-action="note" title="Add note">📝 Note</button>
      </div>
      <div id="IQPage-menu-result" class="IQPage-result hidden"></div>
    `;
    menu.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      background: #1e1e2e;
      border: 1px solid #7c3aed;
      border-radius: 10px;
      padding: 6px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      min-width: 220px;
      display: none;
    `;

    // Inject base styles
    if (!document.getElementById('IQPage-styles')) {
      const style = document.createElement('style');
      style.id = 'IQPage-styles';
      style.textContent = `
        #IQPage-mini-menu .IQPage-menu-inner {
          display: flex; gap: 4px; flex-wrap: wrap;
        }
        #IQPage-mini-menu button {
          background: #2d2d44; color: #e2e8f0; border: none;
          border-radius: 6px; padding: 5px 10px; cursor: pointer;
          font-size: 12px; transition: background 0.2s;
          white-space: nowrap;
        }
        #IQPage-mini-menu button:hover { background: #7c3aed; }
        #IQPage-mini-menu .IQPage-result {
          margin-top: 8px; padding: 8px; background: #12121f;
          border-radius: 6px; color: #e2e8f0; font-size: 12px;
          line-height: 1.5; max-height: 160px; overflow-y: auto;
          word-break: break-word;
        }
        #IQPage-mini-menu .IQPage-result.hidden { display: none; }
        #IQPage-note-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 2147483646; display: flex;
          align-items: center; justify-content: center;
        }
        #IQPage-note-overlay .IQPage-note-box {
          background: #1e1e2e; border: 1px solid #7c3aed;
          border-radius: 12px; padding: 20px; width: 360px;
          color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        #IQPage-note-overlay textarea {
          width: 100%; height: 80px; background: #12121f;
          border: 1px solid #4a4a6a; border-radius: 6px; color: #e2e8f0;
          padding: 8px; font-size: 13px; resize: vertical; box-sizing: border-box;
        }
        #IQPage-note-overlay .note-actions {
          display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end;
        }
        #IQPage-note-overlay button {
          padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px;
        }
        #IQPage-note-overlay .btn-save { background: #7c3aed; color: white; }
        #IQPage-note-overlay .btn-cancel { background: #2d2d44; color: #e2e8f0; }
        #IQPage-highlight-mark {
          background: rgba(124, 58, 237, 0.25);
          border-bottom: 2px solid #7c3aed;
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    menu.addEventListener('click', handleMenuAction);
    document.body.appendChild(menu);
    return menu;
  }

  function showMenu(x, y) {
    if (!miniMenu) miniMenu = createMiniMenu();
    const resultEl = miniMenu.querySelector('#IQPage-menu-result');
    resultEl.textContent = '';
    resultEl.classList.add('hidden');

    miniMenu.style.display = 'block';
    miniMenu.style.left = `${Math.min(x, window.innerWidth - 240) + window.scrollX}px`;
    miniMenu.style.top = `${y + window.scrollY + 10}px`;
  }

  function hideMenu() {
    if (miniMenu) miniMenu.style.display = 'none';
  }

  function showResult(text) {
    if (!miniMenu) return;
    const resultEl = miniMenu.querySelector('#IQPage-menu-result');
    resultEl.textContent = text;
    resultEl.classList.remove('hidden');
  }

  function showLoading() {
    showResult('⏳ Processing...');
  }

  // ─── Menu Action Handler ───────────────────────────────────────────────────

  async function handleMenuAction(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'note') {
      showNoteOverlay(lastSelectedText);
      return;
    }

    showLoading();

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        endpoint: '/api/highlight',
        method: 'POST',
        body: {
          selectedText: lastSelectedText,
          action,
          pageUrl: location.href,
          domain: location.hostname,
        },
      });

      if (response.error) {
        showResult(`Error: ${response.error}`);
        return;
      }

      if (action === 'save') {
        // Save citation to local storage via background
        await chrome.runtime.sendMessage({
          type: 'SAVE_CITATION',
          citation: {
            text: lastSelectedText,
            pageUrl: location.href,
            domain: location.hostname,
            pageTitle: document.title,
          },
        });
        showResult('✅ Citation saved!');
      } else {
        showResult(response.result);
      }
    } catch (err) {
      showResult(`Error: ${err.message}`);
    }
  }

  // ─── Note Overlay ──────────────────────────────────────────────────────────

  function showNoteOverlay(selectedText) {
    const overlay = document.createElement('div');
    overlay.id = 'IQPage-note-overlay';
    overlay.innerHTML = `
      <div class="IQPage-note-box">
        <p style="font-size:13px;margin:0 0 8px;color:#a78bfa">Selected text:</p>
        <p style="font-size:12px;color:#94a3b8;margin:0 0 12px;max-height:60px;overflow:auto">"${selectedText.slice(0, 200)}${selectedText.length > 200 ? '…' : ''}"</p>
        <textarea id="IQPage-note-input" placeholder="Write your note here..."></textarea>
        <div style="font-size:12px;color:#64748b;margin-top:6px">
          <label><input type="checkbox" id="IQPage-expand-note" style="margin-right:4px">Ask AI to expand / question this note</label>
        </div>
        <div class="note-actions">
          <button class="btn-cancel" id="IQPage-note-cancel">Cancel</button>
          <button class="btn-save" id="IQPage-note-save">Save Note</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#IQPage-note-cancel').addEventListener('click', () => overlay.remove());

    overlay.querySelector('#IQPage-note-save').addEventListener('click', async () => {
      const note = overlay.querySelector('#IQPage-note-input').value.trim();
      const expand = overlay.querySelector('#IQPage-expand-note').checked;

      await chrome.runtime.sendMessage({
        type: 'SAVE_CITATION',
        citation: {
          text: selectedText,
          note,
          pageUrl: location.href,
          domain: location.hostname,
          pageTitle: document.title,
        },
      });

      overlay.remove();
      hideMenu();

      if (expand && note) {
        // Open side panel and trigger AI note expansion
        await chrome.runtime.sendMessage({
          type: 'API_REQUEST',
          endpoint: '/api/highlight',
          method: 'POST',
          body: {
            selectedText,
            action: 'expand_note',
            userNote: note,
            pageUrl: location.href,
          },
        }).then((response) => {
          if (response.result) {
            showExpandedNote(selectedText, note, response.result);
          }
        }).catch(console.error);
      }
    });
  }

  function showExpandedNote(selectedText, note, aiResponse) {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 2147483645;
      background: #1e1e2e; border: 1px solid #7c3aed; border-radius: 12px;
      padding: 16px; width: 320px; color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong style="color:#a78bfa">AI Note Expansion</strong>
        <button id="IQPage-close-exp" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px">✕</button>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin:0 0 8px">${aiResponse}</p>
    `;
    document.body.appendChild(div);
    div.querySelector('#IQPage-close-exp').addEventListener('click', () => div.remove());
    setTimeout(() => div.remove(), 30000);
  }

  // ─── Text Selection Listener ───────────────────────────────────────────────

  document.addEventListener('mouseup', (e) => {
    // Don't interfere with our own menu
    if (miniMenu && miniMenu.contains(e.target)) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 3) {
        lastSelectedText = text;
        lastRange = selection.getRangeAt(0);
        const rect = lastRange.getBoundingClientRect();
        showMenu(rect.left, rect.bottom);
      } else {
        hideMenu();
      }
    }, 10);
  });

  document.addEventListener('mousedown', (e) => {
    if (miniMenu && !miniMenu.contains(e.target)) {
      hideMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMenu();
  });

  // ─── Message Listener (from background) ───────────────────────────────────

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'CONTEXT_MENU_ACTION') {
      lastSelectedText = message.selectedText;
      // Trigger the same flow as clicking a menu button
      handleContextMenuAction(message);
    }
  });

  async function handleContextMenuAction({ action, selectedText, pageUrl, domain }) {
    if (action === 'save') {
      await chrome.runtime.sendMessage({
        type: 'SAVE_CITATION',
        citation: { text: selectedText, pageUrl, domain, pageTitle: document.title },
      });
      showToast('Citation saved!');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        endpoint: '/api/highlight',
        method: 'POST',
        body: { selectedText, action, pageUrl, domain },
      });

      if (response?.result) showToast(response.result, 8000);
    } catch (err) {
      showToast(`Error: ${err.message}`, 5000);
    }
  }

  function showToast(message, duration = 4000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #1e1e2e; border: 1px solid #7c3aed; border-radius: 8px;
      padding: 10px 18px; color: #e2e8f0; font-size: 13px;
      z-index: 2147483645; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 360px; text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }

})();
