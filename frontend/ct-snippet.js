/**
 * Call Tracking Snippet
 * 
 * Include this script on pages where you want dynamic phone number swapping.
 * It reads UTM parameters, gets a replacement number from backend,
 * and swaps phone numbers on the page.
 */

(function () {
  'use strict';

  const CONFIG = {
    backendUrl: 'https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io',
    projectId: null, // TODO: Replace with your actual project UUID from Supabase
    defaultPhone: null,
    sessionId: null,
  };

  // Generate or retrieve session ID
  function getSessionId() {
    let sessionId = localStorage.getItem('ct_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ct_session_id', sessionId);
    }
    return sessionId;
  }

  // Parse UTM parameters from URL
  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
      utmTerm: params.get('utm_term') || '',
      utmContent: params.get('utm_content') || '',
    };
  }

  // Get Yandex.Metrica ym_uid (if available)
  function getYmUid() {
    try {
      // Method 1: From Yandex.Metrica object
      if (typeof ym !== 'undefined' && ym.getCid) {
        const cid = ym.getCid();
        if (cid && cid[1]) {
          const uid = cid[1];
          localStorage.setItem('ct_ym_uid', uid);
          return uid;
        }
      }
      // Method 2: From cookie
      const match = document.cookie.match(/_ym_uid=([^;]+)/);
      if (match) {
        localStorage.setItem('ct_ym_uid', match[1]);
        return match[1];
      }
      // Method 3: From localStorage (if previously saved)
      const saved = localStorage.getItem('ct_ym_uid');
      if (saved) return saved;
    } catch (e) {
      console.warn('[CT] Could not get ym_uid:', e);
    }
    return '';
  }

  // Get or generate project ID (can be set via window.CallTrackingConfig)
  function getProjectId() {
    if (window.CallTrackingConfig && window.CallTrackingConfig.projectId) {
      return window.CallTrackingConfig.projectId;
    }
    return CONFIG.projectId;
  }

  // Get default phone (fallback)
  function getDefaultPhone() {
    if (window.CallTrackingConfig && window.CallTrackingConfig.defaultPhone) {
      return window.CallTrackingConfig.defaultPhone;
    }
    return CONFIG.defaultPhone;
  }

  // Request replacement number from backend
  async function requestReplacementNumber() {
    const projectId = getProjectId();
    if (!projectId) {
      console.error('[CT] projectId is not configured. Set window.CallTrackingConfig.projectId');
      return { error: 'no_project_id' };
    }

    const payload = {
      projectId: projectId,
      sessionId: getSessionId(),
      ymUid: getYmUid(),
      landingUrl: window.location.href,
      referrer: document.referrer || '',
      ...getUtmParams(),
      visitedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${CONFIG.backendUrl}/assign-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[CT] Failed to get replacement number:', response.status, errorData);
        return { error: 'request_failed', details: errorData };
      }

      return await response.json();
    } catch (error) {
      console.error('[CT] Error requesting replacement number:', error);
      return { error: 'network_error', message: error.message };
    }
  }

  // Swap phone numbers in DOM
  function swapPhoneNumbers(replacementNumber, defaultPhone) {
    const phoneElements = document.querySelectorAll('[data-ct-phone], .ct-phone, a[href^="tel:"]');
    let swappedCount = 0;

    phoneElements.forEach((el) => {
      const originalPhone = el.getAttribute('data-ct-original') || el.textContent || el.getAttribute('href') || '';

      if (!originalPhone) return;

      // Save original phone if not saved
      if (!el.getAttribute('data-ct-original')) {
        el.setAttribute('data-ct-original', originalPhone.replace(/^tel:/, ''));
      }

      // Replace text content
      if (el.tagName === 'A' && el.href.startsWith('tel:')) {
        el.href = `tel:${replacementNumber}`;
        // Also update text if it contains the phone number
        if (el.textContent.match(/[\d\s\-\+\(\)]+/)) {
          el.textContent = replacementNumber;
        }
      } else {
        el.textContent = replacementNumber;
      }

      swappedCount++;
    });

    // Fallback: if no elements found with selectors, try to replace in text nodes
    if (swappedCount === 0) {
      const phoneRegex = /(\+?\d[\d\s\-\(\)]{7,}\d)/g;
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        if (phoneRegex.test(node.textContent)) {
          textNodes.push(node);
        }
      }

      textNodes.forEach((textNode) => {
        textNode.textContent = textNode.textContent.replace(phoneRegex, replacementNumber);
      });
    }

    console.log(`[CT] Swapped phone numbers to: ${replacementNumber}`);
  }

  // Main initialization
  async function init() {
    console.log('[CT] Initializing call tracking...');

    const result = await requestReplacementNumber();

    if (result.error) {
      console.warn('[CT] Could not get replacement number, using default phone');
      const defaultPhone = getDefaultPhone();
      if (defaultPhone) {
        swapPhoneNumbers(defaultPhone);
      }
      return;
    }

    if (result.shownPhoneNumber) {
      swapPhoneNumbers(result.shownPhoneNumber, getDefaultPhone());
    } else if (result.defaultPhone) {
      swapPhoneNumbers(result.defaultPhone, getDefaultPhone());
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
