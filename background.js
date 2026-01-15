/**
 * ============================================================================
 * INSIGHTER PRO - Background Service Worker
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

// ============================================
// INITIALIZE DEFAULT SETTINGS ON INSTALL
// ============================================
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['customPixelDataLayer', 'shopifyGtmPreview'], (result) => {
    const defaults = {};
    if (typeof result.customPixelDataLayer === 'undefined') {
      defaults.customPixelDataLayer = 1; // Enable by default
    }
    if (typeof result.shopifyGtmPreview === 'undefined') {
      defaults.shopifyGtmPreview = 1; // Enable by default
    }
    if (Object.keys(defaults).length > 0) {
      chrome.storage.sync.set(defaults);
    }
  });
});

// ============================================
// STORAGE - Use WeakRef-like cleanup pattern
// ============================================
const sstRequestsPerTab = new Map();
const pixelEventsPerTab = new Map();
const consentDataPerTab = new Map(); // Store gcs/gcd consent data per tab
const MAX_EVENTS_PER_TAB = 100;

// ============================================
// PLATFORM PATTERNS (Compiled once)
// ============================================
const PIXEL_PATTERNS = {
  meta: /facebook\.com\/tr|facebook\.net\/tr/i,
  tiktok: /analytics\.tiktok\.com|business-api\.tiktok\.com/i,
  snapchat: /tr\.snapchat\.com/i,
  pinterest: /ct\.pinterest\.com/i,
  reddit: /alb\.reddit\.com|reddit\.com\/rp/i,
  twitter: /ads-twitter\.com|t\.co\/i\/adsct/i,
  linkedin: /px\.ads\.linkedin\.com|snap\.licdn\.com/i,
  bing: /bat\.bing\.com/i,
  googleAds: /google\.com\/ccm\/collect|googleadservices\.com\/pagead\/conversion/i,
  gtm: /googletagmanager\.com\/gtm\.js|gtm\.start/i
};

const SST_PATTERNS = [
  /\.stape\.io\/g\/collect/i,
  /\.stape\.net\/g\/collect/i,
  /\.taggrs\.io\/g\/collect/i,
  /\.addingwell\.com\/g\/collect/i,
  /sst\.[^\/]+\/g\/collect/i,
  /sgtm\.[^\/]+\/g\/collect/i,
  /gtm\.[^\/]+\/g\/collect/i,
  /[^\/]+\/g\/collect/i
];

const GOOGLE_DOMAINS = new Set([
  'www.googletagmanager.com',
  'googletagmanager.com', 
  'www.google-analytics.com',
  'google-analytics.com',
  'analytics.google.com'
]);

const PLATFORM_NAMES = {
  meta: 'Meta Pixel',
  tiktok: 'TikTok Pixel',
  snapchat: 'Snapchat Pixel',
  pinterest: 'Pinterest Tag',
  reddit: 'Reddit Pixel',
  twitter: 'Twitter/X Pixel',
  linkedin: 'LinkedIn Insight',
  bing: 'Microsoft Ads',
  sst_ga4: 'Server-Side GA4',
  googleAds: 'Google Ads',
  gtm: 'Google Tag Manager'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const isSST = (url) => {
  try {
    const { hostname } = new URL(url);
    if (GOOGLE_DOMAINS.has(hostname)) return false;
    return SST_PATTERNS.some(p => p.test(url));
  } catch { return false; }
};

const parseUrlParams = (url) => {
  const params = {};
  try {
    const urlObj = new URL(url);
    for (const [key, value] of urlObj.searchParams) {
      try {
        params[key] = JSON.parse(decodeURIComponent(value));
      } catch {
        try { params[key] = decodeURIComponent(value); }
        catch { params[key] = value; }
      }
    }
  } catch {}
  return params;
};

const parsePostBody = (requestBody) => {
  const params = {};
  if (!requestBody) return params;
  
  if (requestBody.formData) {
    for (const [key, values] of Object.entries(requestBody.formData)) {
      try { params[key] = JSON.parse(values[0]); }
      catch { params[key] = values[0]; }
    }
  }
  
  if (requestBody.raw?.[0]?.bytes) {
    try {
      const bodyText = new TextDecoder('utf-8').decode(requestBody.raw[0].bytes);
      try {
        Object.assign(params, JSON.parse(bodyText));
      } catch {
        for (const pair of bodyText.split('&')) {
          const [key, value] = pair.split('=');
          if (key) {
            try { params[key] = JSON.parse(decodeURIComponent(value || '')); }
            catch { 
              try { params[key] = decodeURIComponent(value || ''); }
              catch { params[key] = value || ''; }
            }
          }
        }
      }
    } catch {}
  }
  
  return params;
};

const detectPlatform = (url) => {
  for (const [platform, pattern] of Object.entries(PIXEL_PATTERNS)) {
    if (pattern.test(url)) return platform;
  }
  return null;
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// PIXEL EVENT EXTRACTION
// ============================================
function extractPixelEvent(platform, url, urlParams, postParams) {
  const params = { ...urlParams, ...postParams };
  let eventName = null, pixelId = null, cleanParams = {};
  
  switch (platform) {
    case 'meta':
      eventName = params.ev;
      if (!eventName) return null;
      pixelId = params.id;
      cleanParams = { pixel_id: pixelId, event_id: params.eid };
      for (const [key, value] of Object.entries(params)) {
        if (key.startsWith('cd[') && key.endsWith(']')) {
          cleanParams[key.slice(3, -1)] = value;
        }
      }
      break;
      
    case 'tiktok':
      eventName = params.event || params.event_type || params.ev ||
                  params.properties?.event || params.data?.event ||
                  (Array.isArray(params.batch) && params.batch[0]?.event);
      if (!eventName) return null;
      pixelId = params.sdkid || params.pixel_code;
      cleanParams = {
        pixel_id: pixelId,
        content_type: params.content_type || params.properties?.content_type,
        contents: params.contents || params.properties?.contents,
        currency: params.currency || params.properties?.currency,
        value: params.value || params.properties?.value
      };
      break;
      
    case 'snapchat':
      if (url.includes('/config/')) return null;
      eventName = params.e || params.ev || params.event || params.event_name;
      if (params.u_sc) {
        try {
          const usc = typeof params.u_sc === 'string' ? JSON.parse(params.u_sc) : params.u_sc;
          if (usc.event) eventName = usc.event;
          Object.assign(cleanParams, usc);
        } catch {}
      }
      if (!eventName) return null;
      pixelId = params.pid || params.id;
      cleanParams = {
        ...cleanParams,
        pixel_id: pixelId,
        currency: params.cu || params.currency || cleanParams.currency,
        price: params.pr || params.price || cleanParams.price,
        item_ids: params.iids || cleanParams.item_ids,
        item_category: params.ic || cleanParams.item_category
      };
      break;
      
    case 'pinterest':
      eventName = params.event;
      if (!eventName) return null;
      pixelId = params.tid;
      cleanParams = { tag_id: pixelId };
      if (params.ed) {
        try {
          const ed = typeof params.ed === 'string' ? JSON.parse(params.ed) : params.ed;
          Object.assign(cleanParams, ed);
        } catch {}
      }
      break;
      
    case 'reddit':
      eventName = params.event || params.e;
      if (!eventName) return null;
      pixelId = params.id;
      cleanParams = { pixel_id: pixelId };
      for (const [key, value] of Object.entries(params)) {
        if (key.startsWith('m.') && value) {
          try { cleanParams[key.substring(2)] = JSON.parse(value); }
          catch { cleanParams[key.substring(2)] = value; }
        }
      }
      break;
      
    case 'twitter':
      eventName = params.events?.[0]?.event_name || params.txn_id ? 'Conversion' : 'PageView';
      pixelId = params.pid || params.id;
      cleanParams = {
        pixel_id: pixelId,
        txn_id: params.txn_id,
        value: params.value,
        currency: params.currency
      };
      break;
      
    case 'linkedin':
      eventName = params.conversionId ? 'Conversion' : 'PageView';
      pixelId = params.pid || params.partnerId;
      cleanParams = {
        partner_id: pixelId,
        conversion_id: params.conversionId,
        value: params.value,
        currency: params.currency
      };
      break;
      
    case 'bing':
      eventName = params.ea || params.ec || 'PageView';
      pixelId = params.ti;
      cleanParams = {
        tag_id: pixelId,
        event_action: params.ea,
        event_category: params.ec,
        event_label: params.el,
        event_value: params.ev,
        revenue: params.gv,
        currency: params.gc
      };
      break;
    
    case 'googleAds':
      // Google Ads via CCM endpoint: google.com/ccm/collect?tid=AW-XXXXXX&en=page_view
      eventName = params.en || params.event || 'conversion';
      pixelId = params.tid; // AW-XXXXXX
      cleanParams = {
        conversion_id: pixelId,
        event_name: eventName,
        page_location: params.dl,
        page_title: params.dt,
        gtm_container: params.gtm
      };
      break;
    
    case 'gtm':
      // GTM detected via network request
      eventName = params.event || 'gtm.load';
      pixelId = params.id;
      cleanParams = {
        container_id: pixelId
      };
      break;
      
    default:
      return null;
  }
  
  // Remove undefined/null values
  cleanParams = Object.fromEntries(
    Object.entries(cleanParams).filter(([_, v]) => v != null)
  );
  
  return { eventName, pixelId, cleanParams };
}

// ============================================
// SST EVENT FORMATTING
// ============================================
function formatSSTEvent(url, tabId) {
  const params = parseUrlParams(url);
  try {
    const { hostname } = new URL(url);
    return {
      id: `sst_${generateId()}`,
      platform: 'sst_ga4',
      platformName: 'Server-Side GA4',
      eventName: params.en || 'page_view',
      timestamp: Date.now(),
      isServerSide: true,
      sstHost: hostname,
      fullUrl: url,
      urlParams: params,
      params: {
        measurement_id: params.tid,
        event_name: params.en,
        client_id: params.cid,
        session_id: params.sid,
        page_location: params.dl,
        page_title: params.dt
      }
    };
  } catch { return null; }
}

// ============================================
// BADGE UPDATE FUNCTION WITH ANIMATION
// ============================================
const badgeAnimationState = new Map(); // Track animation state per tab
const lastBadgeCount = new Map(); // Track last badge count per tab

// Update badge with specific count (called from popup)
function updateBadgeWithCount(tabId, count, animate = true) {
  if (tabId < 0) return;
  
  const lastCount = lastBadgeCount.get(tabId) || 0;
  const shouldAnimate = animate && count > lastCount;
  lastBadgeCount.set(tabId, count);
  
  // Update badge text
  const badgeText = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
  
  chrome.action.setBadgeText({ text: badgeText, tabId });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF', tabId });
  
  // Animate badge if count increased
  if (count > 0 && shouldAnimate) {
    animateBadge(tabId);
  } else if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ color: '#7C3AED', tabId }); // Purple
  }
}

// Legacy function - updates badge based on network events (fallback)
function updateBadge(tabId, animate = true) {
  if (tabId < 0) return;
  
  // Count total detected events (pixels + SST)
  const pixelData = pixelEventsPerTab.get(tabId);
  const sstData = sstRequestsPerTab.get(tabId);
  
  const pixelCount = pixelData?.events?.length || 0;
  const sstCount = sstData?.length || 0;
  const totalCount = pixelCount + sstCount;
  
  // Update badge text
  const badgeText = totalCount > 0 ? (totalCount > 99 ? '99+' : String(totalCount)) : '';
  
  chrome.action.setBadgeText({ text: badgeText, tabId });
  
  // Set badge text color to white
  chrome.action.setBadgeTextColor({ color: '#FFFFFF', tabId });
  
  // Animate badge if new event detected
  if (totalCount > 0 && animate) {
    animateBadge(tabId);
  } else if (totalCount > 0) {
    // Just set the default color without animation
    chrome.action.setBadgeBackgroundColor({ color: '#7C3AED', tabId }); // Purple
  }
}

function animateBadge(tabId) {
  // Cancel any existing animation for this tab
  if (badgeAnimationState.has(tabId)) {
    clearTimeout(badgeAnimationState.get(tabId));
  }
  
  // Animation colors - pulse effect from bright to normal purple
  const colors = [
    '#A855F7', // Bright purple (start)
    '#9333EA', // Medium purple
    '#7C3AED', // Normal purple
    '#6D28D9', // Darker purple
    '#7C3AED', // Back to normal
    '#8B5CF6', // Slightly brighter
    '#7C3AED', // Final - normal purple
  ];
  
  let step = 0;
  
  function pulse() {
    if (step < colors.length) {
      chrome.action.setBadgeBackgroundColor({ color: colors[step], tabId });
      step++;
      const timeoutId = setTimeout(pulse, 80); // 80ms per step
      badgeAnimationState.set(tabId, timeoutId);
    } else {
      badgeAnimationState.delete(tabId);
    }
  }
  
  pulse();
}

// ============================================
// MAIN CAPTURE FUNCTION
// ============================================
function capturePixelEvent(details) {
  const { url, tabId, requestBody } = details;
  if (tabId < 0) return;
  
  const urlParams = parseUrlParams(url);
  const postParams = parsePostBody(requestBody);
  
  // Special handling for Google CCM endpoint - extract Google Ads ID
  if (url.includes('google.com/ccm/collect') || url.includes('googleadservices.com/pagead')) {
    // Extract Google Ads ID (AW-XXXXXX format)
    const adsId = urlParams.tid || urlParams.conversion_id;
    if (adsId && adsId.startsWith('AW-')) {
      if (!pixelEventsPerTab.has(tabId)) {
        pixelEventsPerTab.set(tabId, { events: [], seen: new Set() });
      }
      const tabData = pixelEventsPerTab.get(tabId);
      const dedupeKey = `googleAds:${adsId}:detected`;
      
      if (!tabData.seen.has(dedupeKey)) {
        tabData.seen.add(dedupeKey);
        tabData.events.unshift({
          id: generateId(),
          platform: 'googleAds',
          platformName: 'Google Ads',
          eventName: urlParams.en || 'page_view',
          timestamp: Date.now(),
          fullUrl: url,
          urlParams,
          params: { 
            conversion_id: adsId,
            event_name: urlParams.en,
            page_location: urlParams.dl,
            gtm_info: urlParams.gtm
          }
        });
      }
      
      // Notify content script about Google Ads detection
      try {
        chrome.tabs.sendMessage(tabId, {
          type: 'NETWORK_TRACKER_DETECTED',
          tracker: 'googleAds',
          id: adsId
        }).catch(() => {});
      } catch {}
    }
    
    // Also check for GTM container info in gtm parameter
    if (urlParams.gtm && urlParams.scrsrc?.includes('googletagmanager.com')) {
      try {
        chrome.tabs.sendMessage(tabId, {
          type: 'NETWORK_TRACKER_DETECTED',
          tracker: 'gtm',
          id: 'GTM (via network)',
          source: 'ccm_endpoint'
        }).catch(() => {});
      } catch {}
    }
    
    return;
  }
  
  const platform = detectPlatform(url);
  if (!platform) return;
  
  // Skip gtm platform from being captured as pixel events (it's tracked separately)
  if (platform === 'gtm') return;
  
  const result = extractPixelEvent(platform, url, urlParams, postParams);
  if (!result) return;
  
  const { eventName, pixelId, cleanParams } = result;
  
  if (!pixelEventsPerTab.has(tabId)) {
    pixelEventsPerTab.set(tabId, { events: [], seen: new Set() });
  }
  
  const tabData = pixelEventsPerTab.get(tabId);
  const dedupeKey = `${platform}:${pixelId || 'na'}:${eventName}`;
  
  if (tabData.seen.has(dedupeKey)) return;
  tabData.seen.add(dedupeKey);
  
  tabData.events.unshift({
    id: generateId(),
    platform,
    platformName: PLATFORM_NAMES[platform] || platform,
    eventName,
    timestamp: Date.now(),
    fullUrl: url,
    urlParams,
    params: { event_name: eventName, ...cleanParams }
  });
  
  if (tabData.events.length > MAX_EVENTS_PER_TAB) tabData.events.pop();
  
  // Note: Badge is updated by content.js/popup.js to show found platforms count
}

// ============================================
// NETWORK LISTENER
// ============================================
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId < 0) return;
    
    const url = details.url;
    
    // Capture Google Consent Mode (gcs/gcd) from ANY Google request that has these params
    // Always update with latest value for real-time consent changes
    if ((url.includes('google') || url.includes('doubleclick')) && 
        (url.includes('gcd=') || url.includes('gcs='))) {
      
      const gcsMatch = url.match(/[?&]gcs=([^&]+)/);
      const gcdMatch = url.match(/[?&]gcd=([^&]+)/);
      
      if (gcsMatch || gcdMatch) {
        // Always overwrite with latest values for instant updates
        consentDataPerTab.set(details.tabId, {
          gcs: gcsMatch ? gcsMatch[1] : null,
          gcd: gcdMatch ? gcdMatch[1] : null,
          timestamp: Date.now()
        });
      }
    }
    
    // SST Detection
    if (isSST(url)) {
      const event = formatSSTEvent(url, details.tabId);
      if (event) {
        if (!sstRequestsPerTab.has(details.tabId)) {
          sstRequestsPerTab.set(details.tabId, []);
        }
        const events = sstRequestsPerTab.get(details.tabId);
        events.unshift(event);
        if (events.length > MAX_EVENTS_PER_TAB) events.pop();
        
        // Note: Badge is updated by content.js/popup.js to show found platforms count
      }
    }
    
    // Pixel Detection
    capturePixelEvent(details);
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

// ============================================
// TAB CLEANUP
// ============================================
chrome.tabs.onRemoved.addListener((tabId) => {
  sstRequestsPerTab.delete(tabId);
  pixelEventsPerTab.delete(tabId);
  consentDataPerTab.delete(tabId);
  lastBadgeCount.delete(tabId);
  badgeAnimationState.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
    // Clear events and badge tracking on navigation
    sstRequestsPerTab.delete(tabId);
    pixelEventsPerTab.delete(tabId);
    consentDataPerTab.delete(tabId);
    lastBadgeCount.delete(tabId);
  }
  
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome')) {
    injectGtmIfNeeded(tabId, tab.url);
  }
});

// ============================================
// MESSAGE HANDLER
// ============================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handlers = {
    'UPDATE_BADGE': () => {
      const tabId = message.tabId || sender.tab?.id;
      const count = message.count || 0;
      if (tabId) {
        updateBadgeWithCount(tabId, count);
      }
      sendResponse({ success: true });
    },
    
    'TRACKER_UPDATE': () => {
      const tabId = sender.tab?.id;
      const count = message.foundCount || 0;
      if (tabId && count > 0) {
        updateBadgeWithCount(tabId, count);
      }
      sendResponse({ success: true });
    },
    
    'GET_SST_EVENTS': () => {
      const tabId = message.tabId || sender.tab?.id;
      sendResponse({ events: sstRequestsPerTab.get(tabId) || [] });
    },
    
    'GET_PIXEL_EVENTS': () => {
      const tabId = message.tabId || sender.tab?.id;
      const tabData = pixelEventsPerTab.get(tabId);
      sendResponse({ events: tabData?.events || [] });
    },
    
    'CLEAR_SST_EVENTS': () => {
      const tabId = message.tabId || sender.tab?.id;
      sstRequestsPerTab.delete(tabId);
      sendResponse({ success: true });
    },
    
    'CLEAR_PIXEL_EVENTS': () => {
      const tabId = message.tabId || sender.tab?.id;
      pixelEventsPerTab.delete(tabId);
      sendResponse({ success: true });
    },
    
    'GET_CONSENT_DATA': () => {
      const tabId = message.tabId || sender.tab?.id;
      const data = consentDataPerTab.get(tabId) || { gcs: null, gcd: null };
      sendResponse(data);
      return false;
    },
    
    'GET_ALL_COOKIES': () => {
      getAllCookiesForUrl(message.url).then(sendResponse);
      return true;
    },
    
    'DELETE_COOKIE': () => {
      deleteCookieByDomain(message.name, message.domain, message.url).then(sendResponse);
      return true;
    },
    
    'CLEAR_DOMAIN_COOKIES': () => {
      clearDomainCookies(message.domain, message.url).then(sendResponse);
      return true;
    },
    
    'GET_SHOPIFY_DATALAYER': () => {
      handleShopifyDataLayer(sendResponse);
      return true;
    },
    
    'GET_NORMAL_DATALAYER': () => {
      handleNormalDataLayer(message, sendResponse);
      return true;
    },
    
    // Shopify Custom Pixel - Patch dataLayer in iframe
    'patchShopifyDataLayer': () => {
      const tabId = sender.tab?.id;
      const frameId = sender.frameId;
      if (typeof tabId !== 'number' || typeof frameId !== 'number') return;
      
      chrome.scripting.executeScript({
        target: { tabId, frameIds: [frameId] },
        func: () => {
          // Guard against double-patching
          if (window.__INSIGHTER_DL_PATCHED__) return;
          window.__INSIGHTER_DL_PATCHED__ = true;
          
          // Define cleanUp function first
          function cleanUpDataLayerData(dataLayerData) {
            if (!Array.isArray(dataLayerData)) return [];
            try {
              return dataLayerData.map(data => {
                if (data === null || data === undefined) return null;
                if (Object.prototype.toString.call(data) === '[object Arguments]') {
                  return { isGtagData: true, data: Array.from(data) };
                }
                // Deep clone to avoid circular reference issues
                try {
                  return JSON.parse(JSON.stringify(data));
                } catch {
                  // If can't stringify, extract basic info
                  if (typeof data === 'object') {
                    return { event: data.event || 'unknown', _partial: true };
                  }
                  return data;
                }
              }).filter(Boolean);
            } catch (e) {
              console.error('[Insighter] cleanUpDataLayerData error:', e);
              return [];
            }
          }
          
          window.dataLayer = window.dataLayer || [];
          
          // Send existing dataLayer entries
          if (window.dataLayer.length) {
            try {
              const cleanedData = cleanUpDataLayerData(window.dataLayer);
              if (cleanedData.length) {
                window.top.postMessage({
                  action: 'INSIGHTER_DL_PUSH',
                  data: cleanedData,
                  source: 'shopify-custom-pixel'
                }, '*');
              }
            } catch (e) {
              console.error('[Insighter] Error sending existing dataLayer:', e);
            }
          }
          
          // Hook dataLayer.push
          const originalPush = window.dataLayer.push;
          window.dataLayer.push = function(...args) {
            try {
              const cleanedData = cleanUpDataLayerData(args);
              if (cleanedData.length) {
                window.top.postMessage({
                  action: 'INSIGHTER_DL_PUSH',
                  data: cleanedData,
                  source: 'shopify-custom-pixel'
                }, '*');
              }
            } catch (e) {
              console.error('[Insighter] Error forwarding dataLayer push:', e);
            }
            return originalPush.apply(this, args);
          };
          
          console.log('[Insighter] Shopify Custom Pixel dataLayer patched');
        },
        world: 'MAIN'
      }).catch(err => console.error('[Insighter] patchShopifyDataLayer error:', err));
      sendResponse({ success: true });
    },
    
    // Shopify Custom Pixel - Push events from iframe to main window dataLayer
    'shopifyPixelDataLayerPush': () => {
      const tabId = sender.tab?.id;
      const frameId = sender.frameId;
      if (typeof tabId !== 'number') return;
      
      console.log('[Insighter] shopifyPixelDataLayerPush received:', message.eventsData?.length, 'events');
      
      chrome.scripting.executeScript({
        target: { tabId, frameIds: [0] }, // Main frame
        func: (eventsData) => {
          console.log('[Insighter] Pushing Custom Pixel events to main dataLayer:', eventsData);
          window.dataLayer = window.dataLayer || [];
          eventsData.forEach(eventData => {
            if (eventData.isGtagData) {
              window.dataLayer.push(...eventData.data);
            } else if (
              eventData.event !== 'gtm.dom' &&
              eventData.event !== 'gtm.load' &&
              eventData.event !== 'gtm.js' &&
              eventData.event !== 'gtm.start'
            ) {
              // Mark as from Custom Pixel for debugging
              eventData._fromCustomPixel = true;
              window.dataLayer.push(eventData);
            }
          });
        },
        args: [message.eventsData],
        world: 'MAIN'
      }).catch(err => console.error('[Insighter] shopifyPixelDataLayerPush error:', err));
      sendResponse({ success: true });
    },
    
    'INJECT_GTM': async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (gtmId) => {
              if (document.querySelector(`script[src*="${gtmId}"]`) || window.google_tag_manager?.[gtmId]) {
                return 'already_exists';
              }
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
              const script = document.createElement('script');
              script.async = true;
              script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
              document.head.appendChild(script);
              return 'injected';
            },
            args: [message.gtmId],
            world: 'MAIN'
          });
        }
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    }
  };
  
  const handler = handlers[message.type];
  if (handler) {
    const result = handler();
    if (result === true) return true; // async
  }
  return false;
});

// ============================================
// COOKIE FUNCTIONS
// ============================================
async function getAllCookiesForUrl(url) {
  const result = {};
  try {
    const { hostname: mainDomain } = new URL(url);
    const cookies = await chrome.cookies.getAll({});
    
    for (const cookie of cookies) {
      const cookieDomain = cookie.domain.replace(/^\./, '');
      if (mainDomain.includes(cookieDomain) || cookieDomain.includes(mainDomain) ||
          cookie.domain === mainDomain || cookie.domain === `.${mainDomain}`) {
        if (!result[cookieDomain]) result[cookieDomain] = { cookies: [] };
        result[cookieDomain].cookies.push({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expirationDate,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite
        });
      }
    }
    
    // Sort by main domain first
    const sorted = {};
    const domains = Object.keys(result).sort((a, b) => {
      if (a === mainDomain) return -1;
      if (b === mainDomain) return 1;
      return a.localeCompare(b);
    });
    for (const d of domains) sorted[d] = result[d];
    
    // Return in expected format: { cookies: { domain: { cookies: [...] } } }
    return { cookies: sorted };
  } catch (e) {
    console.error('[Insighter Pro] Cookie error:', e);
    return { cookies: {} };
  }
}

async function deleteCookieByDomain(name, domain, pageUrl) {
  try {
    for (const protocol of ['https://', 'http://']) {
      const url = protocol + domain.replace(/^\./, '') + '/';
      await chrome.cookies.remove({ url, name });
    }
    return true;
  } catch { return false; }
}

async function clearDomainCookies(domain, pageUrl) {
  try {
    const cookies = await chrome.cookies.getAll({ domain });
    let deleted = 0;
    for (const cookie of cookies) {
      try {
        const protocol = cookie.secure ? 'https://' : 'http://';
        const cookieDomain = cookie.domain.replace(/^\./, '');
        await chrome.cookies.remove({ url: `${protocol}${cookieDomain}${cookie.path}`, name: cookie.name });
        deleted++;
      } catch {}
    }
    return deleted;
  } catch { return 0; }
}

// ============================================
// GTM INJECTION
// ============================================
async function injectGtmIfNeeded(tabId, url) {
  try {
    const { gtmSites = [] } = await chrome.storage.local.get(['gtmSites']);
    if (!gtmSites.length) return;
    
    const { hostname } = new URL(url);
    const match = gtmSites.find(site => {
      try {
        const siteHost = new URL(site.url.startsWith('http') ? site.url : 'https://' + site.url).hostname;
        return hostname === siteHost || hostname.endsWith('.' + siteHost);
      } catch {
        const siteHost = site.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        return hostname === siteHost || hostname.endsWith('.' + siteHost);
      }
    });
    
    if (match?.enabled !== false && match?.containerId) {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (gtmId) => {
          if (document.querySelector(`script[src*="${gtmId}"]`) || window.google_tag_manager?.[gtmId]) return;
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
          const s = document.createElement('script');
          s.async = true;
          s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
          document.head.appendChild(s);
        },
        args: [match.containerId],
        world: 'MAIN'
      });
    }
  } catch {}
}

// ============================================
// SHOPIFY DATALAYER HANDLERS
// ============================================
async function handleShopifyDataLayer(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return sendResponse(null);
    
    const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    const shopifyFrames = frames.filter(f => f.url.includes('/custom/web-pixel-') && f.frameType === 'sub_frame');
    
    if (!shopifyFrames.length) return sendResponse(null);
    
    const results = await Promise.all(shopifyFrames.map(frame => 
      new Promise(resolve => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id, frameIds: [frame.frameId] },
          func: () => {
            try {
              const gtmScripts = Array.from(document.scripts)
                .filter(s => s.textContent.includes('/gtm.js?id=') && s.textContent.match(/GTM-[A-Z0-9]+/));
              return {
                containerIds: gtmScripts.map(s => s.textContent.match(/GTM-[A-Z0-9]+/)?.[0]).filter(Boolean),
                dataLayer: window.dataLayer || null
              };
            } catch { return { containerIds: [], dataLayer: null }; }
          },
          world: 'MAIN'
        }, r => resolve(r?.[0]?.result));
      })
    ));
    
    sendResponse(results.filter(Boolean));
  } catch { sendResponse(null); }
}

async function handleNormalDataLayer(request, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url?.startsWith('http')) return sendResponse(null);
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (customPixelDataLayer) => {
        if ((window.Shopify || window.ShopifyAnalytics) && customPixelDataLayer) return null;
        if (!window.dataLayer) return null;
        
        const gtmIds = Array.from(document.scripts).reduce((ids, s) => {
          if (s.textContent.includes('/gtm.js?id=')) {
            const match = s.textContent.match(/['"]?(GTM-[A-Z0-9]+)['"]?/);
            if (match && !ids.includes(match[1])) ids.push(match[1]);
          }
          return ids;
        }, []);
        
        return [{ containerIds: gtmIds, dataLayer: window.dataLayer }];
      },
      args: [request.customPixelDataLayer],
      world: 'MAIN'
    }, results => sendResponse(results?.[0]?.result || null));
  } catch { sendResponse(null); }
}

console.log('[Insighter Pro] v4.2.0 loaded - Real-time GCS consent detection');
