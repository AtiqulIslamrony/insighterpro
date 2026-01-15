/**
 * ============================================================================
 * INSIGHTER PRO - Content Script
 * ============================================================================
 * 
 * @copyright 2024-2026 Atiqul Islam & Abdul Kader Shimul. All Rights Reserved.
 * @author    Atiqul Islam <https://linkedin.com/in/insighteratiqul>

 * @version   4.3.0
 * @license   Proprietary - See LICENSE file
 * 
 * UNAUTHORIZED COPYING, MODIFICATION, DISTRIBUTION, OR USE IS PROHIBITED.
 * ============================================================================
 */
(function() {
  'use strict';
  
  const websiteHost = location.host.replace('www.', '');
  
  const isExtensionValid = () => {
    try { return !!chrome.runtime?.id; }
    catch { return false; }
  };
  
  const isShopifyPixelIframe = () => {
    if (window.top === window.self) return false; // Must be in iframe
    const url = location.href.toLowerCase();
    // Check various Shopify Custom Pixel URL patterns
    return url.includes('/custom/web-pixel') || 
           url.includes('web-pixel-') ||
           url.includes('/wpm@') ||
           url.includes('web-pixels-manager') ||
           url.includes('/pixels/') && (url.includes('shopify') || url.includes('myshopify'));
  };
  const isMainFrame = () => window.top === window.self;

  // ===== SHOPIFY PIXEL IFRAME SCRIPT =====
  function runShopifyPixelScript() {
    console.log('[Insighter] Running in Shopify Custom Pixel iframe:', location.href);
    
    chrome.storage.sync.get(['shopifyGtmPreview', 'customPixelDataLayer'], (result) => {
      const shopifyGtmPreview = result.shopifyGtmPreview === true || result.shopifyGtmPreview === 1;
      const customPixelDataLayer = result.customPixelDataLayer !== false && result.customPixelDataLayer !== 0;
      
      console.log('[Insighter] Settings:', { customPixelDataLayer, shopifyGtmPreview });
      
      // If customPixelDataLayer is enabled, patch the dataLayer to forward events
      if (customPixelDataLayer) {
        console.log('[Insighter] Patching dataLayer for Custom Pixel...');
        try {
          chrome.runtime.sendMessage({ type: 'patchShopifyDataLayer' }, (response) => {
            console.log('[Insighter] patchShopifyDataLayer response:', response);
          });
        } catch (e) {
          console.error('[Insighter] Error calling patchShopifyDataLayer:', e);
        }
      }
      
      // If GTM Preview is enabled, handle preview mode communication
      if (shopifyGtmPreview) {
        // Find ALL GTM container IDs in the iframe
        const gtmContainerIds = new Set();
        
        // Check inline scripts
        for (const script of document.scripts) {
          const code = script.textContent || '';
          // Look for GTM container IDs in any context
          const matches = code.matchAll(/GTM-[A-Z0-9]{5,8}/g);
          for (const match of matches) {
            gtmContainerIds.add(match[0]);
          }
        }
        
        // Also check script src attributes for GTM
        for (const script of document.scripts) {
          if (script.src?.includes('googletagmanager.com/gtm.js')) {
            const urlMatch = script.src.match(/[?&]id=(GTM-[A-Z0-9]+)/);
            if (urlMatch) gtmContainerIds.add(urlMatch[1]);
          }
        }
        
        // Check window.google_tag_manager
        if (window.google_tag_manager) {
          for (const key of Object.keys(window.google_tag_manager)) {
            if (key.startsWith('GTM-')) gtmContainerIds.add(key);
          }
        }
        
        console.log('[Insighter] Found GTM containers in iframe:', Array.from(gtmContainerIds));
        
        // Send check request for each container found with retries
        const sendPreviewCheck = (containerId, attempt = 0) => {
          window.top.postMessage({
            action: 'INSIGHTER_CHECK_PREVIEW_MODE',
            src: location.href,
            containerId: containerId
          }, '*');
          
          // Retry a few times in case Tag Assistant connects later
          if (attempt < 5) {
            setTimeout(() => sendPreviewCheck(containerId, attempt + 1), 2000);
          }
        };
        
        gtmContainerIds.forEach(containerId => {
          setTimeout(() => sendPreviewCheck(containerId), 50);
        });
        
        // Also check if GTM Injector is being used on the main page
        // and forward our container ID up
        setTimeout(() => {
          window.top.postMessage({
            action: 'INSIGHTER_CUSTOM_PIXEL_READY',
            src: location.href,
            hasGtm: gtmContainerIds.size > 0,
            containerIds: Array.from(gtmContainerIds)
          }, '*');
        }, 100);
        
        // Listen for preview enable response
        window.addEventListener('message', ({ data }) => {
          if (data.action === 'INSIGHTER_ENABLE_PREVIEW') {
            console.log('[Insighter] Preview mode enabled for container:', data.containerId);
            // Ensure dataLayer is patched when preview is enabled
            if (!window.__INSIGHTER_DL_PATCHED__) {
              try { 
                chrome.runtime.sendMessage({ type: 'patchShopifyDataLayer' }); 
              } catch {}
            }
          }
        });
      }
    });
  }

  // ===== MAIN SITE SCRIPT =====
  function runMainSiteScript() {
    if (window.__INSIGHTER_PRO__) return;
    window.__INSIGHTER_PRO__ = true;

    const TD = {
      trackers: {
        gtm: { found: false, ids: new Set(), events: new Set() },
        ga4: { found: false, ids: new Set(), events: new Set() },
        facebookPixel: { found: false, ids: new Set(), events: new Set() },
        googleAds: { found: false, ids: new Set(), events: new Set() },
        linkedin: { found: false, ids: new Set(), events: new Set() },
        bingAds: { found: false, ids: new Set(), events: new Set() },
        tiktok: { found: false, ids: new Set(), events: new Set() },
        pinterest: { found: false, ids: new Set(), events: new Set() },
        twitter: { found: false, ids: new Set(), events: new Set() },
        snapchat: { found: false, ids: new Set(), events: new Set() },
        reddit: { found: false, ids: new Set(), events: new Set() }
      },
      dlEntries: [],
      pixelEvents: [],
      pendingCallbacks: {},
      callbackId: 0,
      debounceTimer: null,

      addTrackerId(key, id) {
        if (this.trackers[key]?.ids && id) {
          this.trackers[key].found = true;
          this.trackers[key].ids.add(id);
        }
      },

      addTrackerEvent(key, event) {
        if (this.trackers[key]?.events && event) {
          this.trackers[key].found = true;
          this.trackers[key].events.add(event);
        }
      },

      resetTrackers() {
        // Clear all tracker IDs and events
        Object.keys(this.trackers).forEach(key => {
          this.trackers[key].found = false;
          this.trackers[key].ids = new Set();
          this.trackers[key].events = new Set();
        });
      },

      init() {
        this.injectScript();
        this.listenForInjected();
        this.setupShopifyMessageListeners();
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.onReady());
        } else {
          this.onReady();
        }
      },

      injectScript() {
        if (!isExtensionValid()) return;
        try {
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('inject.js');
          script.onload = () => script.remove();
          (document.head || document.documentElement).appendChild(script);
        } catch {}
      },

      setupShopifyMessageListeners() {
        // Store pending iframe sources for delayed preview mode enabling
        const pendingIframes = new Map(); // containerId -> Set of iframe srcs
        
        // Helper function to detect GTM Preview mode using multiple methods
        const isGtmPreviewActive = (containerId) => {
          // Method 1: Check window.name for Tag Assistant debug pattern
          const windowNameMatch = window.name.match(/tag-assistant-debug-window-(GTM-[\w\d]+)/);
          if (windowNameMatch?.[1] === containerId) return true;
          
          // Method 2: Check for generic Tag Assistant debug window (any container)
          if (window.name.includes('tag-assistant-debug') && window.name.includes(containerId)) return true;
          
          // Method 3: Check URL parameters for GTM debug mode
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('gtm_debug') === 'x' || urlParams.get('gtm_debug') === '1') return true;
          if (urlParams.get('gtm_auth') && urlParams.get('gtm_preview')) return true;
          
          // Method 4: Check for google_tag_assistant_data (Tag Assistant extension)
          if (window.google_tag_assistant_data?.[containerId]) return true;
          
          // Method 5: Check for __TAG_ASSISTANT_API
          if (window.__TAG_ASSISTANT_API) return true;
          
          // Method 6: Check google_tag_manager for debug state
          if (window.google_tag_manager?.[containerId]?.['gtm.debugMode']) return true;
          
          // Method 7: Check for GTM debug cookie (format: _dbg_GTM-XXXXX or __GTM_PREVIEW_ID)
          if (document.cookie.includes(`_dbg_${containerId}`) || 
              document.cookie.includes('__GTM_PREVIEW_ID')) return true;
          
          return false;
        };
        
        // Helper function to enable preview for pending iframes
        const enablePreviewForIframe = (containerId, iframeSrc) => {
          for (const iframe of document.querySelectorAll('iframe')) {
            if (iframe.src === iframeSrc) {
              iframe.contentWindow.postMessage({
                action: 'INSIGHTER_ENABLE_PREVIEW',
                containerId: containerId
              }, '*');
            }
          }
        };
        
        // Helper to check all pending iframes when preview mode is detected
        const checkPendingIframes = () => {
          for (const [containerId, srcs] of pendingIframes.entries()) {
            if (isGtmPreviewActive(containerId)) {
              for (const src of srcs) {
                enablePreviewForIframe(containerId, src);
              }
              pendingIframes.delete(containerId);
            }
          }
        };
        
        window.addEventListener('message', ({ data }) => {
          if (data.action === 'INSIGHTER_CHECK_PREVIEW_MODE' && data.containerId) {
            // Check if GTM Preview is active for this container
            if (isGtmPreviewActive(data.containerId)) {
              enablePreviewForIframe(data.containerId, data.src);
            } else {
              // Store for later in case preview mode is enabled after
              if (!pendingIframes.has(data.containerId)) {
                pendingIframes.set(data.containerId, new Set());
              }
              pendingIframes.get(data.containerId).add(data.src);
            }
          }
          
          // Listen for Tag Assistant connection events
          if (data.event === 'TAG_ASSISTANT_BADGE_STATE_CHANGED' || 
              data.event === 'gtm.connect' ||
              data.action === 'gtm_preview_connect') {
            checkPendingIframes();
          }
          
          if (data.action === 'INSIGHTER_DL_PUSH' && data.data) {
            try { chrome.runtime.sendMessage({ type: 'shopifyPixelDataLayerPush', eventsData: data.data }); }
            catch {}
          }
        });
        
        // Periodically check for preview mode (covers delayed Tag Assistant connection)
        let checkCount = 0;
        const intervalId = setInterval(() => {
          checkCount++;
          if (pendingIframes.size > 0) {
            checkPendingIframes();
          }
          // Stop checking after 30 seconds (30 checks at 1s intervals)
          if (checkCount >= 30) {
            clearInterval(intervalId);
          }
        }, 1000);
      },

      onReady() {
        this.runFullScan();
        this.observeDOM();
        this.requestFromInjected('GET_ALL');
        
        // Delayed scans for dynamic content
        [500, 2000].forEach(delay => {
          setTimeout(() => {
            if (isExtensionValid()) {
              this.requestFromInjected('GET_ALL');
              this.runFullScan();
              this.saveAndNotify();
            }
          }, delay);
        });
      },

      listenForInjected() {
        window.addEventListener('message', (e) => {
          if (e.source !== window || e.data?.source !== 'TD_INJECT') return;
          
          const { type, id, result, entry, entries, event } = e.data;
          
          switch (type) {
            case 'DL_PUSH':
              this.addDlEntry(entry);
              break;
            case 'DL_INIT':
              entries?.forEach(ent => this.addDlEntry(ent));
              break;
            case 'PIXEL_EVENT':
              this.handlePixelEvent(event);
              break;
            case 'RESPONSE':
              if (id && this.pendingCallbacks[id]) {
                this.pendingCallbacks[id](result);
                delete this.pendingCallbacks[id];
              }
              if (result?.pixelIds) this.processPixelIds(result.pixelIds);
              result?.dlHistory?.forEach(ent => this.addDlEntry(ent));
              result?.pixelEvents?.forEach(evt => this.handlePixelEvent(evt));
              break;
          }
        });
      },

      handlePixelEvent(event) {
        if (!event) return;
        
        const platformMap = {
          facebook: 'facebookPixel', ga4: 'ga4', googleAds: 'googleAds',
          tiktok: 'tiktok', linkedin: 'linkedin', pinterest: 'pinterest',
          twitter: 'twitter', snapchat: 'snapchat', reddit: 'reddit', bing: 'bingAds'
        };
        
        const trackerKey = platformMap[event.platform];
        if (trackerKey && this.trackers[trackerKey]) {
          this.trackers[trackerKey].found = true;
          if (event.event) this.trackers[trackerKey].events.add(event.event);
          this.debouncedSave();
        }
        
        // Dedupe check
        const isDupe = this.pixelEvents.some(e => 
          e.platform === event.platform && 
          e.event === event.event &&
          Math.abs((e.timestamp || 0) - (event.timestamp || 0)) < 1000
        );
        
        if (!isDupe) {
          this.pixelEvents.push({
            id: event.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            platform: event.platform,
            platformName: event.platformName,
            event: event.event,
            params: event.params || {},
            timestamp: event.timestamp || Date.now(),
            action: event.action
          });
          
          if (this.pixelEvents.length > 100) this.pixelEvents.shift();
        }
      },

      requestFromInjected(cmd, payload = {}) {
        return new Promise(resolve => {
          try {
            const id = ++this.callbackId;
            this.pendingCallbacks[id] = resolve;
            window.postMessage({ source: 'TD_CONTENT', cmd, payload, id }, '*');
            setTimeout(() => {
              if (this.pendingCallbacks[id]) {
                delete this.pendingCallbacks[id];
                resolve(null);
              }
            }, 3000);
          } catch { resolve(null); }
        });
      },

      addDlEntry(entry) {
        if (!entry || this.dlEntries.some(e => e.index === entry.index)) return;
        
        this.dlEntries.push(entry);
        this.dlEntries.sort((a, b) => a.index - b.index);
        
        if (entry.event && !entry.event.startsWith('gtm.') && this.trackers.ga4?.events) {
          this.trackers.ga4.events.add(entry.event);
        }
        
        if (isExtensionValid()) {
          try { chrome.runtime.sendMessage({ type: 'DL_PUSH', entry }).catch(() => {}); }
          catch {}
        }
        
        this.saveDlEntries();
      },

      processPixelIds(pixelIds) {
        const map = {
          facebook: 'facebookPixel', linkedin: 'linkedin', tiktok: 'tiktok',
          pinterest: 'pinterest', twitter: 'twitter', snapchat: 'snapchat',
          reddit: 'reddit', bing: 'bingAds', ga4: 'ga4', gtag: 'ga4', gtm: 'gtm'
        };
        
        for (const [key, ids] of Object.entries(pixelIds)) {
          const trackerKey = map[key];
          if (trackerKey && this.trackers[trackerKey]) {
            ids.forEach(id => id && this.addTrackerId(trackerKey, id));
          }
        }
        this.debouncedSave();
      },

      runFullScan() {
        const html = document.documentElement.outerHTML || '';
        
        // GTM - check scripts and inline code
        for (const s of document.scripts) {
          const src = s.src || '';
          const txt = s.textContent || '';
          if (src.includes('googletagmanager.com/gtm.js') || txt.includes('gtm.js') || txt.includes('googletagmanager.com')) {
            const matches = (src + txt).match(/GTM-[A-Z0-9]+/gi) || [];
            matches.forEach(id => this.addTrackerId('gtm', id.toUpperCase()));
          }
        }
        
        // GTM - also check for GTM in config calls and gtag
        const gtmConfigMatches = html.match(/['"]GTM-[A-Z0-9]+['"]/gi) || [];
        gtmConfigMatches.forEach(m => {
          const id = m.replace(/['"]/g, '').toUpperCase();
          if (id.match(/^GTM-[A-Z0-9]{6,}$/)) this.addTrackerId('gtm', id);
        });
        
        // GA4 - STRICT matching: Must be uppercase G- followed by uppercase alphanumeric
        // Real GA4 IDs look like: G-HXQEWNBSV0 (always uppercase)
        // Exclude CSS classes like g-inline, g-animation, g-passion
        const ga4Candidates = html.match(/G-[A-Z0-9]{6,15}/g) || []; // Case-sensitive, uppercase only
        ga4Candidates.forEach(id => {
          // Additional validation: must be in a tracking context, not a CSS class/ID
          // Real GA4 IDs are typically 10-12 chars after "G-"
          if (id.match(/^G-[A-Z0-9]{7,12}$/) && !id.match(/^G-[a-z]/)) {
            this.addTrackerId('ga4', id);
          }
        });
        
        // Facebook
        (html.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d{10,})['"]/gi) || []).forEach(m => {
          const id = m.match(/(\d{10,})/);
          if (id) this.addTrackerId('facebookPixel', id[1]);
        });
        if (html.includes('connect.facebook.net') || html.includes('fbevents.js')) {
          this.trackers.facebookPixel.found = true;
        }
        
        // Google Ads
        (html.match(/AW-\d+/gi) || []).forEach(id => this.addTrackerId('googleAds', id));
        
        // LinkedIn
        (html.match(/_linkedin_partner_id\s*=\s*["']?(\d+)/gi) || []).forEach(m => {
          const id = m.match(/(\d+)/);
          if (id) this.addTrackerId('linkedin', id[1]);
        });
        if (html.includes('snap.licdn.com') || html.includes('linkedin.com/insight')) {
          this.trackers.linkedin.found = true;
        }
        
        // TikTok
        (html.match(/ttq\.load\(['"]([A-Z0-9]+)['"]\)/gi) || []).forEach(m => {
          const id = m.match(/['"]([A-Z0-9]+)['"]/);
          if (id) this.addTrackerId('tiktok', id[1]);
        });
        if (html.includes('analytics.tiktok.com')) this.trackers.tiktok.found = true;
        
        // Other pixels
        if (html.includes('pintrk') || html.includes('s.pinimg.com')) this.trackers.pinterest.found = true;
        if (html.includes('static.ads-twitter.com') || html.includes('twq(')) this.trackers.twitter.found = true;
        if (html.includes('sc-static.net') || html.includes('snaptr(')) this.trackers.snapchat.found = true;
        if (html.includes('www.redditstatic.com/ads') || html.includes('rdt(')) this.trackers.reddit.found = true;
        if (html.match(/uetq.*push.*['"](\d{7,})['"]/gi) || html.includes('bat.bing.com')) this.trackers.bingAds.found = true;
      },

      observeDOM() {
        const observer = new MutationObserver((mutations) => {
          let shouldScan = false;
          for (const m of mutations) {
            for (const node of m.addedNodes) {
              if (node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME') {
                shouldScan = true;
                break;
              }
            }
            if (shouldScan) break;
          }
          if (shouldScan) {
            setTimeout(() => {
              this.runFullScan();
              this.debouncedSave();
            }, 300);
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      },

      serialize() {
        const r = {};
        for (const [k, tracker] of Object.entries(this.trackers)) {
          r[k] = {
            found: tracker.found || false,
            ids: Array.from(tracker.ids || []),
            events: Array.from(tracker.events || [])
          };
        }
        return r;
      },

      debouncedSave() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.saveAndNotify(), 100);
      },

      saveDlEntries() {
        if (!isExtensionValid()) return;
        try {
          chrome.storage.local.set({
            [`dl_${location.hostname}`]: { entries: this.dlEntries.slice(-500), ts: Date.now() }
          }).catch(() => {});
        } catch {}
      },

      saveAndNotify() {
        if (!isExtensionValid()) return;
        try {
          const data = this.serialize();
          // Count found trackers for badge
          let foundCount = 0;
          Object.values(data).forEach(t => {
            if (t.found) foundCount++;
          });
          
          chrome.storage.local.set({
            [`trackers_${location.hostname}`]: { data, url: location.href, ts: Date.now() }
          }).catch(() => {});
          chrome.runtime.sendMessage({ type: 'TRACKER_UPDATE', data, foundCount }).catch(() => {});
        } catch {}
      },

      handleMessage(msg, sender, sendResponse) {
        if (!isExtensionValid()) return;
        
        const handlers = {
          'GET_DATA': () => {
            this.runFullScan();
            this.requestFromInjected('GET_ALL').then(() => {
              sendResponse({ trackers: this.serialize(), dlEntries: this.dlEntries, url: location.href });
            });
            return true;
          },
          
          'GET_PAGE_CONTENT': () => {
            try {
              sendResponse({
                html: document.documentElement.outerHTML,
                scripts: Array.from(document.scripts).map(s => s.src + ' ' + (s.textContent || '')),
                links: Array.from(document.querySelectorAll('link[href]')).map(l => l.href),
                meta: Array.from(document.querySelectorAll('meta')).reduce((acc, m) => {
                  const name = m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv');
                  if (name) acc[name] = m.getAttribute('content') || '';
                  return acc;
                }, {}),
                url: location.href
              });
            } catch {
              sendResponse({ html: '', scripts: [], meta: {}, url: location.href });
            }
            return true;
          },
          
          'GET_STORAGE': () => {
            this.requestFromInjected('GET_STORAGE', { type: msg.storageType }).then(data => sendResponse({ data }));
            return true;
          },
          
          'SET_STORAGE': () => {
            this.requestFromInjected('SET_STORAGE', { type: msg.storageType, key: msg.key, value: msg.value })
              .then(result => sendResponse({ success: result }));
            return true;
          },
          
          'REMOVE_STORAGE': () => {
            this.requestFromInjected('REMOVE_STORAGE', { type: msg.storageType, key: msg.key })
              .then(result => sendResponse({ success: result }));
            return true;
          },
          
          'CLEAR_STORAGE': () => {
            this.requestFromInjected('CLEAR_STORAGE', { type: msg.storageType })
              .then(result => sendResponse({ success: result }));
            return true;
          },
          
          'GET_COOKIES': () => {
            this.requestFromInjected('GET_COOKIES').then(data => sendResponse({ data }));
            return true;
          },
          
          'SET_COOKIE': () => {
            this.requestFromInjected('SET_COOKIE', { name: msg.name, value: msg.value, days: msg.days })
              .then(result => sendResponse({ success: result }));
            return true;
          },
          
          'DELETE_COOKIE': () => {
            this.requestFromInjected('DELETE_COOKIE', { name: msg.name })
              .then(result => sendResponse({ success: result }));
            return true;
          },
          
          'ANALYZE_PAGE': () => {
            this.requestFromInjected('ANALYZE_PAGE').then(data => sendResponse({ data }));
            return true;
          },
          
          'EXECUTE_CODE': () => {
            this.requestFromInjected('EXECUTE', { code: msg.code }).then(result => sendResponse(result));
            return true;
          },
          
          'DL_PUSH': () => {
            this.requestFromInjected('DL_PUSH', { data: msg.data }).then(result => sendResponse(result));
            return true;
          },
          
          'RESCAN': () => {
            this.runFullScan();
            this.requestFromInjected('GET_ALL');
            this.saveAndNotify();
            sendResponse({ trackers: this.serialize() });
            return true; // Keep channel open
          },
          
          'GET_PIXEL_EVENTS': () => {
            this.requestFromInjected('GET_PIXEL_EVENTS').then(events => {
              const allEvents = [...(events || []), ...this.pixelEvents];
              const seen = new Set();
              sendResponse({
                events: allEvents.filter(e => {
                  const key = `${e.platform}:${e.event}:${Math.floor((e.timestamp || 0) / 1000)}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                })
              });
            }).catch(() => sendResponse({ events: this.pixelEvents }));
            return true;
          },
          
          'CLEAR_PIXEL_EVENTS': () => {
            this.pixelEvents = [];
            this.requestFromInjected('CLEAR_PIXEL_EVENTS').catch(() => {});
            sendResponse({ success: true });
          },
          
          'INJECT_GTM': () => {
            this.injectGtm(msg.containerId).then(result => sendResponse(result));
            return true;
          },
          
          'NETWORK_TRACKER_DETECTED': () => {
            // Handle trackers detected via network requests (e.g., Google Ads via CCM endpoint)
            const { tracker, id } = msg;
            if (tracker && this.trackers[tracker]) {
              this.trackers[tracker].found = true;
              if (id) this.trackers[tracker].ids.add(id);
              this.debouncedSave();
            }
            sendResponse({ success: true });
          }
        };
        
        const handler = handlers[msg.type];
        if (handler) return handler();
        return true;
      },

      async injectGtm(containerId) {
        return this.requestFromInjected('EXECUTE', { 
          code: `(function() {
            if (document.querySelector('script[src*="${containerId}"]') || window.google_tag_manager?.['${containerId}']) {
              return { success: false, error: 'GTM already exists' };
            }
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtm.js?id=${containerId}';
            document.head.appendChild(s);
            return { success: true };
          })()`
        });
      }
    };

    TD.init();
    
    if (isExtensionValid()) {
      try { chrome.runtime.onMessage.addListener(TD.handleMessage.bind(TD)); }
      catch {}
    }
  }

  // ===== DECIDE WHICH SCRIPT TO RUN =====
  if (isMainFrame()) {
    runMainSiteScript();
  } else if (isShopifyPixelIframe()) {
    runShopifyPixelScript();
  }
})();
