/**
 * ============================================================================
 * INSIGHTER PRO - Inject Script
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
  if (window.__INSIGHTER_INJECT__) return;
  window.__INSIGHTER_INJECT__ = true;

  const TD = {
    dlIndex: 0,
    dlHistory: [],
    pixelEvents: [],
    _lastCapture: null,
    
    init() {
      this.hookDataLayer();
      this.hookAllPixels();
      this.captureExisting();
      this.listen();
      
      // Re-hook for late-loading pixels
      [500, 2000, 5000].forEach(t => setTimeout(() => this.hookAllPixels(), t));
    },

    // ===== DATALAYER =====
    hookDataLayer() {
      window.dataLayer = window.dataLayer || [];
      const orig = window.dataLayer.push;
      
      window.dataLayer.push = (...args) => {
        const result = orig.apply(window.dataLayer, args);
        args.forEach(item => this.captureDL(item));
        return result;
      };
    },

    // Extract event name from various dataLayer formats
    extractEventName(item) {
      // Plain object with event property
      if (item.event) return item.event;
      
      // Arguments/Array from gtag() calls: ['event', 'page_view', {...}]
      if (item[0] === 'event' && item[1]) return item[1];
      
      // gtag config: ['config', 'G-XXXXX', {...}]
      if (item[0] === 'config') return `config:${item[1] || ''}`;
      
      // gtag set: ['set', 'user_properties', {...}]
      if (item[0] === 'set') return `set:${item[1] || ''}`;
      
      // gtag consent: ['consent', 'default', {...}]
      if (item[0] === 'consent') return `consent:${item[1] || ''}`;
      
      // gtag js: ['js', Date]
      if (item[0] === 'js') return 'gtag:init';
      
      return null;
    },

    captureDL(item) {
      if (!item || typeof item !== 'object' || this.isGtmInternalData(item)) return;
      
      // Filter out our own injected events to prevent loops
      if (item.source === 'TD_INJECT' || item.source === 'TD_CONTENT') return;
      if (item.event === 'postMessage') return;
      if (item.type === 'DL_PUSH' || item.type === 'DL_INIT' || item.type === 'PIXEL_EVENT') return;
      if (item.origin && item.data && (item.data.source === 'TD_INJECT' || item.data.type === 'DL_PUSH')) return;
      // Filter if item contains our internal markers
      if (item.entry && item.entry.source === 'TD_INJECT') return;
      
      const eventName = this.extractEventName(item);
      
      this.dlIndex++;
      const entry = {
        index: this.dlIndex,
        timestamp: Date.now(),
        event: eventName,
        type: this.getDLType(item, eventName),
        data: this.clone(item)
      };
      this.dlHistory.push(entry);
      this.send('DL_PUSH', { entry });
    },

    isGtmInternalData(item) {
      const keys = Object.keys(item);
      if (keys.length === 1 && keys[0] === 'gtm.uniqueEventId') return true;
      if (item['gtm.uniqueEventId'] && !item.event && !item[0] && keys.length <= 2) return true;
      
      // Filter our own extension events to prevent loops
      if (item.source === 'TD_INJECT' || item.source === 'TD_CONTENT') return true;
      if (item.type === 'DL_PUSH' || item.type === 'DL_INIT') return true;
      
      // Filter postMessage events that contain our data
      const eventName = item.event || (item[0] === 'event' && item[1]);
      if (eventName === 'postMessage') return true;
      
      // Filter Tag Assistant internal events (connection badge pings, etc.)
      // These events are pushed by GTM Tag Assistant debugging mode
      if (eventName && typeof eventName === 'string') {
        // Filter connection__* events (Tag Assistant internal)
        if (eventName.startsWith('connection__')) return true;
        // Filter other known Tag Assistant internal events
        if (eventName.startsWith('tag_assistant__')) return true;
        if (eventName.startsWith('debug__')) return true;
        // Filter worker/auth internal events
        if (eventName.startsWith('worker__')) return true;
        if (eventName.startsWith('auth')) return true;
        if (eventName.startsWith('load_source__')) return true;
        // Filter consent internal events (not user consent changes)
        if (eventName === 'consent__default') return true;
        if (eventName === 'consent__update' && !item.consent_update) return true;
      }
      
      return false;
    },

    captureExisting() {
      window.dataLayer?.forEach?.(item => {
        if (item && typeof item === 'object' && !this.isGtmInternalData(item)) {
          const eventName = this.extractEventName(item);
          this.dlIndex++;
          this.dlHistory.push({
            index: this.dlIndex,
            timestamp: Date.now(),
            event: eventName,
            type: this.getDLType(item, eventName),
            data: this.clone(item)
          });
        }
      });
      setTimeout(() => this.send('DL_INIT', { entries: this.dlHistory }), 100);
    },

    getDLType(item, eventName = null) {
      const e = eventName || item?.event || (item[0] === 'event' ? item[1] : null);
      if (!e) return 'data';
      if (typeof e === 'string') {
        if (e.startsWith('gtm.')) return 'gtm';
        if (e.startsWith('config:') || e.startsWith('set:') || e.startsWith('consent:') || e === 'gtag:init') return 'gtag';
        if (['purchase','add_to_cart','view_item','begin_checkout','view_item_list','select_item','add_payment_info','add_shipping_info','remove_from_cart','view_cart','add_to_wishlist','generate_lead'].includes(e)) return 'ecommerce';
      }
      return 'custom';
    },

    // ===== PIXEL HOOKING =====
    hookAllPixels() {
      this.hookFacebook();
      this.hookGtag();
      this.hookTikTok();
      this.hookLinkedIn();
      this.hookPinterest();
      this.hookTwitter();
      this.hookSnapchat();
      this.hookReddit();
      this.hookBing();
    },

    hookFacebook() {
      if (!window.fbq || window.fbq._td) return;
      const orig = window.fbq;
      
      orig.queue?.forEach(args => {
        if (['track', 'trackCustom', 'trackSingle', 'trackSingleCustom'].includes(args[0])) {
          this.capturePixel('facebook', 'Meta Pixel', args[0], args[1], args[2]);
        }
      });
      
      window.fbq = (...args) => {
        if (['track', 'trackCustom', 'trackSingle', 'trackSingleCustom'].includes(args[0])) {
          this.capturePixel('facebook', 'Meta Pixel', args[0], args[1], args[2]);
        }
        return orig.apply(window, args);
      };
      Object.keys(orig).forEach(k => { try { window.fbq[k] = orig[k]; } catch {} });
      window.fbq._td = true;
    },

    hookGtag() {
      if (!window.gtag || window.gtag._td) return;
      const orig = window.gtag;
      
      window.gtag = (...args) => {
        if (args[0] === 'event') {
          const sendTo = args[2]?.send_to || '';
          const platform = sendTo.includes('AW-') ? 'googleAds' : 'ga4';
          this.capturePixel(platform, platform === 'googleAds' ? 'Google Ads' : 'Google Analytics 4', 'event', args[1], args[2]);
        }
        return orig.apply(window, args);
      };
      window.gtag._td = true;
    },

    hookTikTok() {
      if (!window.ttq) return;
      
      if (window.ttq.track && !window.ttq.track._td) {
        const orig = window.ttq.track;
        window.ttq.track = (...args) => {
          this.capturePixel('tiktok', 'TikTok Pixel', 'track', args[0], args[1]);
          return orig.apply(window.ttq, args);
        };
        window.ttq.track._td = true;
      }
      
      if (window.ttq.page && !window.ttq.page._td) {
        const orig = window.ttq.page;
        window.ttq.page = (...args) => {
          this.capturePixel('tiktok', 'TikTok Pixel', 'page', 'PageView', {});
          return orig.apply(window.ttq, args);
        };
        window.ttq.page._td = true;
      }
      
      if (window.ttq.identify && !window.ttq.identify._td) {
        const orig = window.ttq.identify;
        window.ttq.identify = (...args) => {
          this.capturePixel('tiktok', 'TikTok Pixel', 'identify', 'Identify', args[0]);
          return orig.apply(window.ttq, args);
        };
        window.ttq.identify._td = true;
      }
    },

    hookLinkedIn() {
      if (!window.lintrk || window.lintrk._td) return;
      const orig = window.lintrk;
      
      window.lintrk = (...args) => {
        if (args[0] === 'track') {
          this.capturePixel('linkedin', 'LinkedIn Insight', 'track', args[1]?.conversion_id ? 'Conversion' : 'Event', args[1]);
        }
        return orig.apply(window, args);
      };
      window.lintrk._td = true;
    },

    hookPinterest() {
      if (!window.pintrk || window.pintrk._td) return;
      const orig = window.pintrk;
      
      orig.queue?.forEach(args => {
        if (args[0] === 'track') this.capturePixel('pinterest', 'Pinterest Tag', 'track', args[1], args[2]);
        else if (args[0] === 'page') this.capturePixel('pinterest', 'Pinterest Tag', 'page', 'PageVisit', {});
      });
      
      window.pintrk = (...args) => {
        if (args[0] === 'track') this.capturePixel('pinterest', 'Pinterest Tag', 'track', args[1], args[2]);
        else if (args[0] === 'page') this.capturePixel('pinterest', 'Pinterest Tag', 'page', 'PageVisit', {});
        return orig.apply(window, args);
      };
      Object.keys(orig).forEach(k => { try { window.pintrk[k] = orig[k]; } catch {} });
      window.pintrk._td = true;
    },

    hookTwitter() {
      if (!window.twq || window.twq._td) return;
      const orig = window.twq;
      
      orig.queue?.forEach(args => {
        if (['track', 'event'].includes(args[0])) this.capturePixel('twitter', 'Twitter/X Pixel', args[0], args[1], args[2]);
      });
      
      window.twq = (...args) => {
        if (['track', 'event'].includes(args[0])) this.capturePixel('twitter', 'Twitter/X Pixel', args[0], args[1], args[2]);
        return orig.apply(window, args);
      };
      Object.keys(orig).forEach(k => { try { window.twq[k] = orig[k]; } catch {} });
      window.twq._td = true;
    },

    hookSnapchat() {
      if (!window.snaptr || window.snaptr._td) return;
      const orig = window.snaptr;
      
      orig.queue?.forEach(args => {
        if (args[0] === 'track') this.capturePixel('snapchat', 'Snapchat Pixel', 'track', args[1], args[2]);
      });
      
      window.snaptr = (...args) => {
        if (args[0] === 'track') this.capturePixel('snapchat', 'Snapchat Pixel', 'track', args[1], args[2]);
        return orig.apply(window, args);
      };
      Object.keys(orig).forEach(k => { try { window.snaptr[k] = orig[k]; } catch {} });
      window.snaptr._td = true;
    },

    hookReddit() {
      if (!window.rdt || window.rdt._td) return;
      const orig = window.rdt;
      
      orig.queue?.forEach(args => {
        if (args[0] === 'track') this.capturePixel('reddit', 'Reddit Pixel', 'track', args[1], args[2]);
      });
      
      window.rdt = (...args) => {
        if (args[0] === 'track') this.capturePixel('reddit', 'Reddit Pixel', 'track', args[1], args[2]);
        return orig.apply(window, args);
      };
      Object.keys(orig).forEach(k => { try { window.rdt[k] = orig[k]; } catch {} });
      window.rdt._td = true;
    },

    hookBing() {
      if (!window.uetq || window.uetq._td) return;
      const orig = window.uetq.push;
      
      window.uetq.push = (...args) => {
        args.forEach(arg => {
          if (arg && typeof arg === 'object') {
            this.capturePixel('bing', 'Microsoft Ads', arg.ea ? 'event' : 'pageview', arg.ea || arg.ec || 'PageView', arg);
          }
        });
        return orig.apply(window.uetq, args);
      };
      window.uetq._td = true;
    },

    capturePixel(platform, platformName, action, event, params) {
      const key = `${platform}:${event}:${Math.floor(Date.now() / 500)}`;
      if (this._lastCapture === key) return;
      this._lastCapture = key;
      
      const entry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform,
        platformName,
        action,
        event: event || 'Unknown',
        params: this.clone(params || {}),
        timestamp: Date.now()
      };
      
      this.pixelEvents.push(entry);
      if (this.pixelEvents.length > 100) this.pixelEvents.shift();
      this.send('PIXEL_EVENT', { event: entry });
    },

    // ===== PIXEL IDS =====
    getPixelIds() {
      const ids = {};
      
      try {
        if (window.fbq) {
          ids.facebook = [];
          const state = window.fbq.getState?.();
          state?.pixels?.forEach(p => p.id && ids.facebook.push(String(p.id)));
          window.fbq.queue?.forEach(args => {
            if (args[0] === 'init' && args[1]) ids.facebook.push(String(args[1]));
          });
          ids.facebook = [...new Set(ids.facebook)];
        }
        
        if (window._linkedin_data_partner_ids) ids.linkedin = window._linkedin_data_partner_ids.map(String);
        else if (window._linkedin_partner_id) ids.linkedin = [String(window._linkedin_partner_id)];
        
        if (window.ttq?._i) ids.tiktok = Object.keys(window.ttq._i).filter(k => k !== 'undefined');
        
        if (window.pintrk?.queue) {
          ids.pinterest = [];
          window.pintrk.queue.forEach(a => a[0] === 'load' && a[1] && ids.pinterest.push(String(a[1])));
        }
        
        if (window.twq?.queue) {
          ids.twitter = [];
          window.twq.queue.forEach(a => ['init','config'].includes(a[0]) && a[1] && ids.twitter.push(String(a[1])));
        }
        
        if (window.snaptr?.queue) {
          ids.snapchat = [];
          window.snaptr.queue.forEach(a => a[0] === 'init' && a[1] && ids.snapchat.push(String(a[1])));
        }
        
        if (window.rdt?.queue) {
          ids.reddit = [];
          window.rdt.queue.forEach(a => a[0] === 'init' && a[1] && ids.reddit.push(String(a[1])));
        }
        
        if (window.UET?.instances) {
          ids.bing = [];
          Object.values(window.UET.instances).forEach(i => i.ti && ids.bing.push(String(i.ti)));
        }
      } catch {}
      
      return ids;
    },

    // ===== STORAGE =====
    getStorage(type) {
      const s = type === 'local' ? localStorage : sessionStorage;
      const d = {};
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        try { 
          const v = s.getItem(k);
          d[k] = { value: v, type: this.detectType(v), size: (k.length + (v?.length || 0)) * 2 }; 
        } catch {}
      }
      return d;
    },

    setStorage(type, key, value) {
      try { (type === 'local' ? localStorage : sessionStorage).setItem(key, value); return true; }
      catch { return false; }
    },

    removeStorage(type, key) {
      try { (type === 'local' ? localStorage : sessionStorage).removeItem(key); return true; }
      catch { return false; }
    },

    clearStorage(type) {
      try { (type === 'local' ? localStorage : sessionStorage).clear(); return true; }
      catch { return false; }
    },

    detectType(v) {
      try { JSON.parse(v); return 'json'; } 
      catch {
        if (!isNaN(v)) return 'number';
        if (v === 'true' || v === 'false') return 'boolean';
        return 'string';
      }
    },

    getCookies() {
      const c = {};
      document.cookie.split(';').forEach(x => {
        const [n, ...r] = x.trim().split('=');
        if (n) c[n] = { value: r.join('='), type: 'cookie', expires: 'Session' };
      });
      return c;
    },

    setCookie(name, value, days = 365) {
      const d = new Date(); 
      d.setTime(d.getTime() + days * 86400000);
      document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
      return true;
    },

    deleteCookie(name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      return true;
    },

    // ===== PAGE ANALYSIS =====
    analyzePage() {
      const a = { forms: [], buttons: [], links: [], videos: [] };
      
      document.querySelectorAll('form').forEach(f => {
        a.forms.push({
          id: f.id, name: f.name, action: f.action, method: f.method,
          inputs: f.querySelectorAll('input,select,textarea').length,
          selector: this.getSelector(f)
        });
      });
      
      let btnCount = 0;
      document.querySelectorAll('button, input[type="submit"], [role="button"]').forEach(b => {
        if (btnCount++ < 15) a.buttons.push({
          text: (b.textContent?.trim() || b.value || '').slice(0, 50),
          selector: this.getSelector(b)
        });
      });
      
      document.querySelectorAll('a[href]').forEach(l => {
        const h = l.href || '';
        if (h.includes('tel:') || h.includes('mailto:') || l.target === '_blank') {
          a.links.push({
            text: (l.textContent?.trim() || '').slice(0, 50),
            href: h.slice(0, 100),
            type: h.includes('tel:') ? 'phone' : h.includes('mailto:') ? 'email' : 'outbound',
            selector: this.getSelector(l)
          });
        }
      });
      
      document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').forEach(v => {
        a.videos.push({ type: v.tagName.toLowerCase(), src: v.src || '', selector: this.getSelector(v) });
      });
      
      return a;
    },

    getSelector(el) {
      if (el.id) return `#${el.id}`;
      const path = [];
      while (el && el.nodeType === 1 && path.length < 4) {
        let s = el.tagName.toLowerCase();
        if (el.id) { path.unshift(`#${el.id}`); break; }
        if (el.className) {
          const c = String(el.className).split(/\s+/).filter(x => x && !/^(ng-|js-|is-)/.test(x)).slice(0, 2);
          if (c.length) s += '.' + c.join('.');
        }
        path.unshift(s);
        el = el.parentNode;
      }
      return path.join(' > ');
    },

    // ===== UTILS =====
    clone(obj) {
      try {
        return JSON.parse(JSON.stringify(obj, (k, v) => {
          if (typeof v === 'function') return '[Function]';
          if (v instanceof HTMLElement) return '[HTMLElement]';
          if (v === window) return '[Window]';
          return v;
        }));
      } catch { return { _error: 'serialize failed' }; }
    },

    send(type, data) {
      window.postMessage({ source: 'TD_INJECT', type, ...data }, '*');
    },

    execute(code) {
      try { return { success: true, result: this.clone(eval(code)) }; }
      catch (e) { return { success: false, error: e.message }; }
    },

    pushDL(data) {
      try { 
        window.dataLayer = window.dataLayer || []; 
        window.dataLayer.push(data); 
        return { success: true }; 
      }
      catch (e) { return { success: false, error: e.message }; }
    },

    listen() {
      window.addEventListener('message', e => {
        if (e.source !== window || e.data?.source !== 'TD_CONTENT') return;
        const { cmd, payload, id } = e.data;
        let r;
        
        switch (cmd) {
          case 'GET_ALL': r = { dlHistory: this.dlHistory, pixelEvents: this.pixelEvents, pixelIds: this.getPixelIds() }; break;
          case 'GET_PIXEL_EVENTS': r = this.pixelEvents; break;
          case 'CLEAR_PIXEL_EVENTS': this.pixelEvents = []; r = { success: true }; break;
          case 'GET_STORAGE': r = this.getStorage(payload.type); break;
          case 'SET_STORAGE': r = this.setStorage(payload.type, payload.key, payload.value); break;
          case 'REMOVE_STORAGE': r = this.removeStorage(payload.type, payload.key); break;
          case 'CLEAR_STORAGE': r = this.clearStorage(payload.type); break;
          case 'GET_COOKIES': r = this.getCookies(); break;
          case 'SET_COOKIE': r = this.setCookie(payload.name, payload.value, payload.days); break;
          case 'DELETE_COOKIE': r = this.deleteCookie(payload.name); break;
          case 'ANALYZE_PAGE': r = this.analyzePage(); break;
          case 'EXECUTE': r = this.execute(payload.code); break;
          case 'DL_PUSH': r = this.pushDL(payload.data); break;
          case 'GET_PIXEL_IDS': r = this.getPixelIds(); break;
        }
        
        this.send('RESPONSE', { id, result: r });
      });
    }
  };

  TD.init();
})();
