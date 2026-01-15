/**
 * ============================================================================
 * INSIGHTER PRO - Marketing & Analytics Debugging Tool
 * ============================================================================
 * 
 * @copyright 2024-2026 Atiqul Islam & Abdul Kader Shimul. All Rights Reserved.
 * @author    Atiqul Islam <https://linkedin.com/in/insighteratiqul>
 * @version   4.3.0
 * @license   Proprietary - See LICENSE file
 * 
 * ============================================================================
 * COPYRIGHT NOTICE
 * ============================================================================
 * 
 * This software is the intellectual property of Atiqul Islam.
 * 
 * UNAUTHORIZED COPYING, MODIFICATION, DISTRIBUTION, OR USE OF THIS SOFTWARE,
 * VIA ANY MEDIUM, IS STRICTLY PROHIBITED WITHOUT EXPRESS WRITTEN PERMISSION
 * FROM THE COPYRIGHT HOLDER.
 * 
 * This software was developed through a collaborative partnership between
 * Atiqul Islam (Creator & Lead Developer) and Claude AI (Anthropic).
 * 
 * For licensing inquiries, please contact:
 * - LinkedIn: https://linkedin.com/in/insighteratiqul
 * - GitHub: https://github.com/AtiqulIslamRony
 * 
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 * 1. CONFIGURATION & CONSTANTS
 *    - TRACKERS: Supported tracking platforms
 *    - EVENT_TEMPLATES: Pre-built dataLayer events
 *    - TECH_DATABASE: Technology detection patterns
 * 
 * 2. MAIN APPLICATION CLASS (InsighterApp)
 *    - Initialization & Event Binding
 *    - Tab Navigation
 *    - Data Loading
 * 
 * 3. FEATURE MODULES:
 *    - Pixels Tab: Tracker detection & display
 *    - Data Layer Tab: dataLayer inspection & manipulation
 *    - Storage Tab: localStorage, sessionStorage, cookies
 *    - Tech Stack Tab: Technology detection (Wappalyzer-like)
 *    - QA Tab: Quick checks (UTM, conversions, consent)
 *    - Tools Tab: GTM injector, console, Shopify support
 * 
 * 4. UTILITY FUNCTIONS
 *    - HTML escaping, formatting, clipboard operations
 * ============================================================================
 */
// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
/**
 * Supported tracking platforms with display metadata
 */
const TRACKERS = {
  gtm: { name: 'Google Tag Manager', short: 'GTM', icon: 'gtm' },
  ga4: { name: 'Google Analytics 4', short: 'GA4', icon: 'ga4' },
  facebookPixel: { name: 'Meta Pixel', short: 'META', icon: 'fb' },
  googleAds: { name: 'Google Ads', short: 'GADS', icon: 'gads' },
  linkedin: { name: 'LinkedIn Insight', short: 'LI', icon: 'linkedin' },
  bingAds: { name: 'Microsoft Ads', short: 'BING', icon: 'bing' },
  tiktok: { name: 'TikTok Pixel', short: 'TT', icon: 'tiktok' },
  pinterest: { name: 'Pinterest Tag', short: 'PIN', icon: 'pinterest' },
  twitter: { name: 'Twitter/X Pixel', short: 'X', icon: 'twitter' },
  snapchat: { name: 'Snapchat Pixel', short: 'SNAP', icon: 'snapchat' },
  reddit: { name: 'Reddit Pixel', short: 'RED', icon: 'reddit' }
};
/**
 * Pre-built dataLayer event templates for quick testing
 */
const EVENT_TEMPLATES = {
  page_view: { event: 'page_view', page_title: document.title, page_location: window.location.href },
  purchase: { event: 'purchase', transaction_id: 'T_12345', value: 99.99, currency: 'USD', items: [{ item_id: 'SKU_123', item_name: 'Product', price: 99.99, quantity: 1 }] },
  lead: { event: 'generate_lead', currency: 'USD', value: 50 },
  custom: { event: 'custom_event', custom_param: 'value' }
};
/**
 * Technology detection database with patterns and version matching
 */
const TECH_DATABASE = {
  cms: {
    name: 'CMS',
    icon: '📄',
    technologies: {
      wordpress: { 
        name: 'WordPress', 
        patterns: [/wp-content|wp-includes/i, /wordpress/i],
        versionPatterns: [/WordPress\s*(\d+\.\d+(?:\.\d+)?)/i, /ver=(\d+\.\d+(?:\.\d+)?)/],
        icon: 'cms', 
        website: 'https://wordpress.org' 
      },
      drupal: { 
        name: 'Drupal', 
        patterns: [/Drupal|sites\/all\/|sites\/default\//i],
        versionPatterns: [/Drupal\s*(\d+)/i],
        icon: 'cms', 
        website: 'https://drupal.org' 
      },
      shopify: { 
        name: 'Shopify', 
        patterns: [/cdn\.shopify\.com|Shopify\.theme|myshopify\.com/i],
        icon: 'ecommerce', 
        website: 'https://shopify.com' 
      },
      wix: { 
        name: 'Wix', 
        patterns: [/static\.wixstatic\.com|wix-code-|parastorage\.com/i],
        icon: 'cms', 
        website: 'https://wix.com' 
      },
      squarespace: { 
        name: 'Squarespace', 
        patterns: [/static\.squarespace\.com|squarespace-cdn/i],
        icon: 'cms', 
        website: 'https://squarespace.com' 
      },
      webflow: { 
        name: 'Webflow', 
        patterns: [/assets\.website-files\.com|uploads-ssl\.webflow\.com|webflow\.js|w-webflow-badge|Webflow\.push/i],
        icon: 'cms', 
        website: 'https://webflow.com' 
      },
      ghost: { 
        name: 'Ghost', 
        patterns: [/ghost-\d+\.\d+|ghost\.org\/ghost|content\/themes\/casper|ghost\.io\/ghost/i],
        icon: 'cms', 
        website: 'https://ghost.org' 
      },
      contentful: { 
        name: 'Contentful', 
        patterns: [/contentful\.com|ctfassets\.net/i],
        icon: 'cms', 
        website: 'https://contentful.com' 
      },
      hubspot: { 
        name: 'HubSpot CMS', 
        patterns: [/hs-scripts\.com|hubspot\.com|hscollectedforms/i],
        icon: 'cms', 
        website: 'https://hubspot.com' 
      },
      magento: { 
        name: 'Magento', 
        patterns: [/Magento_Ui|Magento_Customer|mage\/cookies|mage\/requirejs|requirejs\/require\.js.*Magento|skin\/frontend\/|\/mage\/|Mage\.Cookies/i],
        versionPatterns: [/Magento\/(\d+\.\d+)/i],
        icon: 'ecommerce', 
        website: 'https://magento.com' 
      },
      bigcommerce: { 
        name: 'BigCommerce', 
        patterns: [/bigcommerce\.com|cdn11\.bigcommerce/i],
        icon: 'ecommerce', 
        website: 'https://bigcommerce.com' 
      }
    }
  },
  framework: {
    name: 'JavaScript Frameworks',
    icon: '⚛️',
    technologies: {
      react: { 
        name: 'React', 
        patterns: [/_reactRootContainer|__REACT|data-reactroot|react-dom/i],
        versionPatterns: [/react[\/\.\-@](\d+\.\d+\.\d+)/i, /React v(\d+\.\d+\.\d+)/],
        icon: 'framework', 
        website: 'https://react.dev' 
      },
      vue: { 
        name: 'Vue.js', 
        patterns: [/__VUE__|vue\.runtime|data-v-[a-f0-9]{8}/i],
        versionPatterns: [/vue[\/\.\-@](\d+\.\d+\.\d+)/i, /Vue\.version.*?(\d+\.\d+\.\d+)/],
        icon: 'framework', 
        website: 'https://vuejs.org' 
      },
      angular: { 
        name: 'Angular', 
        patterns: [/ng-version|ng-app|\[ng-|_ngcontent/i],
        versionPatterns: [/ng-version="(\d+\.\d+\.\d+)"/i, /angular[\/\.\-@](\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://angular.io' 
      },
      svelte: { 
        name: 'Svelte', 
        patterns: [/svelte-[a-z0-9]+|__svelte/i],
        icon: 'framework', 
        website: 'https://svelte.dev' 
      },
      nextjs: { 
        name: 'Next.js', 
        patterns: [/__NEXT_DATA__|_next\/static/i],
        versionPatterns: [/Next\.js\s+(\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://nextjs.org' 
      },
      nuxt: { 
        name: 'Nuxt', 
        patterns: [/__NUXT__|_nuxt\//i],
        icon: 'framework', 
        website: 'https://nuxt.com' 
      },
      gatsby: { 
        name: 'Gatsby', 
        patterns: [/gatsby-|___gatsby/i],
        icon: 'framework', 
        website: 'https://gatsbyjs.com' 
      },
      remix: { 
        name: 'Remix', 
        patterns: [/__remixContext|remix\.run/i],
        icon: 'framework', 
        website: 'https://remix.run' 
      },
      astro: { 
        name: 'Astro', 
        patterns: [/astro-[a-z0-9]+|data-astro/i],
        icon: 'framework', 
        website: 'https://astro.build' 
      },
      htmx: { 
        name: 'htmx', 
        patterns: [/htmx\.org|hx-get|hx-post|hx-trigger/i],
        versionPatterns: [/htmx\.org@(\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://htmx.org' 
      },
      alpinejs: { 
        name: 'Alpine.js', 
        patterns: [/x-data\s*=|x-show|alpinejs/i],
        icon: 'framework', 
        website: 'https://alpinejs.dev' 
      }
    }
  },
  js: {
    name: 'JavaScript Libraries',
    icon: '📦',
    technologies: {
      jquery: { 
        name: 'jQuery', 
        patterns: [/jquery[\/\.\-]\d|jquery\.min\.js|code\.jquery\.com|ajax\.googleapis\.com.*jquery/i],
        versionPatterns: [/jquery[\/\-\.](\d+\.\d+\.\d+)/i, /jQuery v(\d+\.\d+\.\d+)/i, /jquery\/(\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://jquery.com' 
      },
      jqueryui: { 
        name: 'jQuery UI', 
        patterns: [/jquery-ui|jquery\.ui/i],
        versionPatterns: [/jquery[.-]ui[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://jqueryui.com' 
      },
      lodash: { 
        name: 'Lodash', 
        patterns: [/lodash[\/\.\-]\d|lodash\.min\.js|lodash\.js|cdn\.jsdelivr\.net.*lodash|cdnjs\.cloudflare\.com.*lodash/i],
        versionPatterns: [/lodash[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://lodash.com' 
      },
      underscore: { 
        name: 'Underscore.js', 
        patterns: [/underscore[\/\.\-]/i],
        versionPatterns: [/underscore[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://underscorejs.org' 
      },
      moment: { 
        name: 'Moment.js', 
        patterns: [/moment[\/\.\-]min|moment\.js/i],
        versionPatterns: [/moment[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://momentjs.com' 
      },
      axios: { 
        name: 'Axios', 
        patterns: [/axios[\/\.\-]/i],
        versionPatterns: [/axios[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://axios-http.com' 
      },
      gsap: { 
        name: 'GSAP', 
        patterns: [/gsap|TweenMax|TweenLite|greensock/i],
        versionPatterns: [/gsap[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://greensock.com' 
      },
      d3: { 
        name: 'D3.js', 
        patterns: [/d3\.min\.js|d3\.v\d|d3-[a-z]+/i],
        versionPatterns: [/d3\.v(\d+)/i, /d3[\/\-](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://d3js.org' 
      },
      threejs: { 
        name: 'Three.js', 
        patterns: [/three[\/\.\-]min|three\.js/i],
        versionPatterns: [/three[\/\-\.]r?(\d+)/i],
        icon: 'js', 
        website: 'https://threejs.org' 
      },
      chart: { 
        name: 'Chart.js', 
        patterns: [/chart\.min\.js|chart\.js|chartjs/i],
        versionPatterns: [/Chart\.js[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://chartjs.org' 
      },
      swiper: { 
        name: 'Swiper', 
        patterns: [/swiper[\/\.\-]bundle|swiper-/i],
        versionPatterns: [/swiper[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://swiperjs.com' 
      },
      slick: { 
        name: 'Slick Carousel', 
        patterns: [/slick[\/\.\-]min|slick-carousel/i],
        versionPatterns: [/slick[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://kenwheeler.github.io/slick' 
      },
      photoswipe: { 
        name: 'PhotoSwipe', 
        patterns: [/photoswipe[\/\.\-]/i],
        versionPatterns: [/photoswipe[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://photoswipe.com' 
      },
      aos: { 
        name: 'AOS', 
        patterns: [/aos\.js|data-aos=/i],
        icon: 'js', 
        website: 'https://michalsnik.github.io/aos' 
      },
      lottie: { 
        name: 'Lottie', 
        patterns: [/lottie[\/\.\-]|bodymovin/i],
        icon: 'js', 
        website: 'https://airbnb.design/lottie' 
      },
      select2: { 
        name: 'Select2', 
        patterns: [/select2[\/\.\-]/i],
        versionPatterns: [/select2[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://select2.org' 
      },
      corejs: { 
        name: 'core-js', 
        patterns: [/core-js[\/\.\-]/i],
        versionPatterns: [/core-js[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'js', 
        website: 'https://github.com/zloirock/core-js' 
      },
      spinjs: { 
        name: 'Spin.js', 
        patterns: [/spin\.min\.js|spin\.js/i],
        icon: 'js', 
        website: 'https://spin.js.org' 
      }
    }
  },
  cssfw: {
    name: 'CSS Frameworks',
    icon: '🎨',
    technologies: {
      tailwind: { 
        name: 'Tailwind CSS', 
        patterns: [/tailwindcss|tailwind\.min\.css|tailwind\.css|cdn\.tailwindcss\.com/i],
        icon: 'framework', 
        website: 'https://tailwindcss.com' 
      },
      bootstrap: { 
        name: 'Bootstrap', 
        patterns: [/bootstrap[\/\.\-]min\.css|bootstrap[\/\.\-]min\.js|cdn\.jsdelivr\.net.*bootstrap|stackpath\.bootstrapcdn\.com/i],
        versionPatterns: [/bootstrap[\/\-\.](\d+\.\d+\.\d+)/i, /Bootstrap v(\d+\.\d+\.\d+)/],
        icon: 'framework', 
        website: 'https://getbootstrap.com' 
      },
      bulma: { 
        name: 'Bulma', 
        patterns: [/bulma[\/\.\-]min\.css|bulma\.css|cdn\.jsdelivr\.net.*bulma|cdnjs\.cloudflare\.com.*bulma/i],
        versionPatterns: [/bulma[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://bulma.io' 
      },
      foundation: { 
        name: 'Foundation', 
        patterns: [/foundation[\/\.\-]min/i],
        versionPatterns: [/foundation[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://get.foundation' 
      },
      materialize: { 
        name: 'Materialize', 
        patterns: [/materialize[\/\.\-]min/i],
        versionPatterns: [/materialize[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://materializecss.com' 
      },
      chakra: { 
        name: 'Chakra UI', 
        patterns: [/chakra-ui|ChakraProvider/i],
        icon: 'framework', 
        website: 'https://chakra-ui.com' 
      },
      antdesign: { 
        name: 'Ant Design', 
        patterns: [/antd[\/\.\-]|ant-btn|ant-input/i],
        versionPatterns: [/antd[\/\-\.](\d+\.\d+\.\d+)/i],
        icon: 'framework', 
        website: 'https://ant.design' 
      },
      mui: { 
        name: 'Material UI', 
        patterns: [/MuiButton|@mui\//i],
        icon: 'framework', 
        website: 'https://mui.com' 
      }
    }
  },
  analytics: {
    name: 'Analytics',
    icon: '📊',
    technologies: {
      ga4: { 
        name: 'Google Analytics 4', 
        patterns: [/gtag.*G-[A-Z0-9]+|G-[A-Z0-9]{10}/i],
        icon: 'analytics', 
        website: 'https://analytics.google.com' 
      },
      gtm: { 
        name: 'Google Tag Manager', 
        patterns: [/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i],
        icon: 'tag-manager', 
        website: 'https://tagmanager.google.com' 
      },
      // ========== ADOBE ECOSYSTEM ==========
      adobeAnalytics: { 
        name: 'Adobe Analytics', 
        patterns: [/omtrdc\.net|demdex\.net|AppMeasurement|s_code\.js|s\.t\(\)|s\.tl\(|sc\.omtrdc/i],
        icon: 'analytics', 
        website: 'https://business.adobe.com/products/analytics/adobe-analytics.html' 
      },
      adobeLaunch: { 
        name: 'Adobe Launch', 
        patterns: [/assets\.adobedtm\.com|launch-.*\.min\.js|_satellite\./i],
        icon: 'tag-manager', 
        website: 'https://launch.adobe.com' 
      },
      adobeTarget: { 
        name: 'Adobe Target', 
        patterns: [/tt\.omtrdc\.net|mboxCreate|mbox\.js|at\.js/i],
        icon: 'analytics', 
        website: 'https://business.adobe.com/products/target/adobe-target.html' 
      },
      adobeAudience: { 
        name: 'Adobe Audience Manager', 
        patterns: [/demdex\.net|dpm\.demdex|aam\.js/i],
        icon: 'analytics', 
        website: 'https://business.adobe.com/products/audience-manager/adobe-audience-manager.html' 
      },
      adobeWebSDK: { 
        name: 'Adobe Web SDK (Alloy)', 
        patterns: [/alloy\(|cdn\.jsdelivr\.net.*alloy|launchdatastreams\.com/i],
        icon: 'analytics', 
        website: 'https://experienceleague.adobe.com/docs/experience-platform/edge/home.html' 
      },
      // ========== TEALIUM ECOSYSTEM ==========
      tealiumIQ: { 
        name: 'Tealium iQ', 
        patterns: [/tags\.tiqcdn\.com|tealiumiq\.com|utag\.js|utag\.sync\.js/i],
        icon: 'tag-manager', 
        website: 'https://tealium.com/products/tealium-iq/' 
      },
      tealiumAudienceStream: { 
        name: 'Tealium AudienceStream', 
        patterns: [/collect\.tealiumiq\.com|tealium\.com.*visitor/i],
        icon: 'analytics', 
        website: 'https://tealium.com/products/audiencestream/' 
      },
      // ========== OTHER ENTERPRISE ==========
      ensighten: { 
        name: 'Ensighten', 
        patterns: [/nexus\.ensighten\.com|ensighten\.com/i],
        icon: 'tag-manager', 
        website: 'https://ensighten.com' 
      },
      commandersAct: { 
        name: 'Commanders Act', 
        patterns: [/tagcommander\.com|tc_.*\.js/i],
        icon: 'tag-manager', 
        website: 'https://commandersact.com' 
      },
      signal: { 
        name: 'Signal (BrightTag)', 
        patterns: [/s\.thebrighttag\.com|signal\.co/i],
        icon: 'tag-manager', 
        website: 'https://signal.co' 
      },
      // ========== PRODUCT ANALYTICS ==========
      hotjar: { 
        name: 'Hotjar', 
        patterns: [/static\.hotjar\.com|hj\(|_hjSettings/i],
        icon: 'analytics', 
        website: 'https://hotjar.com' 
      },
      mixpanel: { 
        name: 'Mixpanel', 
        patterns: [/mixpanel\.com\/track|mixpanel\.init|cdn\.mxpnl\.com/i],
        icon: 'analytics', 
        website: 'https://mixpanel.com' 
      },
      amplitude: { 
        name: 'Amplitude', 
        patterns: [/amplitude\.com|amplitude\.init|cdn\.amplitude\.com/i],
        icon: 'analytics', 
        website: 'https://amplitude.com' 
      },
      segment: { 
        name: 'Segment', 
        patterns: [/cdn\.segment\.com|analytics\.identify|analytics\.track/i],
        icon: 'analytics', 
        website: 'https://segment.com' 
      },
      heap: { 
        name: 'Heap', 
        patterns: [/heapanalytics\.com|heap\.load|cdn\.heapanalytics/i],
        icon: 'analytics', 
        website: 'https://heap.io' 
      },
      fullstory: { 
        name: 'FullStory', 
        patterns: [/fullstory\.com|FS\.identify|edge\.fullstory/i],
        icon: 'analytics', 
        website: 'https://fullstory.com' 
      },
      clarity: { 
        name: 'Microsoft Clarity', 
        patterns: [/clarity\.ms|www\.clarity\.ms/i],
        icon: 'analytics', 
        website: 'https://clarity.microsoft.com' 
      },
      pendo: { 
        name: 'Pendo', 
        patterns: [/pendo\.io|cdn\.pendo\.io|pendo\.initialize/i],
        icon: 'analytics', 
        website: 'https://pendo.io' 
      },
      kissmetrics: { 
        name: 'Kissmetrics', 
        patterns: [/kissmetrics\.com|_kmq\.push/i],
        icon: 'analytics', 
        website: 'https://kissmetrics.io' 
      },
      // ========== CDP & DATA PLATFORMS ==========
      rudderstack: { 
        name: 'RudderStack', 
        patterns: [/rudderstack\.com|cdn\.rudderlabs\.com|rudderanalytics/i],
        icon: 'analytics', 
        website: 'https://rudderstack.com' 
      },
      mparticle: { 
        name: 'mParticle', 
        patterns: [/mparticle\.com|jssdkcdns\.mparticle/i],
        icon: 'analytics', 
        website: 'https://mparticle.com' 
      },
      // ========== PRIVACY-FOCUSED ==========
      matomo: { 
        name: 'Matomo', 
        patterns: [/matomo\.js|_paq\.push|matomo\.cloud/i],
        icon: 'analytics', 
        website: 'https://matomo.org' 
      },
      plausible: { 
        name: 'Plausible', 
        patterns: [/plausible\.io/i],
        icon: 'analytics', 
        website: 'https://plausible.io' 
      },
      fathom: { 
        name: 'Fathom', 
        patterns: [/usefathom\.com|cdn\.usefathom\.com/i],
        icon: 'analytics', 
        website: 'https://usefathom.com' 
      },
      simpleAnalytics: { 
        name: 'Simple Analytics', 
        patterns: [/simpleanalyticscdn\.com|scripts\.simpleanalyticscdn/i],
        icon: 'analytics', 
        website: 'https://simpleanalytics.com' 
      },
      // ========== SESSION RECORDING ==========
      posthog: { 
        name: 'PostHog', 
        patterns: [/posthog\.com|app\.posthog\.com|posthog\.init/i],
        icon: 'analytics', 
        website: 'https://posthog.com' 
      },
      logrocket: { 
        name: 'LogRocket', 
        patterns: [/logrocket\.com|cdn\.logrocket\.io|LogRocket\.init/i],
        icon: 'analytics', 
        website: 'https://logrocket.com' 
      },
      smartlook: { 
        name: 'Smartlook', 
        patterns: [/smartlook\.com|rec\.smartlook\.com/i],
        icon: 'analytics', 
        website: 'https://smartlook.com' 
      },
      mouseflow: { 
        name: 'Mouseflow', 
        patterns: [/mouseflow\.com|cdn\.mouseflow\.com/i],
        icon: 'analytics', 
        website: 'https://mouseflow.com' 
      },
      luckyorange: { 
        name: 'Lucky Orange', 
        patterns: [/luckyorange\.com|d10lpsik1i8c69\.cloudfront/i],
        icon: 'analytics', 
        website: 'https://luckyorange.com' 
      },
      crazyegg: { 
        name: 'Crazy Egg', 
        patterns: [/crazyegg\.com|script\.crazyegg\.com/i],
        icon: 'analytics', 
        website: 'https://crazyegg.com' 
      }
    }
  },
  marketing: {
    name: 'Marketing & Ads',
    icon: '📢',
    technologies: {
      fbpixel: { 
        name: 'Meta Pixel', 
        patterns: [/connect\.facebook\.net|fbq\(|facebook-jssdk/i],
        icon: 'marketing', 
        website: 'https://facebook.com/business' 
      },
      googleads: { 
        name: 'Google Ads', 
        patterns: [/googleadservices\.com|googlesyndication|AW-\d+/i],
        icon: 'marketing', 
        website: 'https://ads.google.com' 
      },
      linkedin: { 
        name: 'LinkedIn Insight Tag', 
        patterns: [/snap\.licdn\.com|_linkedin_data_partner/i],
        icon: 'marketing', 
        website: 'https://linkedin.com/help/linkedin/answer/65521' 
      },
      tiktok: { 
        name: 'TikTok Pixel', 
        patterns: [/analytics\.tiktok\.com|ttq\./i],
        icon: 'marketing', 
        website: 'https://ads.tiktok.com' 
      },
      pinterest: { 
        name: 'Pinterest Tag', 
        patterns: [/pintrk|s\.pinimg\.com.*tag/i],
        icon: 'marketing', 
        website: 'https://ads.pinterest.com' 
      },
      twitter: { 
        name: 'Twitter/X Pixel', 
        patterns: [/static\.ads-twitter\.com|twq\(/i],
        icon: 'marketing', 
        website: 'https://ads.twitter.com' 
      },
      snapchat: { 
        name: 'Snapchat Pixel', 
        patterns: [/tr\.snapchat\.com|snaptr/i],
        icon: 'marketing', 
        website: 'https://forbusiness.snapchat.com' 
      },
      reddit: { 
        name: 'Reddit Pixel', 
        patterns: [/ads\.reddit\.com|rdt\(/i],
        icon: 'marketing', 
        website: 'https://ads.reddit.com' 
      },
      // ========== AMAZON ==========
      amazonAds: { 
        name: 'Amazon Ads', 
        patterns: [/amazon-adsystem\.com|assoc-amazon|amzn\.to/i],
        icon: 'marketing', 
        website: 'https://advertising.amazon.com' 
      },
      amazonAttribution: { 
        name: 'Amazon Attribution', 
        patterns: [/amazonattribution\.com|aax-us-east/i],
        icon: 'marketing', 
        website: 'https://advertising.amazon.com/attribution' 
      },
      // ========== NATIVE ADS ==========
      taboola: { 
        name: 'Taboola', 
        patterns: [/cdn\.taboola\.com|tblcdn\.com|_tfa\.push/i],
        icon: 'marketing', 
        website: 'https://taboola.com' 
      },
      outbrain: { 
        name: 'Outbrain', 
        patterns: [/outbrain\.com|widgets\.outbrain|obApi/i],
        icon: 'marketing', 
        website: 'https://outbrain.com' 
      },
      // ========== RETARGETING ==========
      criteo: { 
        name: 'Criteo', 
        patterns: [/static\.criteo\.net|criteo_q|rtax\.criteo/i],
        icon: 'marketing', 
        website: 'https://criteo.com' 
      },
      adroll: { 
        name: 'AdRoll', 
        patterns: [/d\.adroll\.com|adroll\.js|__adroll/i],
        icon: 'marketing', 
        website: 'https://adroll.com' 
      },
      rtbhouse: { 
        name: 'RTB House', 
        patterns: [/creativecdn\.com|rtbhouse\.com/i],
        icon: 'marketing', 
        website: 'https://rtbhouse.com' 
      },
      // ========== SEARCH & SHOPPING ==========
      bing: { 
        name: 'Microsoft Ads (Bing)', 
        patterns: [/bat\.bing\.com|uet\/|UET\s*=/i],
        icon: 'marketing', 
        website: 'https://ads.microsoft.com' 
      },
      googleMerchant: { 
        name: 'Google Merchant Center', 
        patterns: [/merchant\.google\.com|merchants\.google/i],
        icon: 'marketing', 
        website: 'https://merchants.google.com' 
      },
      // ========== PROGRAMMATIC ==========
      theTradeDesk: { 
        name: 'The Trade Desk', 
        patterns: [/thetradedesk\.com|ttdunified\.js|adsrvr\.org/i],
        icon: 'marketing', 
        website: 'https://thetradedesk.com' 
      },
      dv360: { 
        name: 'Display & Video 360', 
        patterns: [/doubleclick\.net|cm\.g\.doubleclick|fledge\.google/i],
        icon: 'marketing', 
        website: 'https://displayvideo.google.com' 
      },
      // ========== EMAIL & CRM ==========
      hubspot: { 
        name: 'HubSpot', 
        patterns: [/js\.hs-scripts\.com|hs-analytics|js\.hubspot\.com/i],
        icon: 'marketing', 
        website: 'https://hubspot.com' 
      },
      klaviyo: { 
        name: 'Klaviyo', 
        patterns: [/klaviyo\.com|_klOnsite|static\.klaviyo/i],
        icon: 'marketing', 
        website: 'https://klaviyo.com' 
      },
      mailchimp: { 
        name: 'Mailchimp', 
        patterns: [/chimpstatic\.com|mc\.us\d+\.list-manage/i],
        icon: 'marketing', 
        website: 'https://mailchimp.com' 
      },
      activecampaign: { 
        name: 'ActiveCampaign', 
        patterns: [/trackcmp\.net|activehosted\.com/i],
        icon: 'marketing', 
        website: 'https://activecampaign.com' 
      },
      salesforce: { 
        name: 'Salesforce Marketing Cloud', 
        patterns: [/salesforce\.com|exacttarget\.com|mc\.s\d+\.sfmc/i],
        icon: 'marketing', 
        website: 'https://salesforce.com/marketing-cloud' 
      },
      marketo: { 
        name: 'Marketo', 
        patterns: [/marketo\.net|marketo\.com|munchkin/i],
        icon: 'marketing', 
        website: 'https://marketo.com' 
      },
      pardot: { 
        name: 'Pardot', 
        patterns: [/pardot\.com|pi\.pardot|piAId/i],
        icon: 'marketing', 
        website: 'https://pardot.com' 
      },
      // ========== AFFILIATE ==========
      impactRadius: { 
        name: 'Impact', 
        patterns: [/impact\.com|impactradius\.com|d\.impactradius-event/i],
        icon: 'marketing', 
        website: 'https://impact.com' 
      },
      shareasale: { 
        name: 'ShareASale', 
        patterns: [/shareasale\.com|shareasale-analytics/i],
        icon: 'marketing', 
        website: 'https://shareasale.com' 
      },
      rakuten: { 
        name: 'Rakuten Advertising', 
        patterns: [/rakuten\.com|dc\.ads\.rakuten|track\.linksynergy/i],
        icon: 'marketing', 
        website: 'https://rakutenadvertising.com' 
      },
      cj: { 
        name: 'CJ Affiliate', 
        patterns: [/cj\.com|commission-junction|dpbolvw\.net|anrdoezrs\.net/i],
        icon: 'marketing', 
        website: 'https://cj.com' 
      },
      // ========== ATTRIBUTION & TRACKING ==========
      hyros: { 
        name: 'Hyros', 
        patterns: [/hyros\.com|t\.hyros\.com|tracker\.hyros/i],
        icon: 'marketing', 
        website: 'https://hyros.com' 
      },
      triplewhale: { 
        name: 'Triple Whale', 
        patterns: [/triplewhale\.com|api\.triplewhale|tw\.triplewhale/i],
        icon: 'marketing', 
        website: 'https://triplewhale.com' 
      },
      northbeam: { 
        name: 'Northbeam', 
        patterns: [/northbeam\.io|cdn\.northbeam/i],
        icon: 'marketing', 
        website: 'https://northbeam.io' 
      },
      rockerbox: { 
        name: 'Rockerbox', 
        patterns: [/rockerbox\.com|getrockerbox\.com/i],
        icon: 'marketing', 
        website: 'https://rockerbox.com' 
      },
      wickedreports: { 
        name: 'Wicked Reports', 
        patterns: [/wickedreports\.com|track\.wickedreports/i],
        icon: 'marketing', 
        website: 'https://wickedreports.com' 
      },
      ruleranalytics: { 
        name: 'Ruler Analytics', 
        patterns: [/ruleranalytics\.com|cdn\.ruleranalytics/i],
        icon: 'marketing', 
        website: 'https://ruleranalytics.com' 
      },
      // ========== CALL TRACKING ==========
      callrail: { 
        name: 'CallRail', 
        patterns: [/callrail\.com|cdn\.callrail\.com|calltrk/i],
        icon: 'marketing', 
        website: 'https://callrail.com' 
      },
      calltrackingmetrics: { 
        name: 'CallTrackingMetrics', 
        patterns: [/calltrackingmetrics\.com|ctm\.io|tctm\.co/i],
        icon: 'marketing', 
        website: 'https://calltrackingmetrics.com' 
      },
      invoca: { 
        name: 'Invoca', 
        patterns: [/invoca\.net|invoca\.com|prf\.invoca/i],
        icon: 'marketing', 
        website: 'https://invoca.com' 
      },
      phonexa: { 
        name: 'Phonexa', 
        patterns: [/phonexa\.com|phonexa\.io/i],
        icon: 'marketing', 
        website: 'https://phonexa.com' 
      },
      whatconverts: { 
        name: 'WhatConverts', 
        patterns: [/whatconverts\.com|leads\.whatconverts/i],
        icon: 'marketing', 
        website: 'https://whatconverts.com' 
      },
      // ========== MOBILE ATTRIBUTION ==========
      appsflyer: { 
        name: 'AppsFlyer', 
        patterns: [/appsflyer\.com|onelink\.me|af\.appsflyer/i],
        icon: 'marketing', 
        website: 'https://appsflyer.com' 
      },
      adjust: { 
        name: 'Adjust', 
        patterns: [/adjust\.com|adj\.st|app\.adjust/i],
        icon: 'marketing', 
        website: 'https://adjust.com' 
      },
      branch: { 
        name: 'Branch', 
        patterns: [/branch\.io|bnc\.lt|app\.link/i],
        icon: 'marketing', 
        website: 'https://branch.io' 
      },
      kochava: { 
        name: 'Kochava', 
        patterns: [/kochava\.com|control\.kochava/i],
        icon: 'marketing', 
        website: 'https://kochava.com' 
      },
      singular: { 
        name: 'Singular', 
        patterns: [/singular\.net|sdk\.singular/i],
        icon: 'marketing', 
        website: 'https://singular.net' 
      },
      // ========== SMS MARKETING ==========
      attentive: { 
        name: 'Attentive', 
        patterns: [/attentive\.com|attn\.tv|cdn\.attentive/i],
        icon: 'marketing', 
        website: 'https://attentive.com' 
      },
      postscript: { 
        name: 'Postscript', 
        patterns: [/postscript\.io|sdk\.postscript/i],
        icon: 'marketing', 
        website: 'https://postscript.io' 
      },
      smsb: { 
        name: 'SMSBump (Yotpo)', 
        patterns: [/smsbump\.com|yotpo\.com.*sms/i],
        icon: 'marketing', 
        website: 'https://smsbump.com' 
      },
      // ========== POPUPS & LEAD CAPTURE ==========
      privy: { 
        name: 'Privy', 
        patterns: [/privy\.com|widget\.privy/i],
        icon: 'marketing', 
        website: 'https://privy.com' 
      },
      justuno: { 
        name: 'Justuno', 
        patterns: [/justuno\.com|cdn\.jst\.ai/i],
        icon: 'marketing', 
        website: 'https://justuno.com' 
      },
      optinmonster: { 
        name: 'OptinMonster', 
        patterns: [/optinmonster\.com|optmnstr\.com|a\.optmstr/i],
        icon: 'marketing', 
        website: 'https://optinmonster.com' 
      },
      sumo: { 
        name: 'Sumo', 
        patterns: [/sumo\.com|load\.sumo\.com|load\.sumome/i],
        icon: 'marketing', 
        website: 'https://sumo.com' 
      },
      // ========== LANDING PAGES ==========
      unbounce: { 
        name: 'Unbounce', 
        patterns: [/unbounce\.com|unbouncepages\.com/i],
        icon: 'marketing', 
        website: 'https://unbounce.com' 
      },
      instapage: { 
        name: 'Instapage', 
        patterns: [/instapage\.com|pageserve\.co/i],
        icon: 'marketing', 
        website: 'https://instapage.com' 
      },
      leadpages: { 
        name: 'Leadpages', 
        patterns: [/leadpages\.com|leadpages\.net|lpages\.co/i],
        icon: 'marketing', 
        website: 'https://leadpages.com' 
      },
      // ========== OTHER ==========
      quora: { 
        name: 'Quora Pixel', 
        patterns: [/quora\.com\/_\/ad|qpixel/i],
        icon: 'marketing', 
        website: 'https://quora.com/business' 
      },
      nextdoor: { 
        name: 'Nextdoor Ads', 
        patterns: [/nextdoor\.com\/ads|ads\.nextdoor/i],
        icon: 'marketing', 
        website: 'https://nextdoor.com/business' 
      }
    }
  },
  // ========== ATTRIBUTION & CDP ==========
  attribution: {
    name: 'Attribution & CDP',
    icon: '🎯',
    technologies: {
      // ========== CUSTOMER DATA PLATFORMS ==========
      bloomreach: { 
        name: 'Bloomreach', 
        patterns: [/bloomreach\.com|cdn\.exponea\.com|exponea/i],
        icon: 'cdp', 
        website: 'https://bloomreach.com' 
      },
      treasuredata: { 
        name: 'Treasure Data', 
        patterns: [/treasuredata\.com|td\.js|in\.treasuredata/i],
        icon: 'cdp', 
        website: 'https://treasuredata.com' 
      },
      actioniq: { 
        name: 'ActionIQ', 
        patterns: [/actioniq\.com/i],
        icon: 'cdp', 
        website: 'https://actioniq.com' 
      },
      lytics: { 
        name: 'Lytics', 
        patterns: [/lytics\.io|c\.lytics\.io/i],
        icon: 'cdp', 
        website: 'https://lytics.com' 
      },
      blueconic: { 
        name: 'BlueConic', 
        patterns: [/blueconic\.net|cdn\.blueconic/i],
        icon: 'cdp', 
        website: 'https://blueconic.com' 
      },
      zeotap: { 
        name: 'Zeotap', 
        patterns: [/zeotap\.com|sdk\.zeotap/i],
        icon: 'cdp', 
        website: 'https://zeotap.com' 
      },
      // ========== B2B INTENT & LEAD ==========
      leadfeeder: { 
        name: 'Leadfeeder', 
        patterns: [/leadfeeder\.com|lftracker/i],
        icon: 'analytics', 
        website: 'https://leadfeeder.com' 
      },
      clearbit: { 
        name: 'Clearbit', 
        patterns: [/clearbit\.com|x\.clearbitjs|clearbit\.js/i],
        icon: 'analytics', 
        website: 'https://clearbit.com' 
      },
      zoominfo: { 
        name: 'ZoomInfo', 
        patterns: [/zoominfo\.com|ws\.zoominfo/i],
        icon: 'analytics', 
        website: 'https://zoominfo.com' 
      },
      sixsense: { 
        name: '6sense', 
        patterns: [/6sense\.com|j\.6sense\.com|6sc\.co/i],
        icon: 'analytics', 
        website: 'https://6sense.com' 
      },
      demandbase: { 
        name: 'Demandbase', 
        patterns: [/demandbase\.com|tag\.demandbase|scripts\.demandbase/i],
        icon: 'analytics', 
        website: 'https://demandbase.com' 
      },
      bombora: { 
        name: 'Bombora', 
        patterns: [/bombora\.com|ml314\.com/i],
        icon: 'analytics', 
        website: 'https://bombora.com' 
      }
    }
  },
  // ========== E-COMMERCE TOOLS ==========
  ecomtools: {
    name: 'E-commerce Tools',
    icon: '🛍️',
    technologies: {
      // ========== SHOPIFY SPECIFIC ==========
      elevar: { 
        name: 'Elevar', 
        patterns: [/elevar\.io|getelevar\.com|cdn\.getelevar/i],
        icon: 'ecommerce', 
        website: 'https://getelevar.com' 
      },
      littledata: { 
        name: 'Littledata', 
        patterns: [/littledata\.io|app\.littledata/i],
        icon: 'ecommerce', 
        website: 'https://littledata.io' 
      },
      polaranalytics: { 
        name: 'Polar Analytics', 
        patterns: [/polaranalytics\.com|polar\.io/i],
        icon: 'ecommerce', 
        website: 'https://polaranalytics.com' 
      },
      lifetimely: { 
        name: 'Lifetimely', 
        patterns: [/lifetimely\.io/i],
        icon: 'ecommerce', 
        website: 'https://lifetimely.io' 
      },
      daasity: { 
        name: 'Daasity', 
        patterns: [/daasity\.com/i],
        icon: 'ecommerce', 
        website: 'https://daasity.com' 
      },
      // ========== REVIEWS & UGC ==========
      stamped: { 
        name: 'Stamped.io', 
        patterns: [/stamped\.io|cdn\.stamped/i],
        icon: 'ecommerce', 
        website: 'https://stamped.io' 
      },
      loox: { 
        name: 'Loox', 
        patterns: [/loox\.io|loox\.app/i],
        icon: 'ecommerce', 
        website: 'https://loox.app' 
      },
      okendo: { 
        name: 'Okendo', 
        patterns: [/okendo\.io|cdn\.okendo/i],
        icon: 'ecommerce', 
        website: 'https://okendo.io' 
      },
      // ========== LOYALTY & REWARDS ==========
      smile: { 
        name: 'Smile.io', 
        patterns: [/smile\.io|cdn\.smile\.io/i],
        icon: 'ecommerce', 
        website: 'https://smile.io' 
      },
      loyaltylion: { 
        name: 'LoyaltyLion', 
        patterns: [/loyaltylion\.com|sdk\.loyaltylion/i],
        icon: 'ecommerce', 
        website: 'https://loyaltylion.com' 
      },
      // ========== SUBSCRIPTIONS ==========
      recharge: { 
        name: 'Recharge', 
        patterns: [/rechargepayments\.com|rechargeapps\.com/i],
        icon: 'ecommerce', 
        website: 'https://rechargepayments.com' 
      },
      bold: { 
        name: 'Bold Commerce', 
        patterns: [/boldcommerce\.com|bold\.ly/i],
        icon: 'ecommerce', 
        website: 'https://boldcommerce.com' 
      }
    }
  },
  // ========== SURVEYS & FEEDBACK ==========
  feedback: {
    name: 'Surveys & Feedback',
    icon: '📝',
    technologies: {
      typeform: { 
        name: 'Typeform', 
        patterns: [/typeform\.com|embed\.typeform/i],
        icon: 'survey', 
        website: 'https://typeform.com' 
      },
      surveymonkey: { 
        name: 'SurveyMonkey', 
        patterns: [/surveymonkey\.com|smrtr\.io/i],
        icon: 'survey', 
        website: 'https://surveymonkey.com' 
      },
      qualtrics: { 
        name: 'Qualtrics', 
        patterns: [/qualtrics\.com|siteintercept\.qualtrics/i],
        icon: 'survey', 
        website: 'https://qualtrics.com' 
      },
      medallia: { 
        name: 'Medallia', 
        patterns: [/medallia\.com|nebula\.medallia/i],
        icon: 'survey', 
        website: 'https://medallia.com' 
      },
      usabilla: { 
        name: 'Usabilla', 
        patterns: [/usabilla\.com|w\.usabilla/i],
        icon: 'survey', 
        website: 'https://usabilla.com' 
      },
      getfeedback: { 
        name: 'GetFeedback', 
        patterns: [/getfeedback\.com/i],
        icon: 'survey', 
        website: 'https://getfeedback.com' 
      },
      delighted: { 
        name: 'Delighted', 
        patterns: [/delighted\.com|d\.delighted\.com/i],
        icon: 'survey', 
        website: 'https://delighted.com' 
      },
      survicate: { 
        name: 'Survicate', 
        patterns: [/survicate\.com|survey\.survicate/i],
        icon: 'survey', 
        website: 'https://survicate.com' 
      }
    }
  },
  // ========== PUSH & NOTIFICATIONS ==========
  notifications: {
    name: 'Push Notifications',
    icon: '🔔',
    technologies: {
      onesignal: { 
        name: 'OneSignal', 
        patterns: [/onesignal\.com|cdn\.onesignal/i],
        icon: 'notification', 
        website: 'https://onesignal.com' 
      },
      pusher: { 
        name: 'Pusher', 
        patterns: [/pusher\.com|js\.pusher\.com/i],
        icon: 'notification', 
        website: 'https://pusher.com' 
      },
      firebase: { 
        name: 'Firebase', 
        patterns: [/firebase\.com|firebaseio\.com|gstatic\.com\/firebasejs/i],
        icon: 'notification', 
        website: 'https://firebase.google.com' 
      },
      airship: { 
        name: 'Airship', 
        patterns: [/airship\.com|urbanairship\.com/i],
        icon: 'notification', 
        website: 'https://airship.com' 
      },
      pushowl: { 
        name: 'PushOwl', 
        patterns: [/pushowl\.com|cdn\.pushowl/i],
        icon: 'notification', 
        website: 'https://pushowl.com' 
      },
      webpushr: { 
        name: 'Webpushr', 
        patterns: [/webpushr\.com|cdn\.webpushr/i],
        icon: 'notification', 
        website: 'https://webpushr.com' 
      }
    }
  },
  // ========== AD VERIFICATION & FRAUD ==========
  verification: {
    name: 'Ad Verification',
    icon: '🛡️',
    technologies: {
      doubleverify: { 
        name: 'DoubleVerify', 
        patterns: [/doubleverify\.com|cdn\.doubleverify|dvtps/i],
        icon: 'verification', 
        website: 'https://doubleverify.com' 
      },
      ias: { 
        name: 'Integral Ad Science', 
        patterns: [/integralads\.com|adsafeprotected\.com|pixel\.adsafeprotected/i],
        icon: 'verification', 
        website: 'https://integralads.com' 
      },
      moat: { 
        name: 'MOAT (Oracle)', 
        patterns: [/moatads\.com|z\.moatads|moat\.co/i],
        icon: 'verification', 
        website: 'https://moat.com' 
      },
      pixalate: { 
        name: 'Pixalate', 
        patterns: [/pixalate\.com|adrta\.com/i],
        icon: 'verification', 
        website: 'https://pixalate.com' 
      },
      whiteops: { 
        name: 'HUMAN (White Ops)', 
        patterns: [/humansecurity\.com|whiteops\.com/i],
        icon: 'verification', 
        website: 'https://humansecurity.com' 
      }
    }
  },
  // ========== CONSENT MANAGEMENT ==========
  consent: {
    name: 'Consent Management',
    icon: '🔐',
    technologies: {
      onetrust: { 
        name: 'OneTrust', 
        patterns: [/onetrust\.com|cdn\.cookielaw\.org|optanon/i],
        icon: 'consent', 
        website: 'https://onetrust.com' 
      },
      cookiebot: { 
        name: 'Cookiebot', 
        patterns: [/cookiebot\.com|consent\.cookiebot/i],
        icon: 'consent', 
        website: 'https://cookiebot.com' 
      },
      trustarc: { 
        name: 'TrustArc', 
        patterns: [/trustarc\.com|consent\.trustarc|truste\.com/i],
        icon: 'consent', 
        website: 'https://trustarc.com' 
      },
      quantcast: { 
        name: 'Quantcast Choice', 
        patterns: [/quantcast\.com|quantcast\.mgr/i],
        icon: 'consent', 
        website: 'https://quantcast.com' 
      },
      didomi: { 
        name: 'Didomi', 
        patterns: [/didomi\.io|sdk\.privacy-center/i],
        icon: 'consent', 
        website: 'https://didomi.io' 
      },
      sourcepoint: { 
        name: 'Sourcepoint', 
        patterns: [/sourcepoint\.com|sp-prod\.net/i],
        icon: 'consent', 
        website: 'https://sourcepoint.com' 
      },
      usercentrics: { 
        name: 'Usercentrics', 
        patterns: [/usercentrics\.eu|usercentrics\.com/i],
        icon: 'consent', 
        website: 'https://usercentrics.com' 
      },
      complianz: { 
        name: 'Complianz', 
        patterns: [/complianz\.io|cmplz/i],
        icon: 'consent', 
        website: 'https://complianz.io' 
      },
      iubenda: { 
        name: 'Iubenda', 
        patterns: [/iubenda\.com|cdn\.iubenda/i],
        icon: 'consent', 
        website: 'https://iubenda.com' 
      },
      termly: { 
        name: 'Termly', 
        patterns: [/termly\.io|app\.termly/i],
        icon: 'consent', 
        website: 'https://termly.io' 
      },
      cookieyes: { 
        name: 'CookieYes', 
        patterns: [/cookieyes\.com|cdn-cookieyes/i],
        icon: 'consent', 
        website: 'https://cookieyes.com' 
      }
    }
  },
  livechat: {
    name: 'Live Chat & Support',
    icon: '💬',
    technologies: {
      intercom: { 
        name: 'Intercom', 
        patterns: [/intercom\.io|widget\.intercom\.io|Intercom\(/i],
        icon: 'live-chat', 
        website: 'https://intercom.com' 
      },
      drift: { 
        name: 'Drift', 
        patterns: [/js\.driftt\.com|drift\.load/i],
        icon: 'live-chat', 
        website: 'https://drift.com' 
      },
      zendesk: { 
        name: 'Zendesk', 
        patterns: [/static\.zdassets\.com|zE\(|zESettings/i],
        icon: 'live-chat', 
        website: 'https://zendesk.com' 
      },
      freshchat: { 
        name: 'Freshchat', 
        patterns: [/wchat\.freshchat\.com|freshworks\.com/i],
        icon: 'live-chat', 
        website: 'https://freshworks.com' 
      },
      tawk: { 
        name: 'Tawk.to', 
        patterns: [/embed\.tawk\.to|Tawk_API/i],
        icon: 'live-chat', 
        website: 'https://tawk.to' 
      },
      livechat: { 
        name: 'LiveChat', 
        patterns: [/cdn\.livechatinc\.com|__lc\./i],
        icon: 'live-chat', 
        website: 'https://livechat.com' 
      },
      crisp: { 
        name: 'Crisp', 
        patterns: [/client\.crisp\.chat|CRISP_WEBSITE_ID/i],
        icon: 'live-chat', 
        website: 'https://crisp.chat' 
      },
      tidio: { 
        name: 'Tidio', 
        patterns: [/code\.tidio\.co|tidioChatCode/i],
        icon: 'live-chat', 
        website: 'https://tidio.com' 
      },
      hubspotchat: { 
        name: 'HubSpot Chat', 
        patterns: [/js\.usemessages\.com/i],
        icon: 'live-chat', 
        website: 'https://hubspot.com' 
      },
      gorgias: { 
        name: 'Gorgias', 
        patterns: [/gorgias\.io|config\.gorgias/i],
        icon: 'live-chat', 
        website: 'https://gorgias.com' 
      },
      kustomer: { 
        name: 'Kustomer', 
        patterns: [/kustomer\.com|cdn\.kustomerapp/i],
        icon: 'live-chat', 
        website: 'https://kustomer.com' 
      },
      gladly: { 
        name: 'Gladly', 
        patterns: [/gladly\.com|cdn\.gladly/i],
        icon: 'live-chat', 
        website: 'https://gladly.com' 
      },
      helpscout: { 
        name: 'Help Scout', 
        patterns: [/helpscout\.net|beacon-v2\.helpscout/i],
        icon: 'live-chat', 
        website: 'https://helpscout.com' 
      },
      olark: { 
        name: 'Olark', 
        patterns: [/static\.olark\.com|olark\.identify/i],
        icon: 'live-chat', 
        website: 'https://olark.com' 
      },
      chatwoot: { 
        name: 'Chatwoot', 
        patterns: [/chatwoot\.com|app\.chatwoot/i],
        icon: 'live-chat', 
        website: 'https://chatwoot.com' 
      },
      chatra: { 
        name: 'Chatra', 
        patterns: [/chatra\.io|call\.chatra/i],
        icon: 'live-chat', 
        website: 'https://chatra.io' 
      }
    }
  },
  cdn: {
    name: 'CDN & Hosting',
    icon: '⚡',
    technologies: {
      cloudflare: { 
        name: 'Cloudflare', 
        patterns: [/cdnjs\.cloudflare\.com|cloudflare\.com|__cf_bm|cf-ray/i],
        icon: 'cdn', 
        website: 'https://cloudflare.com' 
      },
      fastly: { 
        name: 'Fastly', 
        patterns: [/fastly\.net|x-served-by.*cache/i],
        icon: 'cdn', 
        website: 'https://fastly.com' 
      },
      akamai: { 
        name: 'Akamai', 
        patterns: [/akamai\.net|akamaized\.net/i],
        icon: 'cdn', 
        website: 'https://akamai.com' 
      },
      awscloudfront: { 
        name: 'Amazon CloudFront', 
        patterns: [/cloudfront\.net|d[a-z0-9]+\.cloudfront/i],
        icon: 'cdn', 
        website: 'https://aws.amazon.com/cloudfront' 
      },
      vercel: { 
        name: 'Vercel', 
        patterns: [/vercel\.app|vercel\.com|x-vercel-/i],
        icon: 'hosting', 
        website: 'https://vercel.com' 
      },
      netlify: { 
        name: 'Netlify', 
        patterns: [/netlify\.app|netlify\.com/i],
        icon: 'hosting', 
        website: 'https://netlify.com' 
      },
      jsdelivr: { 
        name: 'jsDelivr', 
        patterns: [/cdn\.jsdelivr\.net/i],
        icon: 'cdn', 
        website: 'https://jsdelivr.com' 
      },
      unpkg: { 
        name: 'unpkg', 
        patterns: [/unpkg\.com/i],
        icon: 'cdn', 
        website: 'https://unpkg.com' 
      },
      googlecdn: { 
        name: 'Google Hosted Libraries', 
        patterns: [/ajax\.googleapis\.com/i],
        icon: 'cdn', 
        website: 'https://developers.google.com/speed/libraries' 
      },
      awss3: { 
        name: 'Amazon S3', 
        patterns: [/s3\.amazonaws\.com|s3-[a-z0-9\-]+\.amazonaws/i],
        icon: 'cdn', 
        website: 'https://aws.amazon.com/s3' 
      }
    }
  },
  ecommerce: {
    name: 'E-commerce & Payments',
    icon: '🛒',
    technologies: {
      woocommerce: { 
        name: 'WooCommerce', 
        patterns: [/woocommerce|wc-add-to-cart|wc-cart/i],
        icon: 'ecommerce', 
        website: 'https://woocommerce.com' 
      },
      stripe: { 
        name: 'Stripe', 
        patterns: [/js\.stripe\.com|Stripe\(/i],
        versionPatterns: [/stripe[\/\-]v(\d+)/i],
        icon: 'payment', 
        website: 'https://stripe.com' 
      },
      paypal: { 
        name: 'PayPal', 
        patterns: [/paypal\.com|paypalobjects/i],
        icon: 'payment', 
        website: 'https://paypal.com' 
      },
      klarna: { 
        name: 'Klarna', 
        patterns: [/klarna\.com|klarna-/i],
        icon: 'payment', 
        website: 'https://klarna.com' 
      },
      affirm: { 
        name: 'Affirm', 
        patterns: [/affirm\.com|affirm-js/i],
        icon: 'payment', 
        website: 'https://affirm.com' 
      },
      afterpay: { 
        name: 'Afterpay', 
        patterns: [/afterpay\.com|afterpay\.js|clearpay/i],
        icon: 'payment', 
        website: 'https://afterpay.com' 
      },
      square: { 
        name: 'Square', 
        patterns: [/squareup\.com|square\.js/i],
        icon: 'payment', 
        website: 'https://squareup.com' 
      },
      yotpo: { 
        name: 'Yotpo', 
        patterns: [/yotpo\.com|staticw2\.yotpo/i],
        icon: 'ecommerce', 
        website: 'https://yotpo.com' 
      },
      judgeme: { 
        name: 'Judge.me', 
        patterns: [/judge\.me/i],
        icon: 'ecommerce', 
        website: 'https://judge.me' 
      }
    }
  },
  security: {
    name: 'Security & Error Tracking',
    icon: '🔒',
    technologies: {
      recaptcha: { 
        name: 'reCAPTCHA', 
        patterns: [/google\.com\/recaptcha|grecaptcha/i],
        icon: 'security', 
        website: 'https://google.com/recaptcha' 
      },
      hcaptcha: { 
        name: 'hCaptcha', 
        patterns: [/hcaptcha\.com|h-captcha/i],
        icon: 'security', 
        website: 'https://hcaptcha.com' 
      },
      turnstile: { 
        name: 'Cloudflare Turnstile', 
        patterns: [/challenges\.cloudflare\.com\/turnstile/i],
        icon: 'security', 
        website: 'https://cloudflare.com/products/turnstile' 
      },
      sentry: { 
        name: 'Sentry', 
        patterns: [/sentry\.io|Sentry\.init|dsn.*sentry/i],
        icon: 'security', 
        website: 'https://sentry.io' 
      },
      bugsnag: { 
        name: 'Bugsnag', 
        patterns: [/bugsnag\.com|Bugsnag\.start/i],
        icon: 'security', 
        website: 'https://bugsnag.com' 
      },
      rollbar: { 
        name: 'Rollbar', 
        patterns: [/rollbar\.com|Rollbar\.init/i],
        icon: 'security', 
        website: 'https://rollbar.com' 
      },
      datadome: { 
        name: 'DataDome', 
        patterns: [/datadome\.co/i],
        icon: 'security', 
        website: 'https://datadome.co' 
      }
    }
  },
  testing: {
    name: 'A/B Testing & Personalization',
    icon: '🧪',
    technologies: {
      optimizely: { 
        name: 'Optimizely', 
        patterns: [/optimizely\.com|optimizelyEndUserId|cdn\.optimizely/i],
        icon: 'a-b-testing', 
        website: 'https://optimizely.com' 
      },
      googleOptimize: { 
        name: 'Google Optimize', 
        patterns: [/googleoptimize\.com|OPT-[A-Z0-9]+/i],
        icon: 'a-b-testing', 
        website: 'https://optimize.google.com' 
      },
      vwo: { 
        name: 'VWO', 
        patterns: [/visualwebsiteoptimizer\.com|vwo_|dev\.visualwebsiteoptimizer/i],
        icon: 'a-b-testing', 
        website: 'https://vwo.com' 
      },
      launchdarkly: { 
        name: 'LaunchDarkly', 
        patterns: [/launchdarkly\.com|ld\.js|app\.launchdarkly/i],
        icon: 'a-b-testing', 
        website: 'https://launchdarkly.com' 
      },
      abtasty: { 
        name: 'AB Tasty', 
        patterns: [/abtasty\.com|try\.abtasty/i],
        icon: 'a-b-testing', 
        website: 'https://abtasty.com' 
      },
      dynamicyield: { 
        name: 'Dynamic Yield', 
        patterns: [/dynamicyield\.com|cdn\.dynamicyield|dy\.js/i],
        icon: 'a-b-testing', 
        website: 'https://dynamicyield.com' 
      },
      kameleoon: { 
        name: 'Kameleoon', 
        patterns: [/kameleoon\.com|kameleoon\.eu/i],
        icon: 'a-b-testing', 
        website: 'https://kameleoon.com' 
      },
      convert: { 
        name: 'Convert', 
        patterns: [/cdn\.convertexperiments\.com|convert\.com/i],
        icon: 'a-b-testing', 
        website: 'https://convert.com' 
      },
      splitio: { 
        name: 'Split.io', 
        patterns: [/split\.io|cdn\.split\.io/i],
        icon: 'a-b-testing', 
        website: 'https://split.io' 
      },
      statsig: { 
        name: 'Statsig', 
        patterns: [/statsig\.com|cdn\.statsig/i],
        icon: 'a-b-testing', 
        website: 'https://statsig.com' 
      },
      eppo: { 
        name: 'Eppo', 
        patterns: [/eppo\.cloud|geteppo\.com/i],
        icon: 'a-b-testing', 
        website: 'https://geteppo.com' 
      },
      conductrics: { 
        name: 'Conductrics', 
        patterns: [/conductrics\.com/i],
        icon: 'a-b-testing', 
        website: 'https://conductrics.com' 
      }
    }
  },
  fonts: {
    name: 'Fonts & Typography',
    icon: '🔤',
    technologies: {
      googlefonts: { 
        name: 'Google Fonts', 
        patterns: [/fonts\.googleapis\.com|fonts\.gstatic\.com/i],
        icon: 'font', 
        website: 'https://fonts.google.com' 
      },
      typekit: { 
        name: 'Adobe Fonts', 
        patterns: [/use\.typekit\.net|typekit\.com/i],
        icon: 'font', 
        website: 'https://fonts.adobe.com' 
      },
      fontawesome: { 
        name: 'Font Awesome', 
        patterns: [/fontawesome|kit\.fontawesome|fa-[a-z]/i],
        versionPatterns: [/fontawesome.*?(\d+\.\d+\.\d+)/i],
        icon: 'font', 
        website: 'https://fontawesome.com' 
      }
    }
  },
  media: {
    name: 'Video & Media',
    icon: '🎬',
    technologies: {
      youtube: { 
        name: 'YouTube', 
        patterns: [/youtube\.com\/embed|youtube-nocookie\.com|ytimg\.com/i],
        icon: 'video', 
        website: 'https://youtube.com' 
      },
      vimeo: { 
        name: 'Vimeo', 
        patterns: [/player\.vimeo\.com|vimeocdn\.com/i],
        icon: 'video', 
        website: 'https://vimeo.com' 
      },
      wistia: { 
        name: 'Wistia', 
        patterns: [/wistia\.com|wistia\.net|fast\.wistia/i],
        icon: 'video', 
        website: 'https://wistia.com' 
      },
      vidyard: { 
        name: 'Vidyard', 
        patterns: [/vidyard\.com|play\.vidyard/i],
        icon: 'video', 
        website: 'https://vidyard.com' 
      },
      jwplayer: { 
        name: 'JW Player', 
        patterns: [/jwplayer\.com|jwplatform\.com|jwpcdn/i],
        icon: 'video', 
        website: 'https://jwplayer.com' 
      }
    }
  },
  maps: {
    name: 'Maps & Location',
    icon: '🗺️',
    technologies: {
      googlemaps: { 
        name: 'Google Maps', 
        patterns: [/maps\.googleapis\.com|maps\.google\.com/i],
        icon: 'maps', 
        website: 'https://developers.google.com/maps' 
      },
      mapbox: { 
        name: 'Mapbox', 
        patterns: [/api\.mapbox\.com|mapbox-gl/i],
        icon: 'maps', 
        website: 'https://mapbox.com' 
      },
      openstreetmap: { 
        name: 'OpenStreetMap', 
        patterns: [/openstreetmap\.org|tile\.osm/i],
        icon: 'maps', 
        website: 'https://openstreetmap.org' 
      }
    }
  },
  server: {
    name: 'Backend Technologies',
    icon: '🖥️',
    technologies: {
      nodejs: { 
        name: 'Node.js', 
        patterns: [/x-powered-by.*express|node\.js/i],
        icon: 'server', 
        website: 'https://nodejs.org' 
      },
      php: { 
        name: 'PHP', 
        patterns: [/\.php[?#]|x-powered-by.*php/i],
        versionPatterns: [/PHP\/(\d+\.\d+\.\d+)/i],
        icon: 'server', 
        website: 'https://php.net' 
      },
      aspnet: { 
        name: 'ASP.NET', 
        patterns: [/asp\.net|__viewstate|aspnetcore/i],
        icon: 'server', 
        website: 'https://dotnet.microsoft.com/apps/aspnet' 
      },
      rails: { 
        name: 'Ruby on Rails', 
        patterns: [/x-powered-by.*phusion|rails|csrf-token/i],
        icon: 'server', 
        website: 'https://rubyonrails.org' 
      },
      django: { 
        name: 'Django', 
        patterns: [/csrfmiddlewaretoken|djdt|django/i],
        icon: 'server', 
        website: 'https://djangoproject.com' 
      },
      laravel: { 
        name: 'Laravel', 
        patterns: [/laravel_session|x-powered-by.*laravel/i],
        icon: 'server', 
        website: 'https://laravel.com' 
      },
      elementor: { 
        name: 'Elementor', 
        patterns: [/elementor|elementor-widget/i],
        versionPatterns: [/elementor.*?ver=(\d+\.\d+\.\d+)/i],
        icon: 'cms', 
        website: 'https://elementor.com' 
      }
    }
  }
};
// ============================================================================
// 2. MAIN APPLICATION CLASS
// ============================================================================
/**
 * TrackerDetective - Main application controller
 * Manages all UI interactions and feature modules
 */
class TrackerDetective {
  constructor() {
    this.tabId = null;
    this.trackers = null;
    this.dlEntries = [];
    this.filteredDl = [];
    this.storageType = 'local';
    this.storageData = {};
    this.storageFilter = '';
    this.cookiesData = {};
    this.techSearchQuery = '';
    this.selectedDlEntry = null;
    this.gtmSites = [];
    this.generatedVarCode = '';
    this.generatedEcomCode = '';
    this.livePreviewTimeout = null;
    this.liveValueTimeout = null;
    this.ecomLiveValueTimeouts = {};
    // Tech Stack (Wappalyzer) properties
    this.detectedTechs = {};
    this.filteredTechs = {};
    this.techSearchQuery = '';
    // Tic Tac Toe game state
    this.tttBoard = Array(9).fill(null);
    this.tttCurrentPlayer = 'X';
    this.tttGameOver = false;
    this.init();
  }
  async init() {
    this.initTheme();
    this.cacheElements();
    this.bindEvents();
    await this.loadGtmSettings();
    await this.loadData();
  }
  // Theme Management
  initTheme() {
    const savedTheme = localStorage.getItem('insighter-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('insighter-theme', newTheme);
    this.updateThemeIcon(newTheme);
  }
  updateThemeIcon(theme) {
    const darkIcon = document.querySelector('.theme-icon-dark');
    const lightIcon = document.querySelector('.theme-icon-light');
    if (darkIcon && lightIcon) {
      if (theme === 'light') {
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
      } else {
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
      }
    }
  }
  cacheElements() {
    this.el = {
      url: document.getElementById('currentUrl'),
      refreshBtn: document.getElementById('refreshBtn'),
      statTrackers: document.getElementById('statTrackers'),
      statIds: document.getElementById('statIds'),
      statEvents: document.getElementById('statEvents'),
      trackerList: document.getElementById('trackerList'),
      dlSearch: document.getElementById('dlSearch'),
      dlCount: document.getElementById('dlCount'),
      dlList: document.getElementById('dlList'),
      dlEventName: document.getElementById('dlEventName'),
      dlPushBtn: document.getElementById('dlPushBtn'),
      dlCopyAll: document.getElementById('dlCopyAll'),
      storageList: document.getElementById('storageList'),
      storageKey: document.getElementById('storageKey'),
      storageValue: document.getElementById('storageValue'),
      dlModal: document.getElementById('dlModal'),
      modalBadge: document.getElementById('modalBadge'),
      modalTitle: document.getElementById('modalTitle'),
      flatView: document.getElementById('flatView'),
      jsonView: document.getElementById('jsonView'),
      codeView: document.getElementById('codeView'),
      // GTM Settings
      gtmSitesList: document.getElementById('gtmSitesList'),
      gtmSiteUrl: document.getElementById('gtmSiteUrl'),
      gtmContainerId: document.getElementById('gtmContainerId'),
      gtmAddSite: document.getElementById('gtmAddSite'),
      gtmSaveHint: document.getElementById('gtmSaveHint'),
      quickGtmId: document.getElementById('quickGtmId'),
      quickInjectBtn: document.getElementById('quickInjectBtn'),
      // Shopify Custom Pixel
      customPixelDataLayer: document.getElementById('customPixelDataLayer'),
      shopifyGtmPreview: document.getElementById('shopifyGtmPreview'),
      // Tech Stack elements
      techSearch: document.getElementById('techSearch'),
      techCount: document.getElementById('techCount'),
      techRescan: document.getElementById('techRescan'),
      techCategories: document.getElementById('techCategories'),
      techEmptyState: document.getElementById('techEmptyState'),
      tictactoeContainer: document.getElementById('tictactoeContainer'),
      tictactoeBoard: document.getElementById('tictactoeBoard'),
      tictactoeStatus: document.getElementById('tictactoeStatus'),
      tictactoeReset: document.getElementById('tictactoeReset'),
      // Quick Checks elements
      utmContent: document.getElementById('utmContent'),
      utmRefresh: document.getElementById('utmRefresh'),
      consentContent: document.getElementById('consentContent'),
      consentRefresh: document.getElementById('consentRefresh'),
      // Network tab elements
      networkContent: document.getElementById('networkContent'),
      networkStats: document.getElementById('networkStats'),
      networkRefresh: document.getElementById('networkRefresh'),
      networkClear: document.getElementById('networkClear'),
      networkFilter: document.getElementById('networkFilter'),
      // Event Inspector elements
      eventInspectorList: document.getElementById('eventInspectorList'),
      eventCount: document.getElementById('eventCount'),
      eventPlatformFilter: document.getElementById('eventPlatformFilter'),
      captureEventsBtn: document.getElementById('captureEventsBtn'),
      clearEventsBtn: document.getElementById('clearEventsBtn')
    };
    
    // Initialize captured events arrays
    this.capturedEvents = [];
    this.filteredEvents = [];
  }
  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    // Refresh
    this.el.refreshBtn.addEventListener('click', () => this.refresh());
    // Theme Toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
    // DataLayer
    this.el.dlSearch.addEventListener('input', () => this.filterDataLayer());
    this.el.dlPushBtn.addEventListener('click', () => this.pushEvent());
    this.el.dlCopyAll?.addEventListener('click', () => this.copyAllDataLayer());
    // Storage tabs
    document.querySelectorAll('.storage-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchStorage(tab.dataset.storage));
    });
    document.getElementById('storageRefresh').addEventListener('click', () => this.loadStorage());
    document.getElementById('storageClear').addEventListener('click', () => this.clearStorage());
    document.getElementById('storageAdd').addEventListener('click', () => this.addStorageItem());
    document.getElementById('storageFilter').addEventListener('input', (e) => this.filterStorage(e.target.value));
    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal('dlModal'));
    
    this.el.dlModal.addEventListener('click', (e) => {
      if (e.target === this.el.dlModal) this.closeModal('dlModal');
    });
    // Modal tabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchModalView(tab.dataset.view));
    });
    // Modal actions
    document.getElementById('copyData').addEventListener('click', () => this.copySelectedData());
    document.getElementById('replayEvent').addEventListener('click', () => this.replayEvent());
    // GTM Injector
    this.el.gtmAddSite?.addEventListener('click', () => this.addGtmSite());
    this.el.quickInjectBtn?.addEventListener('click', () => this.quickInjectGtm());
    
    // Shopify Custom Pixel settings
    this.el.customPixelDataLayer?.addEventListener('change', () => this.saveShopifySettings());
    this.el.shopifyGtmPreview?.addEventListener('change', () => this.saveShopifySettings());
    // Auto-save GTM inputs
    this.el.gtmSiteUrl?.addEventListener('input', () => this.autoSaveGtmInputs());
    this.el.gtmContainerId?.addEventListener('input', () => this.autoSaveGtmInputs());
    this.el.quickGtmId?.addEventListener('input', () => this.autoSaveQuickGtm());
    // JS Formula cards - expand/collapse
    document.querySelectorAll('.formula-header').forEach(header => {
      header.addEventListener('click', () => {
        const formulaId = header.dataset.formula;
        const content = document.getElementById(`formula-${formulaId}`);
        if (content) {
          content.classList.toggle('active');
          // Close other formulas
          document.querySelectorAll('.formula-content').forEach(c => {
            if (c.id !== `formula-${formulaId}`) c.classList.remove('active');
          });
        }
      });
    });
    // JS Formula copy buttons
    document.querySelectorAll('.formula-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btn.dataset.code.replace(/\\n/g, '\n');
        navigator.clipboard.writeText(code);
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy', 1000);
      });
    });
    // Listen for updates
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'TRACKER_UPDATE') {
        this.mergeTrackers(msg.data);
        this.renderTrackers();
      }
      if (msg.type === 'DL_PUSH') {
        this.addDlEntry(msg.entry);
      }
    });
    // Tech Stack event bindings
    this.el.techSearch?.addEventListener('input', () => this.filterTechStack());
    this.el.techRescan?.addEventListener('click', () => this.scanTechStack());
    
    // Tic Tac Toe event bindings
    this.el.tictactoeBoard?.querySelectorAll('.ttt-cell').forEach(cell => {
      cell.addEventListener('click', () => this.handleTTTClick(parseInt(cell.dataset.cell)));
    });
    this.el.tictactoeReset?.addEventListener('click', () => this.resetTTT());
    // Quick Checks event bindings
    this.el.utmRefresh?.addEventListener('click', () => this.checkUTMParams());
    this.el.consentRefresh?.addEventListener('click', () => {
      this.lastConsentValue = null; // Force re-render
      this.checkConsent(false);
    });
    
    // Network tab event bindings
    this.el.networkRefresh?.addEventListener('click', () => this.refreshNetworkMonitor());
    this.el.networkClear?.addEventListener('click', () => this.clearNetworkMonitor());
    this.el.networkFilter?.addEventListener('input', () => this.filterNetworkRequests());
    
    // URL Parser event bindings
    document.getElementById('toggleUrlParser')?.addEventListener('click', () => this.toggleUrlParser());
    document.getElementById('closeUrlParser')?.addEventListener('click', () => this.toggleUrlParser(false));
    document.getElementById('parseUrlBtn')?.addEventListener('click', () => this.parseUrl());
    document.getElementById('clearUrlParser')?.addEventListener('click', () => this.clearUrlParser());
    
    // Event Inspector bindings
    this.el.captureEventsBtn?.addEventListener('click', () => this.captureEventParameters());
    this.el.clearEventsBtn?.addEventListener('click', () => this.clearCapturedEvents());
    this.el.eventPlatformFilter?.addEventListener('change', () => this.filterCapturedEvents());
  }
  switchTab(tabId) {
    // Stop consent polling when leaving quickchecks tab
    if (tabId !== 'quickchecks') {
      this.stopConsentPolling();
    }
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.nav-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-panel`).classList.add('active');
    // Load data for specific tabs
    if (tabId === 'hacks') this.loadStorage();
    if (tabId === 'techstack' && Object.keys(this.detectedTechs).length === 0) this.scanTechStack();
    if (tabId === 'quickchecks') this.loadQuickChecks();
    if (tabId === 'network') this.loadNetworkTab();
    if (tabId === 'events') this.autoLoadEvents();
  }
  // Auto-load events when Events tab is opened
  async autoLoadEvents() {
    // Show loading state
    const container = this.el.eventInspectorList;
    if (container && this.capturedEvents.length === 0) {
      container.innerHTML = `
        <div class="event-empty-state">
          <div class="event-empty-icon">⏳</div>
          <p>Loading event parameters...</p>
          <small>Capturing GA4, Meta, Google Ads & more</small>
        </div>
      `;
    }
    
    // Auto-capture events
    await this.captureEventParameters();
  }
  // === DATA LOADING ===
  async loadData() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url || tab.url.startsWith('chrome')) {
        this.el.url.textContent = 'Cannot scan this page';
        return;
      }
      this.tabId = tab.id;
      const hostname = new URL(tab.url).hostname;
      this.el.url.textContent = hostname;
      
      // Start fresh but don't clear background pixel events
      this.trackers = null;
      this.dlEntries = [];
      
      // Request data from content.js
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_DATA' });
        if (response?.trackers) {
          this.mergeTrackers(response.trackers);
          this.renderTrackers();
        }
        if (response?.dlEntries?.length) {
          this.mergeDlEntries(response.dlEntries);
        }
      } catch (e) {
        // Inject if needed
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        setTimeout(async () => {
          try {
            const r = await chrome.tabs.sendMessage(tab.id, { type: 'GET_DATA' });
            if (r?.trackers) { this.mergeTrackers(r.trackers); this.renderTrackers(); }
            if (r?.dlEntries?.length) this.mergeDlEntries(r.dlEntries);
          } catch (e2) {}
        }, 1000);
      }
      // =====================================================
      // Get PIXEL events from background.js (network monitoring)
      // This captures Meta, TikTok, Snapchat, etc. from network requests
      // =====================================================
      try {
        const bgPixelResponse = await chrome.runtime.sendMessage({ type: 'GET_PIXEL_EVENTS', tabId: tab.id });
        if (bgPixelResponse?.events?.length) {
          const trackersFromNetwork = this.convertPixelEventsToTrackers(bgPixelResponse.events);
          this.mergeTrackers(trackersFromNetwork);
          this.renderTrackers();
        }
      } catch (e) {
        console.log('Pixel events from background.js:', e);
      }
      // =====================================================
      // Get SST events from background.js
      // =====================================================
      try {
        const sstResponse = await chrome.runtime.sendMessage({ type: 'GET_SST_EVENTS', tabId: tab.id });
        if (sstResponse?.events?.length) {
          const trackersFromSST = this.convertSSTEventsToTrackers(sstResponse.events);
          this.mergeTrackers(trackersFromSST);
          this.renderTrackers();
        }
      } catch (e) {
        console.log('SST events from background.js:', e);
      }
      // =====================================================
      // Get Shopify Custom Pixel dataLayer
      // =====================================================
      try {
        const shopifySettings = await chrome.storage.sync.get(['customPixelDataLayer']);
        const isEnabledCustomPixel = shopifySettings.customPixelDataLayer !== 0 && shopifySettings.customPixelDataLayer !== false;
        
        if (isEnabledCustomPixel) {
          const shopifyResponse = await chrome.runtime.sendMessage({ type: 'GET_SHOPIFY_DATALAYER' });
          if (shopifyResponse && Array.isArray(shopifyResponse)) {
            shopifyResponse.forEach(frameData => {
              if (frameData?.dataLayer?.length) {
                // Convert Shopify dataLayer entries to our format
                frameData.dataLayer.forEach((item, idx) => {
                  if (item && typeof item === 'object') {
                    const eventName = item.event || (item[0] === 'event' ? item[1] : null);
                    const entry = {
                      index: this.dlEntries.length + idx + 1,
                      timestamp: Date.now(),
                      event: eventName,
                      type: this.getDLTypeFromEvent(eventName),
                      data: item,
                      source: 'shopify-custom-pixel'
                    };
                    if (!this.isInternalTagAssistantEvent(entry)) {
                      this.dlEntries.push(entry);
                    }
                  }
                });
              }
            });
            this.dlEntries.sort((a, b) => a.index - b.index);
            this.filterDataLayer();
          }
        }
      } catch (e) {
        console.log('Shopify Custom Pixel dataLayer:', e);
      }
    } catch (e) {
      console.error(e);
    }
  }
  // Helper to get dataLayer type from event name
  getDLTypeFromEvent(eventName) {
    if (!eventName) return 'data';
    if (typeof eventName === 'string') {
      if (eventName.startsWith('gtm.')) return 'gtm';
      if (eventName.startsWith('config:') || eventName.startsWith('set:') || eventName.startsWith('consent:') || eventName === 'gtag:init') return 'gtag';
      if (['purchase','add_to_cart','view_item','begin_checkout','view_item_list','select_item','add_payment_info','add_shipping_info','remove_from_cart','view_cart','add_to_wishlist','generate_lead'].includes(eventName)) return 'ecommerce';
    }
    return 'custom';
  }
  // Convert background.js pixel events to tracker format
  convertPixelEventsToTrackers(events) {
    const platformToTracker = {
      meta: 'facebookPixel',
      facebook: 'facebookPixel',
      tiktok: 'tiktok',
      snapchat: 'snapchat',
      pinterest: 'pinterest',
      reddit: 'reddit',
      twitter: 'twitter',
      linkedin: 'linkedin',
      bing: 'bingAds',
      googleads: 'googleAds',
      ga4: 'ga4'
    };
    const trackers = {};
    
    events.forEach(event => {
      const trackerKey = platformToTracker[event.platform];
      if (!trackerKey) return;
      
      if (!trackers[trackerKey]) {
        trackers[trackerKey] = { found: true, ids: [], events: [] };
      }
      
      trackers[trackerKey].found = true;
      
      // Extract pixel ID from params
      const pixelId = event.params?.pixel_id || event.params?.tag_id || event.params?.partner_id || event.params?.measurement_id;
      if (pixelId && !trackers[trackerKey].ids.includes(String(pixelId))) {
        trackers[trackerKey].ids.push(String(pixelId));
      }
      
      // Add event name
      const eventName = event.eventName || event.event;
      if (eventName && !trackers[trackerKey].events.includes(eventName)) {
        trackers[trackerKey].events.push(eventName);
      }
    });
    
    return trackers;
  }
  // Convert SST events to tracker format (for GA4 SST)
  convertSSTEventsToTrackers(events) {
    const trackers = {};
    
    events.forEach(event => {
      if (!trackers.ga4) {
        trackers.ga4 = { found: true, ids: [], events: [] };
      }
      
      trackers.ga4.found = true;
      
      // Extract measurement ID
      const measurementId = event.params?.measurement_id;
      if (measurementId && !trackers.ga4.ids.includes(measurementId)) {
        trackers.ga4.ids.push(measurementId);
      }
      
      // Add event name
      const eventName = event.eventName || event.params?.event_name;
      if (eventName && !trackers.ga4.events.includes(eventName)) {
        trackers.ga4.events.push(eventName);
      }
    });
    
    return trackers;
  }
  mergeTrackers(newData) {
    if (!this.trackers) { this.trackers = newData; return; }
    Object.keys(newData).forEach(key => {
      if (!this.trackers[key]) {
        this.trackers[key] = newData[key];
      } else {
        if (newData[key].found) this.trackers[key].found = true;
        this.trackers[key].ids = [...new Set([...(this.trackers[key].ids || []), ...(newData[key].ids || [])])];
        this.trackers[key].events = [...new Set([...(this.trackers[key].events || []), ...(newData[key].events || [])])];
      }
    });
  }
  // Check if event is internal Tag Assistant event that should be hidden
  isInternalTagAssistantEvent(entry) {
    const eventName = entry?.event;
    if (!eventName || typeof eventName !== 'string') return false;
    // Filter Tag Assistant internal events
    if (eventName.startsWith('connection__')) return true;
    if (eventName.startsWith('tag_assistant__')) return true;
    if (eventName.startsWith('debug__')) return true;
    if (eventName.startsWith('worker__')) return true;
    if (eventName.startsWith('auth')) return true;
    if (eventName.startsWith('load_source__')) return true;
    if (eventName === 'consent__default') return true;
    if (eventName === 'consent__update') return true;
    return false;
  }
  mergeDlEntries(entries) {
    entries.forEach(e => {
      // Skip Tag Assistant internal events
      if (this.isInternalTagAssistantEvent(e)) return;
      if (!this.dlEntries.some(x => x.index === e.index)) {
        this.dlEntries.push(e);
      }
    });
    this.dlEntries.sort((a, b) => a.index - b.index);
    this.filterDataLayer();
  }
  addDlEntry(entry) {
    // Skip Tag Assistant internal events
    if (this.isInternalTagAssistantEvent(entry)) return;
    if (this.dlEntries.some(e => e.index === entry.index)) return;
    this.dlEntries.push(entry);
    this.dlEntries.sort((a, b) => a.index - b.index);
    this.filterDataLayer();
  }
  async refresh() {
    this.el.refreshBtn.classList.add('spinning');
    let refreshSuccess = false;
    let dataUpdated = false;
    
    try {
      // Get data from content.js
      const response = await chrome.tabs.sendMessage(this.tabId, { type: 'RESCAN' });
      if (response?.trackers) {
        this.mergeTrackers(response.trackers);
        this.renderTrackers();
        refreshSuccess = true;
        dataUpdated = true;
      }
    } catch (e) {
      console.log('Refresh: Content script error, trying to reinject...', e);
      // Try to reinject content script if it's not responding
      try {
        await chrome.scripting.executeScript({
          target: { tabId: this.tabId },
          files: ['content.js']
        });
        // Wait a bit and try again
        await new Promise(r => setTimeout(r, 300));
        const retryResponse = await chrome.tabs.sendMessage(this.tabId, { type: 'RESCAN' });
        if (retryResponse?.trackers) {
          this.mergeTrackers(retryResponse.trackers);
          this.renderTrackers();
          refreshSuccess = true;
          dataUpdated = true;
        }
      } catch (reinjectError) {
        console.log('Refresh: Reinject failed', reinjectError);
      }
    }
    
    // Get PIXEL events from background.js (network monitoring)
    try {
      const bgPixelResponse = await chrome.runtime.sendMessage({ type: 'GET_PIXEL_EVENTS', tabId: this.tabId });
      if (bgPixelResponse?.events?.length) {
        const trackersFromNetwork = this.convertPixelEventsToTrackers(bgPixelResponse.events);
        this.mergeTrackers(trackersFromNetwork);
        this.renderTrackers();
        refreshSuccess = true;
        dataUpdated = true;
      }
    } catch (e) {}
    
    // Get SST events from background.js
    try {
      const sstResponse = await chrome.runtime.sendMessage({ type: 'GET_SST_EVENTS', tabId: this.tabId });
      if (sstResponse?.events?.length) {
        const trackersFromSST = this.convertSSTEventsToTrackers(sstResponse.events);
        this.mergeTrackers(trackersFromSST);
        this.renderTrackers();
        refreshSuccess = true;
        dataUpdated = true;
      }
    } catch (e) {}
    
    // Visual feedback with toast
    setTimeout(() => {
      this.el.refreshBtn.classList.remove('spinning');
      if (refreshSuccess) {
        this.showToast('✅ Data refreshed successfully!', 'success');
      } else {
        this.showToast('⚠️ Could not refresh. Try reloading the page.', 'warning');
      }
    }, 700);
  }
  
  // Show toast notification
  showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.insighter-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `insighter-toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 2.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
  // === TRACKERS TAB ===
  renderTrackers() {
    if (!this.trackers) return;
    // Save expanded state before re-render
    const expandedTrackers = new Set();
    this.el.trackerList.querySelectorAll('.tracker-card.expanded').forEach(card => {
      const trackerKey = card.dataset.tracker;
      if (trackerKey) expandedTrackers.add(trackerKey);
    });
    let found = 0, ids = 0, events = 0;
    Object.values(this.trackers).forEach(t => {
      if (t.found) found++;
      ids += t.ids?.length || 0;
      events += t.events?.length || 0;
    });
    this.el.statTrackers.textContent = found;
    this.el.statIds.textContent = ids;
    this.el.statEvents.textContent = events;
    // Update badge to match found trackers count
    this.updateBadgeCount(found);
    const order = Object.keys(TRACKERS).sort((a, b) => {
      return (this.trackers[b]?.found ? 1 : 0) - (this.trackers[a]?.found ? 1 : 0);
    });
    this.el.trackerList.innerHTML = order.map(key => {
      const t = this.trackers[key] || { found: false, ids: [], events: [] };
      const cfg = TRACKERS[key];
      // Restore expanded state
      const isExpanded = expandedTrackers.has(key) ? 'expanded' : '';
      return `
        <div class="tracker-card ${t.found ? '' : 'inactive'} ${isExpanded}" data-tracker="${key}">
          <div class="tracker-head">
            <div class="tracker-icon ${cfg.icon}">${this.getTrackerLogo(key)}</div>
            <div class="tracker-info">
              <h4>${cfg.name}</h4>
              <span class="tracker-meta">${t.ids?.length || 0} IDs · ${t.events?.length || 0} events</span>
            </div>
            <span class="tracker-status ${t.found ? 'found' : 'not-found'}">${t.found ? 'Found' : 'Not Found'}</span>
            ${t.found ? '<svg class="tracker-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' : ''}
          </div>
          ${t.found ? this.renderTrackerBody(t) : ''}
        </div>
      `;
    }).join('');
    // Expand handlers - click to toggle, stays open until clicked again
    this.el.trackerList.querySelectorAll('.tracker-card:not(.inactive) .tracker-head').forEach(head => {
      head.addEventListener('click', (e) => {
        // Don't toggle if clicking on copy button
        if (e.target.closest('.copy-btn')) return;
        head.parentElement.classList.toggle('expanded');
      });
    });
    // Copy handlers
    this.el.trackerList.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '⎘', 1000);
      });
    });
  }
  // Update extension badge to show found trackers count
  updateBadgeCount(count) {
    try {
      chrome.runtime.sendMessage({ 
        type: 'UPDATE_BADGE', 
        tabId: this.tabId, 
        count: count 
      });
    } catch (e) {}
  }
  // Get official tracker logo - Using uploaded official brand images
  getTrackerLogo(tracker) {
    const logoImages = {
      gtm: 'logos/gtm.png',
      ga4: 'logos/ga4.svg',
      facebookPixel: 'logos/meta.png',
      googleAds: 'logos/googleads.png',
      linkedin: 'logos/linkedin.png',
      bingAds: 'logos/bing.png',
      tiktok: 'logos/tiktok.png',
      pinterest: 'logos/pinterest.png',
      twitter: 'logos/twitter.png',
      snapchat: 'logos/snapchat.png',
      reddit: 'logos/reddit.png'
    };
    
    if (logoImages[tracker]) {
      return `<img src="${logoImages[tracker]}" alt="${TRACKERS[tracker]?.name || tracker}" class="tracker-logo-img">`;
    }
    return `<span class="tracker-short">${TRACKERS[tracker]?.short || '?'}</span>`;
  }
  renderTrackerBody(tracker) {
    return `
      <div class="tracker-body">
        <div class="detail-section">
          <div class="detail-label">Tracking IDs</div>
          <div class="ids-list">
            ${tracker.ids?.length ? tracker.ids.map(id => `
              <div class="id-row"><span>${this.esc(id)}</span><button class="copy-btn" data-copy="${this.esc(id)}">⎘</button></div>
            `).join('') : '<div class="empty-text">No IDs detected</div>'}
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Events Captured</div>
          <div class="events-list">
            ${tracker.events?.length ? tracker.events.map(ev => `<span class="event-tag">${this.esc(ev)}</span>`).join('') : '<div class="empty-text">No events captured</div>'}
          </div>
        </div>
      </div>
    `;
  }
  // === DATALAYER TAB ===
  filterDataLayer() {
    const search = this.el.dlSearch.value.toLowerCase().trim();
    this.filteredDl = search 
      ? this.dlEntries.filter(e => (e.event || '').toLowerCase().includes(search))
      : [...this.dlEntries];
    this.renderDataLayer();
  }
  renderDataLayer() {
    this.el.dlCount.textContent = this.dlEntries.length;
    
    if (!this.filteredDl.length) {
      this.el.dlList.innerHTML = '<div class="empty-state">No dataLayer activity</div>';
      return;
    }
    this.el.dlList.innerHTML = [...this.filteredDl].reverse().map(entry => `
      <div class="dl-item" data-index="${entry.index}">
        <span class="dl-badge ${entry.type || 'data'}">${entry.index}</span>
        <span class="dl-event">${this.esc(this.formatEventName(entry.event, entry.data))}</span>
        <button class="dl-copy-btn" data-index="${entry.index}" title="Copy JSON">⎘</button>
      </div>
    `).join('');
    this.el.dlList.querySelectorAll('.dl-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('dl-copy-btn')) return;
        const entry = this.dlEntries.find(e => e.index === parseInt(item.dataset.index));
        if (entry) this.openDlModal(entry);
      });
    });
    
    // Copy buttons
    this.el.dlList.querySelectorAll('.dl-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const entry = this.dlEntries.find(ent => ent.index === parseInt(btn.dataset.index));
        if (entry) {
          navigator.clipboard.writeText(JSON.stringify(entry.data, null, 2));
          btn.textContent = '✓';
          setTimeout(() => btn.textContent = '⎘', 1000);
        }
      });
    });
  }
  copyAllDataLayer() {
    if (!this.dlEntries.length) {
      alert('No dataLayer entries to copy');
      return;
    }
    
    const allData = this.dlEntries.map(e => e.data);
    navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
    
    if (this.el.dlCopyAll) {
      this.el.dlCopyAll.textContent = '✓ Copied';
      setTimeout(() => this.el.dlCopyAll.textContent = '⎘ All', 1500);
    }
  }
  async pushEvent() {
    const eventName = this.el.dlEventName.value.trim();
    if (!eventName) return;
    
    try {
      await chrome.tabs.sendMessage(this.tabId, { 
        type: 'DL_PUSH', 
        data: { event: eventName } 
      });
      this.el.dlEventName.value = '';
    } catch (e) {}
  }
  openDlModal(entry) {
    this.selectedDlEntry = entry;
    this.el.modalBadge.textContent = entry.index;
    this.el.modalBadge.className = `modal-badge ${entry.type || 'data'}`;
    this.el.modalTitle.textContent = this.formatEventName(entry.event, entry.data);
    // Clean professional view - Event info first, then parameters table
    const eventName = this.formatEventName(entry.event, entry.data);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    let html = `
      <div class="dl-detail-view">
        <!-- Event Header -->
        <div class="dl-event-header">
          <div class="dl-event-name">${this.esc(eventName)}</div>
          <div class="dl-event-meta">
            <span class="dl-event-time">⏱️ ${timestamp}</span>
            <span class="dl-event-type ${entry.type || 'data'}">${(entry.type || 'data').toUpperCase()}</span>
          </div>
        </div>
        
        <!-- Parameters Table -->
        <div class="dl-params-section">
          <div class="dl-params-header">
            <span>Parameters</span>
            <button class="dl-copy-all-btn" title="Copy all as JSON">📋 Copy JSON</button>
          </div>
          <table class="dl-params-table">
            <tbody>
              ${this.renderParamsTable(entry.data, '')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    this.el.flatView.innerHTML = html;
    
    // Copy all JSON button
    const copyAllBtn = this.el.flatView.querySelector('.dl-copy-all-btn');
    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(entry.data, null, 2));
        copyAllBtn.textContent = '✓ Copied!';
        setTimeout(() => copyAllBtn.textContent = '📋 Copy JSON', 1000);
      });
    }
    
    // Expandable rows
    this.el.flatView.querySelectorAll('.dl-param-expandable').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.dl-param-copy') || e.target.closest('.dl-param-copy-path') || e.target.closest('.dl-key-text')) return;
        const childRows = this.el.flatView.querySelectorAll(`.dl-param-child[data-parent="${row.dataset.path}"]`);
        const isExpanded = row.classList.contains('expanded');
        row.classList.toggle('expanded');
        row.querySelector('.dl-expand-icon').textContent = isExpanded ? '▶' : '▼';
        childRows.forEach(child => {
          child.style.display = isExpanded ? 'none' : 'table-row';
        });
      });
    });
    
    // Copy path buttons
    this.el.flatView.querySelectorAll('.dl-param-copy-path').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.path);
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '⎘', 800);
      });
    });
    
    // Clickable key text to copy path
    this.el.flatView.querySelectorAll('.dl-key-text').forEach(span => {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(span.dataset.path);
        span.classList.add('copied');
        setTimeout(() => span.classList.remove('copied'), 800);
      });
    });
    
    // Copy value buttons
    this.el.flatView.querySelectorAll('.dl-param-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = btn.dataset.value;
        try {
          const parsed = JSON.parse(value);
          navigator.clipboard.writeText(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
        } catch {
          navigator.clipboard.writeText(value);
        }
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '📋', 800);
      });
    });
    // JSON tree view with copy buttons for objects/arrays
    this.el.jsonView.innerHTML = `<div class="json-tree">${this.renderJsonTree(entry.data, '')}</div>`;
    
    // Add click handlers for JSON tree copy buttons
    this.el.jsonView.querySelectorAll('.json-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = btn.dataset.path;
        const value = this.getValueByPath(entry.data, path);
        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '⎘', 500);
      });
    });
    
    // Toggle expand/collapse
    this.el.jsonView.querySelectorAll('.json-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        if (content) {
          content.classList.toggle('collapsed');
          toggle.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
        }
      });
    });
    // Code view
    this.el.codeView.innerHTML = `<div class="code-view">// Copy this to push the same event
dataLayer.push(${JSON.stringify(entry.data, null, 2)});</div>`;
    this.switchModalView('flat');
    this.el.dlModal.classList.add('open');
  }
  
  // Render parameters as clean table rows
  renderParamsTable(data, parentPath, depth = 0) {
    if (data === null || data === undefined) return '';
    
    let rows = '';
    const entries = Array.isArray(data) 
      ? data.map((v, i) => [i, v])
      : Object.entries(data);
    
    for (const [key, value] of entries) {
      const path = parentPath ? `${parentPath}.${key}` : String(key);
      const indent = depth * 20;
      const isExpandable = value !== null && typeof value === 'object';
      const displayKey = String(key);
      
      if (isExpandable) {
        const isArray = Array.isArray(value);
        const count = isArray ? value.length : Object.keys(value).length;
        const typeLabel = isArray ? `Array[${count}]` : `Object{${count}}`;
        const typeClass = isArray ? 'type-array' : 'type-object';
        
        rows += `
          <tr class="dl-param-expandable expanded" data-path="${this.esc(path)}">
            <td class="dl-param-key" style="padding-left: ${indent + 8}px">
              <span class="dl-expand-icon">▼</span>
              <span class="dl-key-text" data-path="${this.esc(path)}" title="Click to copy path">${this.esc(displayKey)}</span>
            </td>
            <td class="dl-param-value">
              <span class="dl-param-type ${typeClass}">${typeLabel}</span>
            </td>
            <td class="dl-param-actions">
              <button class="dl-param-copy-path" data-path="${this.esc(path)}" title="Copy path">⎘</button>
              <button class="dl-param-copy" data-value="${this.esc(JSON.stringify(value))}" title="Copy value">📋</button>
            </td>
          </tr>
        `;
        
        // Render children
        const childRows = this.renderParamsTable(value, path, depth + 1);
        // Wrap child rows with data-parent attribute
        rows += childRows.replace(/<tr /g, `<tr data-parent="${this.esc(path)}" `);
      } else {
        // Primitive value
        const displayValue = this.formatDisplayValue(value);
        const valueClass = this.getValueClass(value);
        
        rows += `
          <tr class="dl-param-child" data-parent="${this.esc(parentPath)}" data-path="${this.esc(path)}">
            <td class="dl-param-key" style="padding-left: ${indent + 8}px">
              <span class="dl-key-text" data-path="${this.esc(path)}" title="Click to copy path">${this.esc(displayKey)}</span>
            </td>
            <td class="dl-param-value">
              <span class="${valueClass}">${displayValue}</span>
            </td>
            <td class="dl-param-actions">
              <button class="dl-param-copy-path" data-path="${this.esc(path)}" title="Copy path">⎘</button>
              <button class="dl-param-copy" data-value="${this.esc(JSON.stringify(value))}" title="Copy value">📋</button>
            </td>
          </tr>
        `;
      }
    }
    
    return rows;
  }
  
  formatDisplayValue(value) {
    if (value === null) return '<span class="val-null">null</span>';
    if (value === undefined) return '<span class="val-null">undefined</span>';
    if (typeof value === 'string') {
      const escaped = this.esc(value);
      if (value.length > 80) {
        return `<span class="val-string" title="${escaped}">${this.esc(value.substring(0, 80))}...</span>`;
      }
      return `<span class="val-string">${escaped}</span>`;
    }
    if (typeof value === 'number') return `<span class="val-number">${value}</span>`;
    if (typeof value === 'boolean') return `<span class="val-boolean">${value}</span>`;
    return this.esc(String(value));
  }
  
  getValueClass(value) {
    if (value === null || value === undefined) return 'val-null';
    if (typeof value === 'string') return 'val-string';
    if (typeof value === 'number') return 'val-number';
    if (typeof value === 'boolean') return 'val-boolean';
    return '';
  }
  
  renderJsonTree(obj, path, indent = 0) {
    if (obj === null) return '<span class="json-null">null</span>';
    if (obj === undefined) return '<span class="json-undefined">undefined</span>';
    
    const type = typeof obj;
    const pad = '  '.repeat(indent);
    
    if (type === 'string') {
      return `<span class="json-string">"${this.esc(obj)}"</span>`;
    }
    if (type === 'number') {
      return `<span class="json-number">${obj}</span>`;
    }
    if (type === 'boolean') {
      return `<span class="json-boolean">${obj}</span>`;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span class="json-bracket">[]</span>';
      
      const items = obj.map((item, i) => {
        const itemPath = path ? `${path}.${i}` : `${i}`;
        return `${pad}  ${this.renderJsonTree(item, itemPath, indent + 1)}`;
      }).join(',\n');
      
      return `<span class="json-toggle">▼</span><button class="json-copy-btn" data-path="${path}" title="Copy array">⎘</button><span class="json-bracket">[</span><span class="json-content">
${items}
${pad}</span><span class="json-bracket">]</span>`;
    }
    
    if (type === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '<span class="json-bracket">{}</span>';
      
      const items = keys.map(key => {
        const keyPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        const isComplex = typeof value === 'object' && value !== null;
        
        return `${pad}  <span class="json-key">"${this.esc(key)}"</span>: ${this.renderJsonTree(value, keyPath, indent + 1)}`;
      }).join(',\n');
      
      const copyBtn = path ? `<button class="json-copy-btn" data-path="${path}" title="Copy object">⎘</button>` : '';
      return `<span class="json-toggle">▼</span>${copyBtn}<span class="json-bracket">{</span><span class="json-content">
${items}
${pad}</span><span class="json-bracket">}</span>`;
    }
    
    return String(obj);
  }
  
  getValueByPath(obj, path) {
    if (!path) return obj;
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }
    return value;
  }
  switchModalView(view) {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.modal-tab[data-view="${view}"]`).classList.add('active');
    document.getElementById(`${view}View`).classList.add('active');
  }
  closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }
  copySelectedData() {
    if (!this.selectedDlEntry) return;
    navigator.clipboard.writeText(JSON.stringify(this.selectedDlEntry.data, null, 2));
  }
  async replayEvent() {
    if (!this.selectedDlEntry) return;
    try {
      await chrome.tabs.sendMessage(this.tabId, { type: 'DL_PUSH', data: this.selectedDlEntry.data });
      this.closeModal('dlModal');
    } catch (e) {}
  }
  // === STORAGE TAB (Chrome DevTools-like) ===
  switchStorage(type) {
    this.storageType = type;
    document.querySelectorAll('.storage-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.storage-tab[data-storage="${type}"]`)?.classList.add('active');
    
    // Show/hide appropriate view
    const tableWrap = document.getElementById('storageTableWrap');
    const cookiesView = document.getElementById('cookiesDomainView');
    
    if (type === 'cookies') {
      if (tableWrap) tableWrap.style.display = 'none';
      if (cookiesView) cookiesView.style.display = 'flex';
    } else {
      if (tableWrap) tableWrap.style.display = 'block';
      if (cookiesView) cookiesView.style.display = 'none';
      
      // Update table header
      const metaHeader = document.getElementById('storageMeta');
      if (metaHeader) metaHeader.textContent = 'Size';
    }
    
    // Clear filter
    const filterInput = document.getElementById('storageFilter');
    if (filterInput) filterInput.value = '';
    this.storageFilter = '';
    
    this.loadStorage();
  }
  async loadStorage() {
    if (this.storageType === 'cookies') {
      // Use background script to get ALL cookies (including third-party)
      await this.loadAllCookies();
    } else {
      // Use content script for localStorage/sessionStorage
      try {
        const response = await chrome.tabs.sendMessage(this.tabId, { 
          type: 'GET_STORAGE',
          storageType: this.storageType 
        });
        this.storageData = response?.data || {};
        this.renderStorage();
      } catch (e) {
        this.el.storageList.innerHTML = `
          <tr><td colspan="4">
            <div class="storage-empty">
              <div class="storage-empty-icon">⚠️</div>
              <div>Unable to load ${this.storageType}</div>
            </div>
          </td></tr>`;
      }
    }
  }
  async loadAllCookies() {
    try {
      // Get current tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';
      
      // Request all cookies from background script
      const response = await chrome.runtime.sendMessage({ 
        type: 'GET_ALL_COOKIES',
        url: url
      });
      
      this.cookiesData = response?.cookies || {};
      this.renderCookiesDomainView();
    } catch (e) {
      console.error('Load cookies error:', e);
      const cookiesList = document.getElementById('cookiesDomainList');
      if (cookiesList) {
        cookiesList.innerHTML = `
          <div class="storage-empty">
            <div class="storage-empty-icon">⚠️</div>
            <div>Unable to load cookies</div>
          </div>`;
      }
    }
  }
  filterStorage(query) {
    this.storageFilter = query.toLowerCase().trim();
    if (this.storageType === 'cookies') {
      this.renderCookiesDomainView();
    } else {
      this.renderStorage();
    }
  }
  renderCookiesDomainView() {
    const cookiesList = document.getElementById('cookiesDomainList');
    if (!cookiesList) return;
    
    let domains = Object.entries(this.cookiesData || {});
    
    // Apply filter
    if (this.storageFilter) {
      domains = domains.map(([domain, data]) => {
        const filteredCookies = data.cookies.filter(c => 
          c.name.toLowerCase().includes(this.storageFilter) ||
          c.value.toLowerCase().includes(this.storageFilter) ||
          domain.toLowerCase().includes(this.storageFilter)
        );
        return [domain, { ...data, cookies: filteredCookies }];
      }).filter(([domain, data]) => data.cookies.length > 0);
    }
    
    // Update stats
    const statsEl = document.getElementById('storageStats');
    if (statsEl) {
      const totalCookies = domains.reduce((sum, [_, data]) => sum + data.cookies.length, 0);
      statsEl.innerHTML = `
        <span>${totalCookies} cookie${totalCookies !== 1 ? 's' : ''}</span>
        <span>First-party only</span>
      `;
    }
    
    if (!domains.length) {
      cookiesList.innerHTML = `
        <div class="storage-empty">
          <div class="storage-empty-icon">${this.storageFilter ? '🔍' : '🍪'}</div>
          <div>${this.storageFilter ? 'No matches found' : 'No cookies for this site'}</div>
        </div>`;
      return;
    }
    
    const self = this;
    
    cookiesList.innerHTML = domains.map(([domain, data]) => {
      const cookies = data.cookies;
      
      return `
        <div class="cookie-domain-group expanded" data-domain="${this.esc(domain)}">
          <div class="cookie-domain-header">
            <span class="cookie-domain-expand">▶</span>
            <span class="cookie-domain-icon">🍪</span>
            <span class="cookie-domain-name">${this.esc(domain)}</span>
            <span class="cookie-domain-count">${cookies.length}</span>
            <div class="cookie-domain-actions">
              <button class="clear-domain-btn" title="Delete all cookies from this domain">🗑</button>
            </div>
          </div>
          <div class="cookie-domain-list">
            ${cookies.map(cookie => `
              <div class="cookie-item" data-name="${this.esc(cookie.name)}" data-domain="${this.esc(cookie.domain)}">
                <div class="cookie-item-key">
                  <span class="cookie-item-name" title="${this.esc(cookie.name)}">${this.esc(cookie.name)}</span>
                  <button class="copy-key-btn" title="Copy key">📋</button>
                </div>
                <div class="cookie-item-val">
                  <span class="cookie-item-value" title="${this.esc(cookie.value)}">${this.esc(cookie.value.slice(0, 30))}${cookie.value.length > 30 ? '...' : ''}</span>
                  <button class="copy-value-btn" title="Copy value">📋</button>
                </div>
                <div class="cookie-item-meta">
                  <span class="cookie-item-expires">${this.formatCookieExpiry(cookie.expires)}</span>
                  <div class="cookie-item-flags">
                    ${cookie.secure ? '<span class="cookie-flag secure">S</span>' : ''}
                    ${cookie.httpOnly ? '<span class="cookie-flag httponly">H</span>' : ''}
                  </div>
                </div>
                <div class="cookie-item-actions">
                  <button class="delete-btn" title="Delete">🗑</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    // Attach event listeners
    cookiesList.querySelectorAll('.cookie-domain-group').forEach(group => {
      const domain = group.dataset.domain;
      const header = group.querySelector('.cookie-domain-header');
      
      // Expand/collapse on header click
      header.addEventListener('click', (e) => {
        if (e.target.closest('.cookie-domain-actions')) return;
        group.classList.toggle('expanded');
      });
      
      // Clear domain button
      const clearBtn = group.querySelector('.clear-domain-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          self.clearDomainCookies(domain);
        });
      }
      
      // Individual cookie actions
      group.querySelectorAll('.cookie-item').forEach(item => {
        const name = item.dataset.name;
        const cookieDomain = item.dataset.domain;
        
        // Copy Key
        const copyKeyBtn = item.querySelector('.copy-key-btn');
        if (copyKeyBtn) {
          copyKeyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(name);
            copyKeyBtn.textContent = '✓';
            setTimeout(() => { copyKeyBtn.textContent = '📋'; }, 1000);
          });
        }
        
        // Copy Value
        const copyValueBtn = item.querySelector('.copy-value-btn');
        if (copyValueBtn) {
          copyValueBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cookie = self.cookiesData[domain]?.cookies.find(c => c.name === name);
            if (cookie) {
              navigator.clipboard.writeText(cookie.value);
              copyValueBtn.textContent = '✓';
              setTimeout(() => { copyValueBtn.textContent = '📋'; }, 1000);
            }
          });
        }
        
        // Delete
        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            self.deleteCookieByDomain(name, cookieDomain);
          });
        }
      });
    });
  }
  async deleteCookieByDomain(name, domain) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.runtime.sendMessage({ 
        type: 'DELETE_COOKIE',
        name: name,
        domain: domain,
        url: tab?.url
      });
      
      // Refresh
      await this.loadAllCookies();
    } catch (e) {
      console.error('Delete cookie error:', e);
    }
  }
  async clearDomainCookies(domain) {
    const count = this.cookiesData[domain]?.cookies?.length || 0;
    if (!count) return;
    
    if (!confirm(`Delete all ${count} cookies from ${domain}?`)) return;
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.runtime.sendMessage({ 
        type: 'CLEAR_DOMAIN_COOKIES',
        domain: domain,
        url: tab?.url
      });
      
      // Refresh
      await this.loadAllCookies();
    } catch (e) {
      console.error('Clear domain cookies error:', e);
    }
  }
  renderStorage() {
    let entries = Object.entries(this.storageData);
    
    // Apply filter
    if (this.storageFilter) {
      entries = entries.filter(([key, info]) => 
        key.toLowerCase().includes(this.storageFilter) ||
        (info.value && info.value.toLowerCase().includes(this.storageFilter))
      );
    }
    
    // Update stats
    const statsEl = document.getElementById('storageStats');
    if (statsEl) {
      const totalSize = entries.reduce((sum, [key, info]) => 
        sum + (key.length + (info.value?.length || 0)), 0
      );
      statsEl.innerHTML = `
        <span>${entries.length} item${entries.length !== 1 ? 's' : ''}</span>
        <span>${this.formatBytes(totalSize * 2)}</span>
      `;
    }
    
    if (!entries.length) {
      this.el.storageList.innerHTML = `
        <tr><td colspan="4">
          <div class="storage-empty">
            <div class="storage-empty-icon">${this.storageFilter ? '🔍' : '📭'}</div>
            <div>${this.storageFilter ? 'No matches found' : 'No items stored'}</div>
          </div>
        </td></tr>`;
      return;
    }
    const self = this;
    
    this.el.storageList.innerHTML = entries.map(([key, info]) => {
      const value = String(info.value || '');
      const meta = this.formatBytes((key.length + value.length) * 2);
      
      return `
        <tr data-key="${this.esc(key)}">
          <td class="key-cell">
            <div class="storage-key-wrap">
              <span class="key-text" title="${this.esc(key)}">${this.esc(key)}</span>
              <button class="copy-key-btn" title="Copy key">📋</button>
            </div>
          </td>
          <td class="value-cell">
            <div class="storage-value-wrap">
              <span class="value-text" title="${this.esc(value)}">${this.esc(value.slice(0, 60))}</span>
              <button class="copy-value-btn" title="Copy value">📋</button>
            </div>
          </td>
          <td class="meta-cell">${meta}</td>
          <td class="actions-cell">
            <button class="delete-btn" title="Delete">🗑</button>
          </td>
        </tr>
      `;
    }).join('');
    // Attach event listeners
    this.el.storageList.querySelectorAll('tr[data-key]').forEach(row => {
      const key = row.dataset.key;
      
      // Copy key button
      const copyKeyBtn = row.querySelector('.copy-key-btn');
      if (copyKeyBtn) {
        copyKeyBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          navigator.clipboard.writeText(key).then(() => {
            copyKeyBtn.textContent = '✓';
            setTimeout(() => { copyKeyBtn.textContent = '📋'; }, 1000);
          });
        });
      }
      
      // Copy value button
      const copyValueBtn = row.querySelector('.copy-value-btn');
      if (copyValueBtn) {
        copyValueBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const value = self.storageData[key]?.value || '';
          navigator.clipboard.writeText(value).then(() => {
            copyValueBtn.textContent = '✓';
            setTimeout(() => { copyValueBtn.textContent = '📋'; }, 1000);
          });
        });
      }
      
      // Delete button  
      const deleteBtn = row.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          self.deleteStorageItem(key);
        });
      }
    });
  }
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  async addStorageItem() {
    const key = this.el.storageKey?.value?.trim();
    const value = this.el.storageValue?.value || '';
    
    if (!key) {
      alert('Please enter a key');
      return;
    }
    try {
      if (this.storageType === 'cookies') {
        // Add cookie using content script (first-party only)
        await chrome.tabs.sendMessage(this.tabId, { 
          type: 'SET_COOKIE',
          name: key, 
          value: value 
        });
      } else {
        await chrome.tabs.sendMessage(this.tabId, { 
          type: 'SET_STORAGE',
          storageType: this.storageType,
          key: key, 
          value: value 
        });
      }
      
      if (this.el.storageKey) this.el.storageKey.value = '';
      if (this.el.storageValue) this.el.storageValue.value = '';
      
      await this.loadStorage();
    } catch (e) {
      console.error('Add storage error:', e);
    }
  }
  async deleteStorageItem(key) {
    if (!key) return;
    
    try {
      await chrome.tabs.sendMessage(this.tabId, { 
        type: 'REMOVE_STORAGE',
        storageType: this.storageType,
        key: key
      });
      
      // Remove from local data immediately for UI feedback
      delete this.storageData[key];
      this.renderStorage();
    } catch (e) {
      console.error('Delete storage error:', e);
    }
  }
  async clearStorage() {
    if (this.storageType === 'cookies') {
      // Clear all domains
      const totalCookies = Object.values(this.cookiesData || {})
        .reduce((sum, data) => sum + data.cookies.length, 0);
      
      if (!totalCookies) return;
      if (!confirm(`Delete ALL ${totalCookies} cookies from all domains?`)) return;
      
      try {
        for (const domain of Object.keys(this.cookiesData)) {
          await chrome.runtime.sendMessage({ 
            type: 'CLEAR_DOMAIN_COOKIES',
            domain: domain
          });
        }
        await this.loadAllCookies();
      } catch (e) {
        console.error('Clear all cookies error:', e);
      }
    } else {
      const count = Object.keys(this.storageData).length;
      if (!count) return;
      
      if (!confirm(`Clear all ${count} items from ${this.storageType}?`)) return;
      
      try {
        await chrome.tabs.sendMessage(this.tabId, { 
          type: 'CLEAR_STORAGE',
          storageType: this.storageType 
        });
        
        this.storageData = {};
        this.renderStorage();
      } catch (e) {
        console.error('Clear storage error:', e);
      }
    }
  }
  // === UTILITIES ===
  flattenObject(obj, prefix = '', includeContainers = true) {
    const result = {};
    if (!obj || typeof obj !== 'object') return result;
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Add the object itself as a copyable entry
        if (includeContainers) {
          result[newKey] = value; // {object}
        }
        Object.assign(result, this.flattenObject(value, newKey, includeContainers));
      } else if (Array.isArray(value)) {
        // Add the array itself as a copyable entry
        if (includeContainers) {
          result[newKey] = value; // [array]
        }
        value.forEach((item, i) => {
          if (item && typeof item === 'object') {
            if (includeContainers) {
              result[`${newKey}.${i}`] = item;
            }
            Object.assign(result, this.flattenObject(item, `${newKey}.${i}`, includeContainers));
          } else {
            result[`${newKey}.${i}`] = item;
          }
        });
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }
  formatValue(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) return `[Array: ${val.length} items]`;
    if (typeof val === 'object') return `{Object: ${Object.keys(val).length} keys}`;
    return String(val);
  }
  esc(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
  // === GTM INJECTOR ===
  async loadGtmSettings() {
    try {
      const stored = await chrome.storage.local.get([
        'gtmSites',
        'gtmDraftUrl', 'gtmDraftId', 'quickGtmDraft',
        // Variable builder fields
        'varDraftType', 'varDraftSelector', 'varDraftDynamic', 'varDraftName', 'varDraftKey', 'varDraftDlPath',
        'varDraftUrlParam', 'varDraftSetKey', 'varDraftSetSelector', 'varDraftCookieExpiry',
        'varDraftTrim', 'varDraftLowercase', 'varDraftFallback', 'varDraftParseJson', 
        'varDraftParseFloat', 'varDraftToString',
        // Array builder
        'varDraftArrItemId', 'varDraftArrItemName', 'varDraftArrPrice', 'varDraftArrQuantity',
        'varDraftArrBrand', 'varDraftArrCategory', 'varDraftArrVariant', 'varDraftArrCurrency',
        'varDraftArrRemoveCurrency', 'varDraftArrParseFloat',
        'varDraftArrContainer', 'varDraftArrMultiId', 'varDraftArrMultiName', 'varDraftArrMultiPrice',
        'varDraftArrMultiQty', 'varDraftArrMultiBrand', 'varDraftArrMultiCategory',
        'varDraftArrMultiRemoveCurrency', 'varDraftArrMultiParseFloat'
      ]);
      
      this.gtmSites = stored.gtmSites || [];
      
      // Restore draft inputs
      if (this.el.gtmSiteUrl && stored.gtmDraftUrl) {
        this.el.gtmSiteUrl.value = stored.gtmDraftUrl;
      }
      if (this.el.gtmContainerId && stored.gtmDraftId) {
        this.el.gtmContainerId.value = stored.gtmDraftId;
      }
      if (this.el.quickGtmId && stored.quickGtmDraft) {
        this.el.quickGtmId.value = stored.quickGtmDraft;
      }
      
      // Restore variable builder inputs
      if (this.el.varType && stored.varDraftType) {
        this.el.varType.value = stored.varDraftType;
        this.onVarTypeChange(); // Update UI based on type
      }
      if (this.el.varSelector && stored.varDraftSelector) {
        this.el.varSelector.value = stored.varDraftSelector;
      }
      if (this.el.varDynamic && stored.varDraftDynamic !== undefined) {
        this.el.varDynamic.checked = stored.varDraftDynamic;
      }
      if (this.el.varName && stored.varDraftName) {
        this.el.varName.value = stored.varDraftName;
      }
      if (this.el.varKey && stored.varDraftKey) {
        this.el.varKey.value = stored.varDraftKey;
      }
      if (this.el.varDlPath && stored.varDraftDlPath) {
        this.el.varDlPath.value = stored.varDraftDlPath;
      }
      if (this.el.varUrlParam && stored.varDraftUrlParam) {
        this.el.varUrlParam.value = stored.varDraftUrlParam;
      }
      if (this.el.varSetKey && stored.varDraftSetKey) {
        this.el.varSetKey.value = stored.varDraftSetKey;
      }
      if (this.el.varSetSelector && stored.varDraftSetSelector) {
        this.el.varSetSelector.value = stored.varDraftSetSelector;
      }
      if (this.el.varCookieExpiry && stored.varDraftCookieExpiry) {
        this.el.varCookieExpiry.value = stored.varDraftCookieExpiry;
      }
      
      // Restore checkboxes
      if (this.el.varTrim && stored.varDraftTrim !== undefined) {
        this.el.varTrim.checked = stored.varDraftTrim;
      }
      if (this.el.varLowercase && stored.varDraftLowercase !== undefined) {
        this.el.varLowercase.checked = stored.varDraftLowercase;
      }
      if (this.el.varFallback && stored.varDraftFallback !== undefined) {
        this.el.varFallback.checked = stored.varDraftFallback;
      }
      if (this.el.varParseJson && stored.varDraftParseJson !== undefined) {
        this.el.varParseJson.checked = stored.varDraftParseJson;
      }
      if (this.el.varParseFloat && stored.varDraftParseFloat !== undefined) {
        this.el.varParseFloat.checked = stored.varDraftParseFloat;
      }
      if (this.el.varToString && stored.varDraftToString !== undefined) {
        this.el.varToString.checked = stored.varDraftToString;
      }
      
      // Restore array builder - Single Product
      if (this.el.arrItemId && stored.varDraftArrItemId) {
        this.el.arrItemId.value = stored.varDraftArrItemId;
      }
      if (this.el.arrItemName && stored.varDraftArrItemName) {
        this.el.arrItemName.value = stored.varDraftArrItemName;
      }
      if (this.el.arrPrice && stored.varDraftArrPrice) {
        this.el.arrPrice.value = stored.varDraftArrPrice;
      }
      if (this.el.arrQuantity && stored.varDraftArrQuantity) {
        this.el.arrQuantity.value = stored.varDraftArrQuantity;
      }
      if (this.el.arrBrand && stored.varDraftArrBrand) {
        this.el.arrBrand.value = stored.varDraftArrBrand;
      }
      if (this.el.arrCategory && stored.varDraftArrCategory) {
        this.el.arrCategory.value = stored.varDraftArrCategory;
      }
      if (this.el.arrVariant && stored.varDraftArrVariant) {
        this.el.arrVariant.value = stored.varDraftArrVariant;
      }
      if (this.el.arrCurrency && stored.varDraftArrCurrency) {
        this.el.arrCurrency.value = stored.varDraftArrCurrency;
      }
      if (this.el.arrRemoveCurrency && stored.varDraftArrRemoveCurrency !== undefined) {
        this.el.arrRemoveCurrency.checked = stored.varDraftArrRemoveCurrency;
      }
      if (this.el.arrParseFloat && stored.varDraftArrParseFloat !== undefined) {
        this.el.arrParseFloat.checked = stored.varDraftArrParseFloat;
      }
      
      // Restore array builder - Multiple Products
      if (this.el.arrContainerSelector && stored.varDraftArrContainer) {
        this.el.arrContainerSelector.value = stored.varDraftArrContainer;
      }
      if (this.el.arrMultiId && stored.varDraftArrMultiId) {
        this.el.arrMultiId.value = stored.varDraftArrMultiId;
      }
      if (this.el.arrMultiName && stored.varDraftArrMultiName) {
        this.el.arrMultiName.value = stored.varDraftArrMultiName;
      }
      if (this.el.arrMultiPrice && stored.varDraftArrMultiPrice) {
        this.el.arrMultiPrice.value = stored.varDraftArrMultiPrice;
      }
      if (this.el.arrMultiQty && stored.varDraftArrMultiQty) {
        this.el.arrMultiQty.value = stored.varDraftArrMultiQty;
      }
      if (this.el.arrMultiBrand && stored.varDraftArrMultiBrand) {
        this.el.arrMultiBrand.value = stored.varDraftArrMultiBrand;
      }
      if (this.el.arrMultiCategory && stored.varDraftArrMultiCategory) {
        this.el.arrMultiCategory.value = stored.varDraftArrMultiCategory;
      }
      if (this.el.arrMultiRemoveCurrency && stored.varDraftArrMultiRemoveCurrency !== undefined) {
        this.el.arrMultiRemoveCurrency.checked = stored.varDraftArrMultiRemoveCurrency;
      }
      if (this.el.arrMultiParseFloat && stored.varDraftArrMultiParseFloat !== undefined) {
        this.el.arrMultiParseFloat.checked = stored.varDraftArrMultiParseFloat;
      }
      
      this.renderGtmSites();
    } catch (e) {
      console.error('Error loading GTM settings:', e);
    }
    
    // Load Shopify Custom Pixel settings (from sync storage)
    try {
      const shopifySettings = await chrome.storage.sync.get(['customPixelDataLayer', 'shopifyGtmPreview']);
      
      if (this.el.customPixelDataLayer) {
        this.el.customPixelDataLayer.checked = shopifySettings.customPixelDataLayer !== 0;
      }
      if (this.el.shopifyGtmPreview) {
        this.el.shopifyGtmPreview.checked = shopifySettings.shopifyGtmPreview === true || shopifySettings.shopifyGtmPreview === 1;
      }
    } catch (e) {
      console.error('Error loading Shopify settings:', e);
    }
  }
  // Auto-save GTM inputs as user types
  async autoSaveGtmInputs() {
    const url = this.el.gtmSiteUrl?.value || '';
    const id = this.el.gtmContainerId?.value || '';
    
    await chrome.storage.local.set({
      gtmDraftUrl: url,
      gtmDraftId: id
    });
    
    // Show save hint
    if (this.el.gtmSaveHint && id) {
      this.el.gtmSaveHint.textContent = '✓ Auto-saved';
      setTimeout(() => {
        if (this.el.gtmSaveHint) this.el.gtmSaveHint.textContent = '';
      }, 2000);
    }
  }
  async autoSaveQuickGtm() {
    const id = this.el.quickGtmId?.value || '';
    await chrome.storage.local.set({ quickGtmDraft: id });
  }
  async saveShopifySettings() {
    try {
      const customPixelDataLayer = this.el.customPixelDataLayer?.checked ? 1 : 0;
      const shopifyGtmPreview = this.el.shopifyGtmPreview?.checked ? 1 : 0;
      
      await chrome.storage.sync.set({
        customPixelDataLayer,
        shopifyGtmPreview
      });
      
      console.log('[Insighter Pro] Shopify settings saved:', { customPixelDataLayer, shopifyGtmPreview });
    } catch (e) {
      console.error('Error saving Shopify settings:', e);
    }
  }
  async autoSaveVarInputs() {
    const data = {
      varDraftType: this.el.varType?.value || 'selector',
      varDraftSelector: this.el.varSelector?.value || '',
      varDraftDynamic: this.el.varDynamic?.checked || false,
      varDraftName: this.el.varName?.value || '',
      varDraftKey: this.el.varKey?.value || '',
      varDraftDlPath: this.el.varDlPath?.value || '',
      varDraftUrlParam: this.el.varUrlParam?.value || '',
      varDraftSetKey: this.el.varSetKey?.value || '',
      varDraftSetSelector: this.el.varSetSelector?.value || '',
      varDraftCookieExpiry: this.el.varCookieExpiry?.value || '365',
      // Checkboxes
      varDraftTrim: this.el.varTrim?.checked,
      varDraftLowercase: this.el.varLowercase?.checked,
      varDraftFallback: this.el.varFallback?.checked,
      varDraftParseJson: this.el.varParseJson?.checked,
      varDraftParseFloat: this.el.varParseFloat?.checked,
      varDraftToString: this.el.varToString?.checked,
      // Array builder fields
      varDraftArrItemId: this.el.arrItemId?.value || '',
      varDraftArrItemName: this.el.arrItemName?.value || '',
      varDraftArrPrice: this.el.arrPrice?.value || '',
      varDraftArrQuantity: this.el.arrQuantity?.value || '1',
      varDraftArrBrand: this.el.arrBrand?.value || '',
      varDraftArrCategory: this.el.arrCategory?.value || '',
      varDraftArrVariant: this.el.arrVariant?.value || '',
      varDraftArrCurrency: this.el.arrCurrency?.value || 'USD',
      varDraftArrRemoveCurrency: this.el.arrRemoveCurrency?.checked,
      varDraftArrParseFloat: this.el.arrParseFloat?.checked,
      // Multiple products
      varDraftArrContainer: this.el.arrContainerSelector?.value || '',
      varDraftArrMultiId: this.el.arrMultiId?.value || '',
      varDraftArrMultiName: this.el.arrMultiName?.value || '',
      varDraftArrMultiPrice: this.el.arrMultiPrice?.value || '',
      varDraftArrMultiQty: this.el.arrMultiQty?.value || '',
      varDraftArrMultiBrand: this.el.arrMultiBrand?.value || '',
      varDraftArrMultiCategory: this.el.arrMultiCategory?.value || '',
      varDraftArrMultiRemoveCurrency: this.el.arrMultiRemoveCurrency?.checked,
      varDraftArrMultiParseFloat: this.el.arrMultiParseFloat?.checked
    };
    await chrome.storage.local.set(data);
  }
  async saveGtmSettings() {
    try {
      await chrome.storage.local.set({
        gtmSites: this.gtmSites
      });
      
      // Also save in gtmInjectors format for Shopify Custom Pixel preview mode
      // This format is: [{gtmCode: "full GTM script", website: "example.com"}]
      const gtmInjectors = this.gtmSites.map(site => ({
        gtmCode: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.containerId}');`,
        website: site.url
      }));
      await chrome.storage.sync.set({ gtmInjectors });
      
      // Notify background script to update rules
      chrome.runtime.sendMessage({ type: 'GTM_SETTINGS_UPDATED', sites: this.gtmSites });
    } catch (e) {
      console.error('Error saving GTM settings:', e);
    }
  }
  renderGtmSites() {
    if (!this.el.gtmSitesList) return;
    
    if (!this.gtmSites.length) {
      this.el.gtmSitesList.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 11px;">No sites configured</div>';
      return;
    }
    this.el.gtmSitesList.innerHTML = this.gtmSites.map((site, i) => `
      <div class="gtm-site-item" data-index="${i}">
        <div class="gtm-site-info">
          <div class="gtm-site-url">${this.esc(site.url)}</div>
          <div class="gtm-site-id">${this.esc(site.containerId)}</div>
        </div>
        <span class="gtm-site-status active">Active</span>
        <button class="gtm-site-delete" data-index="${i}" title="Delete">🗑</button>
      </div>
    `).join('');
    this.el.gtmSitesList.querySelectorAll('.gtm-site-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteGtmSite(parseInt(btn.dataset.index));
      });
    });
  }
  async addGtmSite() {
    const url = this.el.gtmSiteUrl?.value.trim();
    const containerId = this.el.gtmContainerId?.value.trim().toUpperCase();
    if (!url) {
      alert('Please enter a website URL');
      return;
    }
    if (!containerId || !containerId.match(/^GTM-[A-Z0-9]+$/)) {
      alert('Please enter a valid GTM Container ID (e.g., GTM-XXXXXXX)');
      return;
    }
    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    try {
      const urlObj = new URL(normalizedUrl);
      normalizedUrl = urlObj.origin;
    } catch (e) {
      alert('Invalid URL format');
      return;
    }
    // Check for duplicates
    if (this.gtmSites.some(s => s.url === normalizedUrl)) {
      alert('This site is already configured');
      return;
    }
    this.gtmSites.push({
      url: normalizedUrl,
      containerId: containerId,
      enabled: true,
      createdAt: Date.now()
    });
    await this.saveGtmSettings();
    this.renderGtmSites();
    // Clear inputs and drafts
    if (this.el.gtmSiteUrl) this.el.gtmSiteUrl.value = '';
    if (this.el.gtmContainerId) this.el.gtmContainerId.value = '';
    await chrome.storage.local.set({ gtmDraftUrl: '', gtmDraftId: '' });
  }
  async deleteGtmSite(index) {
    if (confirm('Delete this GTM injection rule?')) {
      this.gtmSites.splice(index, 1);
      await this.saveGtmSettings();
      this.renderGtmSites();
    }
  }
  async quickInjectGtm() {
    const containerId = this.el.quickGtmId?.value.trim().toUpperCase();
    if (!containerId || !containerId.match(/^GTM-[A-Z0-9]+$/)) {
      alert('Please enter a valid GTM Container ID (e.g., GTM-XXXXXXX)');
      return;
    }
    try {
      // Inject GTM script on current tab
      await chrome.tabs.sendMessage(this.tabId, {
        type: 'INJECT_GTM',
        containerId: containerId
      });
      
      alert(`GTM ${containerId} injected successfully!`);
      this.el.quickGtmId.value = '';
      
      // Refresh to detect the new GTM
      setTimeout(() => this.refresh(), 1000);
    } catch (e) {
      // Try executing script directly
      try {
        await chrome.scripting.executeScript({
          target: { tabId: this.tabId },
          func: (gtmId) => {
            if (document.querySelector(`script[src*="${gtmId}"]`)) {
              return 'already_exists';
            }
            
            // Create dataLayer if not exists
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
            
            // Create script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
            document.head.appendChild(script);
            
            // Create noscript iframe
            const noscript = document.createElement('noscript');
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
            iframe.height = '0';
            iframe.width = '0';
            iframe.style.cssText = 'display:none;visibility:hidden';
            noscript.appendChild(iframe);
            document.body.insertBefore(noscript, document.body.firstChild);
            
            return 'injected';
          },
          args: [containerId]
        });
        
        alert(`GTM ${containerId} injected successfully!`);
        this.el.quickGtmId.value = '';
        await chrome.storage.local.set({ quickGtmDraft: '' });
        setTimeout(() => this.refresh(), 1000);
      } catch (e2) {
        alert('Failed to inject GTM: ' + e2.message);
      }
    }
  }
  // === TECH STACK (WAPPALYZER-LIKE) ===
  async scanTechStack() {
    if (!this.tabId) {
      console.error('No tabId for tech scan');
      return;
    }
    
    const self = this;
    
    // Show loading state
    if (this.el.techEmptyState) {
      this.el.techEmptyState.innerHTML = '<div class="tech-empty-icon">🔍</div><div class="tech-empty-text">Scanning for technologies...</div>';
      this.el.techEmptyState.style.display = 'flex';
    }
    if (this.el.techCategories) {
      this.el.techCategories.innerHTML = '';
    }
    if (this.el.tictactoeContainer) {
      this.el.tictactoeContainer.style.display = 'none';
    }
    this.detectedTechs = {};
    try {
      // First try to get page content via content script
      let response = null;
      try {
        response = await chrome.tabs.sendMessage(this.tabId, { type: 'GET_PAGE_CONTENT' });
      } catch (e) {
        // Content script not ready, inject it
        try {
          await chrome.scripting.executeScript({ target: { tabId: this.tabId }, files: ['content.js'] });
          await new Promise(r => setTimeout(r, 300));
          response = await chrome.tabs.sendMessage(this.tabId, { type: 'GET_PAGE_CONTENT' });
        } catch (e2) {
          console.error('Cannot inject content script:', e2);
        }
      }
      if (response && response.html) {
        this.analyzePageContent(response.html, response.scripts || [], response.meta || {}, response.headers || {});
      }
      // Also run inline detection for global JS objects
      try {
        const inlineResults = await chrome.scripting.executeScript({
          target: { tabId: this.tabId },
          func: () => {
            const detected = [];
            // Check global objects
            if (window.React || document.querySelector('[data-reactroot]') || document.querySelector('[data-react-checksum]')) detected.push('react');
            if (window.Vue || window.__VUE__) detected.push('vue');
            if (window.angular || window.ng || document.querySelector('[ng-version]')) detected.push('angular');
            if (window.__NEXT_DATA__ || document.querySelector('script#__NEXT_DATA__')) detected.push('nextjs');
            if (window.__NUXT__ || window.$nuxt) detected.push('nuxt');
            if (window.Shopify || window.ShopifyAnalytics) detected.push('shopify');
            if (window.jQuery || window.$?.fn?.jquery) detected.push('jquery');
            if (window._ && window._.VERSION) detected.push('lodash');
            if (window.gsap || window.TweenMax) detected.push('gsap');
            if (window.dataLayer) detected.push('gtm');
            if (window.ga || window.gtag || window.google_tag_manager) detected.push('ga');
            if (window.fbq) detected.push('facebook');
            if (window.ttq) detected.push('tiktok');
            if (window.pintrk) detected.push('pinterest');
            if (window.lintrk) detected.push('linkedin');
            if (window.rdt) detected.push('reddit');
            if (window.twq) detected.push('twitter');
            if (window.snaptr) detected.push('snapchat');
            if (window.hj) detected.push('hotjar');
            if (window.Intercom) detected.push('intercom');
            if (window.drift) detected.push('drift');
            if (window.Sentry) detected.push('sentry');
            if (window.LogRocket) detected.push('logrocket');
            if (window.FullStory) detected.push('fullstory');
            if (window.mixpanel) detected.push('mixpanel');
            if (window.amplitude) detected.push('amplitude');
            if (window.heap) detected.push('heap');
            if (window.posthog) detected.push('posthog');
            if (window.Segment || (window.analytics && window.analytics.identify && window.analytics.track)) detected.push('segment');
            if (window.optimizely) detected.push('optimizely');
            if (window.google_optimize) detected.push('googleoptimize');
            if (window.Stripe) detected.push('stripe');
            if (window.PayPal || window.paypal) detected.push('paypal');
            if (window.Swal || window.sweetAlert) detected.push('sweetalert');
            if (window.Chart) detected.push('chartjs');
            if (window.ApexCharts) detected.push('apexcharts');
            if (window.Swiper) detected.push('swiper');
            if (window.Splide) detected.push('splide');
            if (window.AOS) detected.push('aos');
            if (window.lazySizes) detected.push('lazysizes');
            if (window.lozad) detected.push('lozad');
            if (window.lottie || window.bodymovin) detected.push('lottie');
            if (window.THREE) detected.push('threejs');
            if (window.PIXI) detected.push('pixijs');
            if (window.d3 && window.d3.select) detected.push('d3');
            if (window.Phaser) detected.push('phaser');
            if (window.moment && window.moment.version) detected.push('moment');
            if (window.dayjs) detected.push('dayjs');
            if (window.luxon) detected.push('luxon');
            if (window.axios) detected.push('axios');
            if (window.Firebase || window.firebase) detected.push('firebase');
            if (window.supabase) detected.push('supabase');
            if (window.Clerk) detected.push('clerk');
            if (window.Auth0) detected.push('auth0');
            if (window.Crisp) detected.push('crisp');
            if (window.tawk_API || window.Tawk_API) detected.push('tawk');
            if (window.LiveChatWidget) detected.push('livechat');
            if (window.Olark) detected.push('olark');
            if (window.zE) detected.push('zendesk');
            if (window.Freshdesk) detected.push('freshdesk');
            if (window._hsq || window.HubSpotConversations) detected.push('hubspot');
            if (window.Mailchimp) detected.push('mailchimp');
            if (window.klaviyo) detected.push('klaviyo');
            if (window.Braze || window.appboy) detected.push('braze');
            if (window.OneSignal) detected.push('onesignal');
            if (window.PushEngage) detected.push('pushengage');
            if (window.Webflow && window.Webflow.push) detected.push('webflow');
            if (window.Squarespace) detected.push('squarespace');
            if (window.Wix && window.wixBiSession) detected.push('wix');
            if (window.WooCommerce || (document.body?.classList?.contains('woocommerce') && document.body?.classList?.contains('woocommerce-page'))) detected.push('woocommerce');
            if (window.BigCommerce) detected.push('bigcommerce');
            if (window.Magento && (window.Magento.Ui || window.Magento.Customer)) detected.push('magento');
            if (window.Mage && window.Mage.Cookies) detected.push('magento');
            if (document.querySelector('meta[name="generator"][content*="WordPress"]')) detected.push('wordpress');
            if (window.Drupal && window.Drupal.settings) detected.push('drupal');
            if (window.__ghost_root__) detected.push('ghost');
            if (window.Contentful) detected.push('contentful');
            if (window.Prismic) detected.push('prismic');
            if (window.Sanity) detected.push('sanity');
            if (window.Strapi) detected.push('strapi');
            if (document.querySelector('link[href*="tailwindcss"]') || document.querySelector('link[href*="tailwind.min.css"]')) detected.push('tailwindcss');
            if (document.querySelector('link[href*="bootstrap.min.css"]') || document.querySelector('link[href*="bootstrap.css"]') || document.querySelector('script[src*="bootstrap.min.js"]')) detected.push('bootstrap');
            if (window.Turbo || window.Turbolinks) detected.push('turbo');
            if (window.Stimulus) detected.push('stimulus');
            if (window.htmx) detected.push('htmx');
            if (window.Alpine && window.Alpine.start) detected.push('alpinejs');
            
            return detected;
          }
        });
        
        if (inlineResults && inlineResults[0] && inlineResults[0].result) {
          this.addInlineDetections(inlineResults[0].result);
        }
      } catch (e) {
        console.log('Inline detection failed (expected on some pages):', e.message);
      }
      
      this.filterTechStack();
    } catch (e) {
      console.error('Tech scan error:', e);
      this.filterTechStack();
    }
  }
  // Add technologies detected via inline script
  addInlineDetections(detectedList) {
    const techMap = {
      'react': { cat: 'framework', name: 'React', website: 'https://react.dev', icon: 'framework' },
      'vue': { cat: 'framework', name: 'Vue.js', website: 'https://vuejs.org', icon: 'framework' },
      'angular': { cat: 'framework', name: 'Angular', website: 'https://angular.io', icon: 'framework' },
      'nextjs': { cat: 'framework', name: 'Next.js', website: 'https://nextjs.org', icon: 'framework' },
      'nuxt': { cat: 'framework', name: 'Nuxt', website: 'https://nuxt.com', icon: 'framework' },
      'svelte': { cat: 'framework', name: 'Svelte', website: 'https://svelte.dev', icon: 'framework' },
      'jquery': { cat: 'js', name: 'jQuery', website: 'https://jquery.com', icon: 'js' },
      'lodash': { cat: 'js', name: 'Lodash', website: 'https://lodash.com', icon: 'js' },
      'gsap': { cat: 'js', name: 'GSAP', website: 'https://greensock.com', icon: 'js' },
      'moment': { cat: 'js', name: 'Moment.js', website: 'https://momentjs.com', icon: 'js' },
      'dayjs': { cat: 'js', name: 'Day.js', website: 'https://day.js.org', icon: 'js' },
      'axios': { cat: 'js', name: 'Axios', website: 'https://axios-http.com', icon: 'js' },
      'd3': { cat: 'js', name: 'D3.js', website: 'https://d3js.org', icon: 'js' },
      'threejs': { cat: 'js', name: 'Three.js', website: 'https://threejs.org', icon: 'js' },
      'chartjs': { cat: 'js', name: 'Chart.js', website: 'https://chartjs.org', icon: 'js' },
      'swiper': { cat: 'js', name: 'Swiper', website: 'https://swiperjs.com', icon: 'js' },
      'aos': { cat: 'js', name: 'AOS', website: 'https://michalsnik.github.io/aos', icon: 'js' },
      'lottie': { cat: 'js', name: 'Lottie', website: 'https://airbnb.design/lottie', icon: 'js' },
      'htmx': { cat: 'framework', name: 'htmx', website: 'https://htmx.org', icon: 'framework' },
      'alpinejs': { cat: 'framework', name: 'Alpine.js', website: 'https://alpinejs.dev', icon: 'framework' },
      'turbo': { cat: 'framework', name: 'Turbo', website: 'https://turbo.hotwired.dev', icon: 'framework' },
      'tailwindcss': { cat: 'cssfw', name: 'Tailwind CSS', website: 'https://tailwindcss.com', icon: 'css' },
      'bootstrap': { cat: 'cssfw', name: 'Bootstrap', website: 'https://getbootstrap.com', icon: 'css' },
      'shopify': { cat: 'cms', name: 'Shopify', website: 'https://shopify.com', icon: 'ecommerce' },
      'woocommerce': { cat: 'cms', name: 'WooCommerce', website: 'https://woocommerce.com', icon: 'ecommerce' },
      'magento': { cat: 'cms', name: 'Magento', website: 'https://magento.com', icon: 'ecommerce' },
      'bigcommerce': { cat: 'cms', name: 'BigCommerce', website: 'https://bigcommerce.com', icon: 'ecommerce' },
      'wordpress': { cat: 'cms', name: 'WordPress', website: 'https://wordpress.org', icon: 'cms' },
      'drupal': { cat: 'cms', name: 'Drupal', website: 'https://drupal.org', icon: 'cms' },
      'webflow': { cat: 'cms', name: 'Webflow', website: 'https://webflow.com', icon: 'cms' },
      'squarespace': { cat: 'cms', name: 'Squarespace', website: 'https://squarespace.com', icon: 'cms' },
      'wix': { cat: 'cms', name: 'Wix', website: 'https://wix.com', icon: 'cms' },
      'ghost': { cat: 'cms', name: 'Ghost', website: 'https://ghost.org', icon: 'cms' },
      'contentful': { cat: 'cms', name: 'Contentful', website: 'https://contentful.com', icon: 'cms' },
      'sanity': { cat: 'cms', name: 'Sanity', website: 'https://sanity.io', icon: 'cms' },
      'strapi': { cat: 'cms', name: 'Strapi', website: 'https://strapi.io', icon: 'cms' },
      'gtm': { cat: 'tagmgr', name: 'Google Tag Manager', website: 'https://tagmanager.google.com', icon: 'tag-manager' },
      'ga': { cat: 'analytics', name: 'Google Analytics', website: 'https://analytics.google.com', icon: 'analytics' },
      'facebook': { cat: 'marketing', name: 'Meta Pixel', website: 'https://facebook.com/business', icon: 'marketing' },
      'tiktok': { cat: 'marketing', name: 'TikTok Pixel', website: 'https://ads.tiktok.com', icon: 'marketing' },
      'pinterest': { cat: 'marketing', name: 'Pinterest Tag', website: 'https://pinterest.com/business', icon: 'marketing' },
      'linkedin': { cat: 'marketing', name: 'LinkedIn Insight', website: 'https://linkedin.com/business', icon: 'marketing' },
      'twitter': { cat: 'marketing', name: 'Twitter Pixel', website: 'https://ads.twitter.com', icon: 'marketing' },
      'reddit': { cat: 'marketing', name: 'Reddit Pixel', website: 'https://ads.reddit.com', icon: 'marketing' },
      'snapchat': { cat: 'marketing', name: 'Snapchat Pixel', website: 'https://forbusiness.snapchat.com', icon: 'marketing' },
      'hotjar': { cat: 'analytics', name: 'Hotjar', website: 'https://hotjar.com', icon: 'analytics' },
      'mixpanel': { cat: 'analytics', name: 'Mixpanel', website: 'https://mixpanel.com', icon: 'analytics' },
      'amplitude': { cat: 'analytics', name: 'Amplitude', website: 'https://amplitude.com', icon: 'analytics' },
      'heap': { cat: 'analytics', name: 'Heap', website: 'https://heap.io', icon: 'analytics' },
      'posthog': { cat: 'analytics', name: 'PostHog', website: 'https://posthog.com', icon: 'analytics' },
      'segment': { cat: 'analytics', name: 'Segment', website: 'https://segment.com', icon: 'analytics' },
      'fullstory': { cat: 'analytics', name: 'FullStory', website: 'https://fullstory.com', icon: 'analytics' },
      'logrocket': { cat: 'analytics', name: 'LogRocket', website: 'https://logrocket.com', icon: 'analytics' },
      'sentry': { cat: 'devtools', name: 'Sentry', website: 'https://sentry.io', icon: 'security' },
      'optimizely': { cat: 'abtesting', name: 'Optimizely', website: 'https://optimizely.com', icon: 'a-b-testing' },
      'googleoptimize': { cat: 'abtesting', name: 'Google Optimize', website: 'https://optimize.google.com', icon: 'a-b-testing' },
      'stripe': { cat: 'payment', name: 'Stripe', website: 'https://stripe.com', icon: 'payment' },
      'paypal': { cat: 'payment', name: 'PayPal', website: 'https://paypal.com', icon: 'payment' },
      'intercom': { cat: 'livechat', name: 'Intercom', website: 'https://intercom.com', icon: 'live-chat' },
      'drift': { cat: 'livechat', name: 'Drift', website: 'https://drift.com', icon: 'live-chat' },
      'crisp': { cat: 'livechat', name: 'Crisp', website: 'https://crisp.chat', icon: 'live-chat' },
      'tawk': { cat: 'livechat', name: 'Tawk.to', website: 'https://tawk.to', icon: 'live-chat' },
      'livechat': { cat: 'livechat', name: 'LiveChat', website: 'https://livechat.com', icon: 'live-chat' },
      'zendesk': { cat: 'livechat', name: 'Zendesk', website: 'https://zendesk.com', icon: 'live-chat' },
      'hubspot': { cat: 'crm', name: 'HubSpot', website: 'https://hubspot.com', icon: 'crm' },
      'mailchimp': { cat: 'email', name: 'Mailchimp', website: 'https://mailchimp.com', icon: 'marketing' },
      'klaviyo': { cat: 'email', name: 'Klaviyo', website: 'https://klaviyo.com', icon: 'marketing' },
      'firebase': { cat: 'backend', name: 'Firebase', website: 'https://firebase.google.com', icon: 'hosting' },
      'supabase': { cat: 'backend', name: 'Supabase', website: 'https://supabase.com', icon: 'hosting' },
      'onesignal': { cat: 'push', name: 'OneSignal', website: 'https://onesignal.com', icon: 'marketing' }
    };
    const categoryNames = {
      'framework': 'JavaScript Frameworks',
      'js': 'JavaScript Libraries', 
      'cssfw': 'CSS Frameworks',
      'cms': 'CMS & Platforms',
      'analytics': 'Analytics',
      'marketing': 'Marketing & Ads',
      'tagmgr': 'Tag Management',
      'abtesting': 'A/B Testing',
      'payment': 'Payment',
      'livechat': 'Live Chat',
      'crm': 'CRM',
      'email': 'Email Marketing',
      'backend': 'Backend Services',
      'devtools': 'Developer Tools',
      'push': 'Push Notifications'
    };
    detectedList.forEach(key => {
      const tech = techMap[key];
      if (!tech) return;
      
      const catKey = tech.cat;
      if (!this.detectedTechs[catKey]) {
        this.detectedTechs[catKey] = {
          name: categoryNames[catKey] || catKey,
          icon: tech.icon,
          technologies: []
        };
      }
      // Avoid duplicates
      const exists = this.detectedTechs[catKey].technologies.some(t => t.name === tech.name);
      if (!exists) {
        this.detectedTechs[catKey].technologies.push({
          key: key,
          name: tech.name,
          version: null,
          icon: tech.icon,
          website: tech.website,
          confidence: 100
        });
      }
    });
  }
  analyzePageContent(html, scripts, meta, headers) {
    const combinedContent = html + ' ' + scripts.join(' ') + ' ' + JSON.stringify(meta) + ' ' + JSON.stringify(headers);
    const self = this;
    // Iterate through all categories and technologies
    Object.keys(TECH_DATABASE).forEach(function(categoryKey) {
      const category = TECH_DATABASE[categoryKey];
      
      Object.keys(category.technologies).forEach(function(techKey) {
        const tech = category.technologies[techKey];
        let detected = false;
        let version = null;
        let matchCount = 0;
        // Check patterns
        for (let i = 0; i < tech.patterns.length; i++) {
          if (tech.patterns[i].test(combinedContent)) {
            detected = true;
            matchCount++;
          }
        }
        // If detected, try to extract version
        if (detected && tech.versionPatterns) {
          for (let v = 0; v < tech.versionPatterns.length; v++) {
            const vMatch = combinedContent.match(tech.versionPatterns[v]);
            if (vMatch && vMatch[1]) {
              version = vMatch[1];
              break;
            }
          }
        }
        // Calculate confidence based on pattern matches
        const confidence = detected ? Math.min(100, 30 + (matchCount * 35)) : 0;
        if (detected) {
          if (!self.detectedTechs[categoryKey]) {
            self.detectedTechs[categoryKey] = {
              name: category.name,
              icon: category.icon,
              technologies: []
            };
          }
          // Check for duplicates before adding
          const alreadyExists = self.detectedTechs[categoryKey].technologies.some(function(t) {
            return t.name === tech.name;
          });
          if (!alreadyExists) {
            self.detectedTechs[categoryKey].technologies.push({
              key: techKey,
              name: tech.name,
              version: version,
              icon: tech.icon,
              website: tech.website,
              confidence: confidence
            });
          }
        }
      });
    });
    // Sort technologies within each category alphabetically
    Object.keys(this.detectedTechs).forEach(function(catKey) {
      self.detectedTechs[catKey].technologies.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
    });
  }
  filterTechStack() {
    const query = (this.el.techSearch && this.el.techSearch.value) ? this.el.techSearch.value.toLowerCase().trim() : '';
    this.techSearchQuery = query;
    const self = this;
    if (!query) {
      // Copy detected techs to filtered
      this.filteredTechs = {};
      Object.keys(this.detectedTechs).forEach(function(key) {
        self.filteredTechs[key] = {
          name: self.detectedTechs[key].name,
          icon: self.detectedTechs[key].icon,
          technologies: self.detectedTechs[key].technologies.slice()
        };
      });
    } else {
      this.filteredTechs = {};
      Object.keys(this.detectedTechs).forEach(function(catKey) {
        const category = self.detectedTechs[catKey];
        const filteredTechnologies = category.technologies.filter(function(tech) {
          return tech.name.toLowerCase().indexOf(query) !== -1 || 
                 catKey.toLowerCase().indexOf(query) !== -1 ||
                 category.name.toLowerCase().indexOf(query) !== -1;
        });
        if (filteredTechnologies.length > 0) {
          self.filteredTechs[catKey] = {
            name: category.name,
            icon: category.icon,
            technologies: filteredTechnologies
          };
        }
      });
    }
    this.renderTechStack();
  }
  renderTechStack() {
    var self = this;
    
    if (!this.el.techCategories) return;
    
    // Count technologies
    var totalTechs = 0;
    var categories = Object.keys(this.filteredTechs);
    
    for (var i = 0; i < categories.length; i++) {
      var cat = this.filteredTechs[categories[i]];
      if (cat && cat.technologies) {
        totalTechs += cat.technologies.length;
      }
    }
    // Update counter
    if (this.el.techCount) {
      this.el.techCount.textContent = totalTechs + ' detected';
    }
    // Empty state
    if (totalTechs === 0) {
      if (this.el.techEmptyState) {
        this.el.techEmptyState.style.display = 'flex';
        this.el.techEmptyState.innerHTML = '<div class="tech-empty-icon">🤷</div><div class="tech-empty-text">No technologies detected</div>';
      }
      this.el.techCategories.innerHTML = '';
      if (this.el.tictactoeContainer) {
        this.el.tictactoeContainer.style.display = 'block';
        this.resetTTT();
      }
      return;
    }
    // Hide empty state
    if (this.el.techEmptyState) {
      this.el.techEmptyState.style.display = 'none';
    }
    if (this.el.tictactoeContainer) {
      this.el.tictactoeContainer.style.display = 'none';
    }
    // Sort categories by tech count
    var sortedCats = [];
    for (var j = 0; j < categories.length; j++) {
      var k = categories[j];
      var c = this.filteredTechs[k];
      if (c && c.technologies && c.technologies.length > 0) {
        sortedCats.push({key: k, cat: c});
      }
    }
    sortedCats.sort(function(a, b) { 
      return b.cat.technologies.length - a.cat.technologies.length; 
    });
    // Clear container
    this.el.techCategories.innerHTML = '';
    // Build DOM directly (Wappalyzer-style flat layout)
    for (var ci = 0; ci < sortedCats.length; ci++) {
      var catData = sortedCats[ci];
      var category = catData.cat;
      
      // Category header
      var catHeader = document.createElement('div');
      catHeader.className = 'tech-cat-header';
      catHeader.textContent = category.name || catData.key;
      this.el.techCategories.appendChild(catHeader);
      
      // Technologies in this category
      for (var ti = 0; ti < category.technologies.length; ti++) {
        var tech = category.technologies[ti];
        if (!tech || !tech.name) continue;
        
        var techRow = document.createElement('div');
        techRow.className = 'tech-row';
        
        // Icon with official logo
        var iconDiv = document.createElement('div');
        var techKey = tech.name.toLowerCase().replace(/[\s\.\-]+/g, '');
        iconDiv.className = 'tech-row-icon ' + techKey;
        
        // Try to get official logo
        var logoSvg = this.getTechLogo(tech.name);
        if (logoSvg) {
          iconDiv.innerHTML = logoSvg;
        } else {
          // Fallback to initials
          var initials = '';
          var nameParts = tech.name.split(/[\s\-]+/);
          for (var p = 0; p < Math.min(nameParts.length, 2); p++) {
            if (nameParts[p] && nameParts[p][0]) {
              initials += nameParts[p][0].toUpperCase();
            }
          }
          iconDiv.innerHTML = '<span class="tech-initials">' + (initials || '?') + '</span>';
        }
        techRow.appendChild(iconDiv);
        
        // Name
        var nameSpan = document.createElement('span');
        nameSpan.className = 'tech-row-name';
        nameSpan.textContent = tech.name;
        techRow.appendChild(nameSpan);
        
        // Version or confidence
        if (tech.version) {
          var versionSpan = document.createElement('span');
          versionSpan.className = 'tech-row-version';
          versionSpan.textContent = tech.version;
          techRow.appendChild(versionSpan);
        } else {
          var confSpan = document.createElement('span');
          confSpan.className = 'tech-row-conf';
          confSpan.textContent = (tech.confidence || 50) + '% sure';
          techRow.appendChild(confSpan);
        }
        
        // Link
        if (tech.website && tech.website !== '#') {
          var linkEl = document.createElement('a');
          linkEl.className = 'tech-row-link';
          linkEl.href = tech.website;
          linkEl.target = '_blank';
          linkEl.rel = 'noopener';
          linkEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
          techRow.appendChild(linkEl);
        }
        
        this.el.techCategories.appendChild(techRow);
      }
    }
  }
  // Get official tech logo SVG
  getTechLogo(techName) {
    const name = techName.toLowerCase();
    const logos = {
      // CMS
      'wordpress': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.051-.18 2.986-.51a.474.474 0 01-.039-.077l-2.789-7.618zm-7.206-2.2c0 2.39 1.39 4.46 3.41 5.45l-2.89-7.91c-.34.75-.52 1.58-.52 2.46zm15.1-.44c0-.75-.27-1.26-.5-1.66-.31-.5-.6-.93-.6-1.43 0-.56.43-1.08 1.03-1.08h.08c-1.09-1-2.54-1.6-4.13-1.6-2.14 0-4.02 1.1-5.12 2.76h.42c.69 0 1.75-.09 1.75-.09.35-.02.4.5.04.54 0 0-.36.04-.75.06l2.38 7.09 1.43-4.29-1.02-2.8c-.35-.02-.69-.06-.69-.06-.36-.02-.31-.56.04-.54 0 0 1.09.09 1.73.09.69 0 1.75-.09 1.75-.09.36-.02.4.5.04.54 0 0-.36.04-.75.06l2.36 7.03.66-2.17c.31-.97.52-1.66.52-2.26zM12 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm0-19.5c-5.238 0-9.5 4.262-9.5 9.5s4.262 9.5 9.5 9.5 9.5-4.262 9.5-9.5-4.262-9.5-9.5-9.5z"/></svg>',
      'shopify': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.337 3.415c-.014-.064-.073-.095-.124-.095-.05 0-1.017-.021-1.017-.021s-.674-.676-.753-.758c-.027-.03-.062-.047-.1-.055L12.49 21.29l5.987-1.293s-2.096-14.078-2.14-14.382v-.2zM12.17 7.544l-.478 1.498s-.504-.268-1.14-.268c-.916 0-.96.575-.96.72 0 .79 2.06 1.093 2.06 2.949 0 1.46-.923 2.398-2.17 2.398-1.493 0-2.26-.93-2.26-.93l.4-1.318s.787.677 1.45.677c.433 0 .609-.34.609-.592 0-1.033-1.69-1.079-1.69-2.778 0-1.428 1.025-2.814 3.1-2.814.798 0 1.18.228 1.18.228v.23zm-1.543-4.01c.053 0 .106.027.127.083l.743 2.272-.06.019-1.587.486c.152-.988.744-1.86 1.777-1.86z"/></svg>',
      'woocommerce': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.227 4.857A2.228 2.228 0 000 7.094v7.457c0 1.236 1 2.237 2.227 2.237h6.955l2.763 2.632a.178.178 0 00.3-.13v-2.502h9.528A2.228 2.228 0 0024 14.551V7.094a2.228 2.228 0 00-2.227-2.237H2.227zm8.473 8.925c-.217.503-.572.752-1.085.752-.373 0-.663-.105-.87-.308-.296-.29-.516-.842-.66-1.656l-.436-2.462c-.073-.418-.168-.717-.28-.896-.112-.178-.296-.267-.544-.267a.53.53 0 00-.36.145c-.109.096-.163.253-.163.47v4.944H4.15V9.42c0-.39.12-.71.364-.962.243-.253.563-.379.961-.379.474 0 .822.124 1.04.374.22.249.397.658.528 1.228l.413 2.29c.057.317.135.576.232.774.098.199.225.298.385.298.319 0 .534-.373.643-1.12l.47-3.213h2.06l-.535 3.556c-.078.523-.21.96-.398 1.31zm6.012-.01c-.25.49-.69.735-1.318.735-.46 0-.83-.153-1.11-.455-.28-.305-.42-.72-.42-1.242v-3.39c0-.52.14-.935.418-1.24.28-.303.65-.455 1.112-.455.628 0 1.068.243 1.318.73.168.328.25.82.25 1.479v1.34h-1.994v.79c0 .25.038.43.116.537.078.108.2.161.367.161.174 0 .299-.055.375-.164.076-.11.114-.302.114-.577v-.26h1.023v.264c-.001.688-.085 1.2-.252 1.537v.16zm-1.25-3.38v-.49c0-.297-.033-.51-.097-.639-.063-.128-.171-.193-.323-.193-.158 0-.269.063-.333.188-.063.125-.095.343-.095.654v.48h.848zm5.298 3.39c-.25.49-.69.735-1.318.735-.46 0-.83-.153-1.11-.455-.28-.305-.42-.72-.42-1.242v-3.39c0-.52.14-.935.418-1.24.28-.303.65-.455 1.112-.455.628 0 1.068.243 1.318.73.168.328.25.82.25 1.479v1.34h-1.994v.79c0 .25.038.43.116.537.078.108.2.161.367.161.174 0 .299-.055.375-.164.076-.11.114-.302.114-.577v-.26h1.023v.264c-.001.688-.085 1.2-.252 1.537v.16zm-1.25-3.38v-.49c0-.297-.033-.51-.097-.639-.063-.128-.171-.193-.323-.193-.158 0-.269.063-.333.188-.063.125-.095.343-.095.654v.48h.848z"/></svg>',
      'wix': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.059 6.329c-.354.36-.63.979-.692 1.395-.052.35-.067.725-.067 1.327v4.928c0 1.09.095 1.613.385 2.006.277.375.713.604 1.266.686v.166h-4.129v-.166c.547-.074.994-.292 1.266-.65.298-.39.386-.955.386-2.042V9.364c0-.792-.011-1.204-.066-1.594-.065-.461-.35-.846-.723-1.062l-.116-.077h4.296c-.453.166-.597.389-.74.556-.172.211-.266.395-.372.6l-2.17 8.023h-.166l-2.02-6.254-2.02 6.254h-.164l-2.312-8.334a2.37 2.37 0 00-.392-.678c-.135-.155-.347-.351-.816-.54h4.408l-.096.061c-.329.173-.56.419-.645.68-.068.207-.048.476.096.962l1.308 4.523 1.387-4.327-.29-.968c-.14-.472-.274-.748-.43-.912-.163-.17-.37-.27-.68-.346H18.06l-.001.542z"/></svg>',
      'squarespace': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.003 2.25c-.94 0-1.877.358-2.593 1.074L2.174 10.56c-1.432 1.432-1.432 3.755 0 5.187l6.093 6.093c.716.716 1.654 1.074 2.593 1.074.94 0 1.877-.358 2.593-1.074l7.237-7.236c1.432-1.432 1.432-3.755 0-5.187L13.454 2.18a3.656 3.656 0 00-1.45-1.074zM7.91 18.177L5.58 15.847l6.423-6.423 2.33 2.33-6.423 6.423z"/></svg>',
      'webflow': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.802 8.56s-1.946 6.091-2.05 6.442c-.05-.37-.837-6.442-.837-6.442a2.66 2.66 0 00-2.633-2.203h-1.475s1.404 5.798 1.554 6.364c-.16-.443-2.882-6.364-2.882-6.364A2.66 2.66 0 006.85 4.152H3.947v.125c.5.14.949.449 1.313.91.324.41.565.882.713 1.392l2.455 8.71a2.66 2.66 0 002.577 1.959h1.188l1.84-5.713 1.677 5.713h1.19a2.66 2.66 0 002.577-1.96l2.453-8.73c.146-.507.387-.98.71-1.389a2.41 2.41 0 011.312-.91v-.124h-4.323A2.66 2.66 0 0017.802 8.56z"/></svg>',
      'drupal': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.78 5.113C14.09 3.425 12.48 1.815 11.998 0c-.48 1.815-2.09 3.425-3.778 5.113-2.534 2.53-5.405 5.4-5.405 9.702a9.184 9.185 0 1018.368 0c0-4.303-2.871-7.171-5.405-9.702z"/></svg>',
      'joomla': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.595 5.595a4.236 4.236 0 011.737-1.194 3 3 0 014.943 2.062l3.567 3.567a4.236 4.236 0 011.194-1.737 3 3 0 00-4.244-4.244l-3.566-3.566A3 3 0 008.04.5a4.236 4.236 0 01-1.445 5.095zm10.81 0a4.236 4.236 0 00-1.194-1.737 3 3 0 00-2.062 4.943l3.567 3.567a4.236 4.236 0 00-1.737 1.194 3 3 0 004.244-4.244l3.566-3.566a3 3 0 00-1.983-2.186 4.236 4.236 0 00-4.401 2.029z"/></svg>',
      'magento': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 24l-4.455-2.572v-12L12 6.857l4.455 2.571v12L12 24zm5.727-14.286L12 6l-5.727 3.714V22.29L12 24.857l5.727-2.571V9.714zm-11.454 0L12 6l5.727 3.714v4.572L12 17.143l-5.727-2.857V9.714z"/></svg>',
      
      // JavaScript Frameworks
      'react': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9.861A2.139 2.139 0 1014.139 12 2.139 2.139 0 0012 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 001.363 3.578l.101.213-.101.213a23.307 23.307 0 00-1.363 3.578l-.133.467zm-.467-7.4C2.593 9.85 1 11.07 1 11.996c0 .926 1.593 2.146 4.541 3.14a24.569 24.569 0 011.106-3.14 24.532 24.532 0 01-1.106-3.14zm11.451 7.4l-.133-.468a23.357 23.357 0 00-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 001.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm.134-3.951a24.644 24.644 0 011.106 3.14c2.948-.994 4.54-2.214 4.54-3.14 0-.926-1.592-2.145-4.54-3.14a24.644 24.644 0 01-1.106 3.14z"/><path d="M5.541 21.065l-.238-.41a23.18 23.18 0 01-1.591-3.418l-.153-.446.438-.183c1.224-.507 2.503-.9 3.81-1.177l.224-.047.112.202a23.13 23.13 0 002.093 3.182l.315.39-.353.348a10.93 10.93 0 01-4.657 1.559zm-1.22-4.165a24.47 24.47 0 001.302 2.791 9.91 9.91 0 003.366-1.127 24.47 24.47 0 00-1.712-2.601 24.45 24.45 0 00-2.957.937zm14.137 4.165l-.238-.41a10.93 10.93 0 01-4.657-1.559l-.353-.348.315-.39a23.13 23.13 0 002.094-3.182l.112-.202.223.047c1.308.276 2.587.67 3.811 1.177l.438.183-.153.446a23.18 23.18 0 01-1.592 3.418l-.238.41v.41zm.004-4.063a24.47 24.47 0 00-1.712 2.601 9.902 9.902 0 003.366 1.127 24.47 24.47 0 001.302-2.79 24.45 24.45 0 00-2.956-.938z"/></svg>',
      'vue': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78L24 1.61zM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43L12 14.08z"/></svg>',
      'vuejs': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78L24 1.61zM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43L12 14.08z"/></svg>',
      'angular': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z"/></svg>',
      'svelte': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.08 3.007c-2.793-3.168-7.861-3.652-11.27-1.078L4.408 5.232c-1.376.99-2.287 2.478-2.566 4.183-.233 1.397-.013 2.837.632 4.116-.422.707-.698 1.49-.812 2.305-.262 1.734.106 3.51 1.034 4.986C5.49 24 10.556 24.483 13.965 21.91l4.403-3.304c1.376-.99 2.287-2.478 2.566-4.183.233-1.397.013-2.837-.632-4.116.422-.707.698-1.49.812-2.305.262-1.733-.106-3.51-1.034-4.986v-.01zM9.691 21.061a4.427 4.427 0 01-4.768-1.632 4.21 4.21 0 01-.685-3.323c.073-.403.2-.793.378-1.16l.138-.249.251.19c.694.524 1.47.936 2.298 1.22l.218.066-.02.217a1.269 1.269 0 00.233.948 1.33 1.33 0 001.432.49c.16-.043.312-.11.452-.2l4.403-3.304c.216-.162.369-.394.433-.654a1.268 1.268 0 00-.204-.998 1.33 1.33 0 00-1.432-.49c-.16.043-.313.11-.452.2l-1.68 1.262a4.428 4.428 0 01-1.504.663 4.428 4.428 0 01-4.768-1.632 4.21 4.21 0 01-.685-3.323 4.162 4.162 0 011.44-2.178l4.404-3.304a4.428 4.428 0 011.504-.663A4.427 4.427 0 0114.31 2.94a4.21 4.21 0 01.685 3.322 4.033 4.033 0 01-.378 1.16l-.138.25-.251-.191a8.374 8.374 0 00-2.298-1.22l-.218-.066.02-.217a1.268 1.268 0 00-.232-.948 1.33 1.33 0 00-1.432-.49c-.16.043-.313.11-.452.2L5.21 8.045a1.296 1.296 0 00-.433.654c-.08.34-.025.698.155.997a1.33 1.33 0 001.432.49c.16-.043.313-.11.452-.2l1.68-1.263a4.428 4.428 0 011.504-.663 4.428 4.428 0 014.768 1.632 4.21 4.21 0 01.685 3.323 4.162 4.162 0 01-1.44 2.178l-4.404 3.304a4.428 4.428 0 01-1.504.663h-.414z"/></svg>',
      'next': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z"/></svg>',
      'nextjs': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z"/></svg>',
      'nuxt': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.464 19.83H2.773a1.456 1.456 0 01-1.262-.727 1.473 1.473 0 010-1.466l6.392-11.11a1.456 1.456 0 012.524 0l1.762 3.06 3.537-6.149a1.456 1.456 0 012.525 0l4.97 8.635a1.456 1.456 0 01-1.261 2.194h-3.75l2.357 4.097a1.473 1.473 0 010 1.466 1.456 1.456 0 01-1.261.727h-5.802zm5.629-9.32l-3.17 5.507h3.75a.485.485 0 00.42-.727l-3.169-5.507a.485.485 0 00-.842 0l-1.262 2.193 1.682 2.92h.252a.485.485 0 00.42-.243l1.92-3.338v-.805z"/></svg>',
      'gatsby': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2.571c3.171 0 5.915 1.543 7.629 3.858l-1.286 1.115C16.886 5.572 14.571 4.286 12 4.286c-3.343 0-6.171 2.143-7.286 5.143l9.857 9.857c2.486-.857 4.373-3 4.972-5.572h-4.115V12h6c0 4.457-3.172 8.228-7.372 9.17L2.83 9.943C3.772 5.743 7.543 2.57 12 2.57zm-9.429 9.6l9.258 9.258c-5.057-.257-9-4.457-9.258-9.257z"/></svg>',
      'jquery': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.525 13.095c-.03-.078-.047-.234-.047-.234s-.091-.33-.14-.694a7.594 7.594 0 01-.012-.6c-.005-.1-.01-.1-.015-.1-.047.002-.11.025-.11.025s-.063.028-.14.09c-.08.064-.11.108-.11.108s-.033.064-.1.122c-.1.086-.145.15-.145.15s-.063.11-.203.215c-.2.15-.323.263-.323.263s-.11.156-.366.312c-.41.248-.71.376-.71.376s-.166.16-.607.29c-.735.215-1.337.263-1.337.263S-3.523 13.776.54 12.96c1.188-.237 2.56-.33 4.253-.16 2.98.3 7.036 1.67 11.32 4.74 0 0-4.8-4.37-11.62-5.92-4.2-.95-7.74-.45-9.17.1.02.002 2.36-.91 6.66-.04 3.68.76 8.45 3.07 11.8 6.73 0 0-3.86-4.55-11.02-6.7-4.16-1.23-7.52-.77-8.73-.33 0 0 2.78-1.06 7.5.01 4.74 1.08 10.86 4.35 14.18 9.87 0 0-2.47-5.17-9.05-8.53-3.93-2-7.8-2.5-9.96-2.33 0 0 3.66-1.02 9.1.8 4.98 1.68 10.22 5.63 13.14 12.1 0 0-.7-5.45-6.5-10.5-3.15-2.73-7.73-4.73-10.99-5.08 0 0 4.78-.53 10.47 2.3 3.93 1.96 9.06 5.83 11.44 12.87 0 0-.06-5.84-5.17-11.61-3.2-3.61-7.97-6.23-11.53-6.93 0 0 5.35.3 10.63 3.62 3.56 2.24 7.88 6.24 9.78 13.37 0 0 .44-5.53-4.04-11.58-2.43-3.28-6.17-6.57-10.44-8.04 0 0 4.96 1.38 10 5.2 3.75 2.83 7.2 7.25 8.5 13.38 0 0 .73-4.2-2.1-9.76-2.14-4.2-6.57-8.5-11.04-10.26 0 0 4.45 2.1 8.8 6.53 3.2 3.26 6.13 8.34 6.4 14.1 0 0 .74-3.9-1.38-8.78-1.83-4.23-5.74-8.72-10.5-11.16 0 0 4.15 2.72 7.84 7.14 2.72 3.27 5.18 8.04 4.96 13.45 0 0 .73-3.3-.77-7.8-1.42-4.22-5.05-8.92-9.7-11.67 0 0 3.72 3.05 6.77 7.36 2.25 3.18 4.22 7.78 3.66 12.71 0 0 .64-2.73-.42-6.72-1.13-4.23-4.58-9.1-9.06-12.07 0 0 3.38 3.37 5.96 7.62 1.88 3.1 3.4 7.53 2.58 11.94 0 0 .48-2.22-.08-5.63-.68-4.13-3.45-9.24-7.49-12.37l.006.01c-.065-.058-.197-.163-.413-.31a8.2 8.2 0 00-1.077-.617c-.69-.324-1.56-.596-2.606-.773-3.29-.555-8.07.073-13.493 3.075 0 0 6.38-4.405 13.72-2.95 1.24.246 2.32.685 3.17 1.243-.044-.03-.086-.058-.13-.088-.83-.58-1.92-1.05-3.19-1.32-5.02-1.07-12.2.77-17.34 6.62 0 0 5.6-6.9 14.56-6.73 1.44.03 2.72.3 3.83.74-.043-.02-.087-.038-.13-.058-.94-.37-2.14-.62-3.51-.67-6.37-.23-14.66 3.94-18.57 12.63 0 0 3.56-9.04 12.77-12.24 1.32-.46 2.56-.7 3.7-.78-.04 0-.082 0-.123-.002-.95-.04-2.04.08-3.23.35-6.55 1.47-13.64 8.02-14.71 17.78l.003-.04c.063-.58.16-1.15.292-1.71.43-1.82 1.21-3.56 2.21-5.14 2.01-3.18 5-5.83 8.27-7.23 1.17-.5 2.35-.84 3.49-1.02-.04.006-.08.01-.12.018-1.08.17-2.17.52-3.24 1.02-3.03 1.42-5.83 4.04-7.64 7.2-.9 1.57-1.56 3.29-1.87 5.1-.32 1.86-.26 3.78.34 5.64 0 0-1.03-3.01-.02-6.45.67-2.28 1.97-4.6 3.8-6.54 1.8-1.9 4.04-3.45 6.44-4.35.82-.3 1.65-.52 2.47-.65-.03.004-.058.01-.088.014-.74.13-1.47.35-2.18.65-2.12.9-4.09 2.43-5.6 4.31-1.55 1.94-2.6 4.27-3.02 6.57-.46 2.47-.22 4.9.83 7.15 0 0-1.57-3.38-.72-7.08.55-2.4 1.85-4.87 3.8-6.85 1.9-1.93 4.36-3.4 6.9-3.98.64-.15 1.29-.24 1.92-.26-.025.002-.05.005-.075.007-.53.05-1.05.16-1.56.32-1.82.57-3.52 1.72-4.86 3.24-1.87 2.11-3.1 4.97-3.22 7.68-.15 3.16.97 6.21 3.17 8.59 0 0-2.92-3.24-3.07-7.05-.1-2.54.79-5.26 2.47-7.48 1.65-2.18 4.06-3.87 6.56-4.47.5-.12.99-.18 1.47-.2-.02 0-.04.002-.06.003-.4.03-.78.1-1.16.2-1.87.5-3.67 1.77-5 3.56-1.36 1.85-2.14 4.21-2.19 6.48-.06 2.67.88 5.27 2.69 7.35 0 0-2.37-2.73-2.66-5.94-.2-2.14.3-4.48 1.45-6.5 1.13-1.97 2.87-3.63 4.81-4.55.37-.17.74-.31 1.1-.41-.015.004-.03.01-.046.014-.3.1-.58.22-.85.37-1.4.76-2.58 2.1-3.36 3.73-.96 2.03-1.26 4.45-.79 6.63.54 2.57 2.1 4.86 4.35 6.34 0 0-2.83-2.17-3.74-5-.6-1.87-.5-4.05.32-6 .8-1.91 2.23-3.58 3.96-4.56.26-.15.52-.27.77-.37-.01.004-.02.008-.034.012-.2.08-.38.18-.56.29-1.17.7-2.1 1.86-2.66 3.27-.68 1.72-.76 3.76-.17 5.55.68 2.07 2.15 3.86 4.07 4.96 0 0-2.36-1.6-3.36-3.82-.67-1.47-.74-3.22-.23-4.82.5-1.56 1.54-2.95 2.86-3.87.16-.11.31-.2.47-.29-.008.005-.015.01-.023.015-.11.07-.21.14-.31.22-.87.67-1.52 1.65-1.88 2.77-.43 1.34-.37 2.9.2 4.26.65 1.55 1.88 2.84 3.4 3.62 0 0-1.9-1.21-2.68-2.87-.52-1.1-.6-2.42-.2-3.62.38-1.18 1.2-2.22 2.24-2.93 0 0-.86.65-1.37 1.62-.48.92-.6 2.1-.28 3.14.37 1.2 1.25 2.23 2.37 2.85l-.03-.03z"/></svg>',
      
      // CSS Frameworks  
      'tailwind': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>',
      'tailwindcss': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>',
      'bootstrap': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.77 11.24H9.956V8.202h2.152c1.17 0 1.834.522 1.834 1.466 0 1.008-.773 1.572-2.174 1.572zm.324 1.206H9.957v3.348h2.231c1.459 0 2.232-.585 2.232-1.685s-.795-1.663-2.326-1.663zM24 11.39v1.218c-1.128.108-1.817.944-2.226 2.268-.407 1.319-.463 2.937-.42 4.186.045 1.3-.968 2.5-2.337 2.5H4.985c-1.37 0-2.383-1.2-2.337-2.5.043-1.249-.013-2.867-.42-4.186-.41-1.324-1.1-2.16-2.228-2.268V11.39c1.128-.108 1.819-.944 2.227-2.268.408-1.319.464-2.937.42-4.186-.045-1.3.968-2.5 2.338-2.5h14.032c1.37 0 2.382 1.2 2.337 2.5-.043 1.249.013 2.867.42 4.186.409 1.324 1.098 2.16 2.226 2.268zm-7.927 2.817c0-1.354-.953-2.333-2.368-2.488v-.057c1.04-.169 1.856-1.135 1.856-2.213 0-1.537-1.213-2.538-3.062-2.538h-4.16v10.172h4.181c2.218 0 3.553-1.086 3.553-2.876z"/></svg>',
      'bulma': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.16 18.886L3.582 12.31 9.063 6.83l1.613 1.613L14.9 4.217l5.484 5.483-6.873 9.186z"/></svg>',
      
      // Analytics
      'google analytics': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.84 2.9992v17.2016A3.8 3.8 0 0119.0403 24H4.9597a3.8 3.8 0 01-3.7997-3.7992V2.9992A3 3 0 014.1603 0h15.6794a3 3 0 013.0003 2.9992zM17.75 18a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM8.8203 7.9004a5.2696 5.2696 0 105.27 5.2703 5.2696 5.2696 0 00-5.27-5.2703zm0 7.5005a2.23 2.23 0 112.23-2.23 2.2301 2.2301 0 01-2.23 2.23z"/></svg>',
      'hotjar': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.168 0s-.912 4.987-5.475 7.965c-2.41 1.587-3.39 3.96-3.478 5.693-.05.976.15 2.095 1.906 2.604 1.16.337 2.883-.198 3.621-1.014.915-1.013 2.063-2.577 3.24-4.952C17.67 6.76 16.168 0 16.168 0zM9.674 13.082c.875-1.623 2.449-2.778 2.449-2.778s1.016 1.988-.085 4.317c-1.101 2.33-3.593 3.564-3.593 3.564s.354-3.48 1.23-5.103zm2.573 4.91c-.975.98-2.503 1.469-2.503 1.469s.578 2.604 2.188 4.05c.6.54 1.12.47 1.381.03.243-.403.162-1.008-.005-1.441-.285-.74-.73-1.382-1.061-4.108z"/></svg>',
      'mixpanel': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.002 0C5.374 0 0 5.374 0 12.002s5.374 12.002 12.002 12.002 12.002-5.374 12.002-12.002S18.63 0 12.002 0zm5.192 17.594H6.81V6.406h10.384v11.188z"/></svg>',
      'segment': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.168 9.746h14.472v1.834H2.168zm0 5.135h14.472v1.834H2.168zm0-10.27H19.36v1.834H2.168zM21.832 6.31a2.168 2.168 0 110 4.336 2.168 2.168 0 010-4.336zm0 8.17a2.168 2.168 0 110 4.337 2.168 2.168 0 010-4.336z"/></svg>',
      
      // Hosting / CDN
      'cloudflare': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.509 16.845l.586-2.088a1.688 1.688 0 00-.063-1.16 1.534 1.534 0 00-.846-.803l-8.627-.015a.222.222 0 01-.193-.11.23.23 0 01-.003-.229.222.222 0 01.198-.123l8.699.015a3.024 3.024 0 002.737-1.81l.697-1.953a.383.383 0 00.02-.227 6.145 6.145 0 00-11.88-.515 3.833 3.833 0 00-2.79-.285 3.882 3.882 0 00-2.676 2.792 6.167 6.167 0 00-.196 1.375.303.303 0 00.299.314c.01 0 3.387 0 3.387.001a.227.227 0 01.222.23.222.222 0 01-.223.222H.308a.303.303 0 00-.298.371 4.87 4.87 0 004.705 3.73h11.38a.222.222 0 00.207-.14l.206-.59z"/></svg>',
      'vercel': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 22.525H0l12-21.05 12 21.05z"/></svg>',
      'netlify': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.934 8.519a1.044 1.044 0 01.303.023l2.965.753-4.207 4.207-1.71-.108-.033-.003a.958.958 0 01-.67-.317.95.95 0 01-.237-.7l.078-1.882 3.51-1.973zm-.337 6.528l-3.198 3.198-.309-1.18-.009-.032a1.048 1.048 0 01.2-.877l.003-.003a.953.953 0 01.699-.388l.081-.007 2.533.289zm-5.351 5.351l-.58.58H8.902l4.129-4.129.558 2.132.005.015a.96.96 0 01-.348.887v.515zm7.89-7.89l2.406 2.406.002-2.406h-2.408zM4.52 14.641L2.406 12.527l2.114-.474v2.588zm12.332-9.652l4.352 4.35-.453.234-.005.002a.958.958 0 01-.727.053h-.003a1.047 1.047 0 01-.39-.245l-1.903-1.903-.308-1.178-.005-.017a1.048 1.048 0 01.195-.883l.003-.003a.953.953 0 01.703-.39l.081-.008.46-.012zm.912 4.962l1.528 1.527H15.5l2.264-1.527zm-5.49-7.545l4.353 4.351-.758 1.81-.006.017a1.048 1.048 0 01-.502.578.963.963 0 01-.88.009l-.003-.001-1.634-.812-1.137-.338-.008-.003a1.048 1.048 0 01-.574-.503.962.962 0 01-.002-.896l.93-1.868-.432-.432L16.28 0h.995l2.877 2.877-6.878-.521zm-.406.784L9.41 5.598 8.694 4.5l3.134-.238.04-.072zM3.56 11.24L4.882 9.5l.59 2.257.016.055a1.048 1.048 0 01-.196.883l-.003.003a.954.954 0 01-.703.391l-.081.008-2.29.122 1.346-1.98zm6.73-7.545l-.376.755-1.903-.143-1.462 1.175L3.964 6.76 6.54 4.207l3.751-.512zm-.07 6.076l.08 1.927.003.089a1.047 1.047 0 01-.28.78.959.959 0 01-.782.298H9.16l-1.976-.119-.428-.39 2.167-2.167.02-.018a.956.956 0 01.53-.22l.086-.005 1.093-.004-.431.829zM9.21 7.206l1.477-.265.014-.002a1.05 1.05 0 01.64.1c.236.122.415.33.5.583l.005.015.34 1.1-.49.983-.007.013a1.047 1.047 0 01-.648.527.96.96 0 01-.844-.124l-.694-.533-2.167-.115 1.875-2.282zm-6.804 6.4l2.177-.116.514.466-1.27 1.87-1.42-2.22z"/></svg>',
      'aws': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 01-.28.104.488.488 0 01-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 01.224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 011.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 00-.735-.136 6.02 6.02 0 00-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 01-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 01.32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 01.311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 01-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 01-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 01-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 00.415-.758.777.777 0 00-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 01-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 01.24.2.43.43 0 01.071.263v.375c0 .168-.064.256-.184.256a.83.83 0 01-.303-.096 3.652 3.652 0 00-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.27-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.385.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/></svg>',
      'nginx': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L1.605 6v12L12 24l10.395-6V6L12 0zm6 16.59c0 .705-.646 1.29-1.529 1.29-.631 0-1.351-.255-1.801-.81l-4.905-6.405V17.58c0 .645-.6 1.29-1.38 1.29H7.59c-.72 0-1.41-.645-1.41-1.29V7.41c0-.705.63-1.29 1.5-1.29.66 0 1.35.255 1.8.81l4.905 6.405V6.42c0-.63.63-1.29 1.38-1.29h.75c.72 0 1.38.66 1.38 1.29v10.17h.105z"/></svg>',
      'apache': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.904 13.833l.753-2.54a4.932 4.932 0 00-3.282 3.098c.786-.33 1.636-.53 2.53-.558zm-3.758 3.427c-.243-.203-.479-.418-.697-.654l-.675 2.293 1.372-1.639zm3.068-3.344l-.812 2.733a4.91 4.91 0 002.546-.554l-.753-2.562c-.32.167-.66.303-1.018.383h.037zm4.858-1.46l-1.47 4.953a4.864 4.864 0 001.394-1.173l.584-1.975a4.884 4.884 0 00-.508-1.806zm-7.88 7.18l.662-2.235a4.877 4.877 0 01-.662-1.639l-.788 2.655c.243.42.508.83.788 1.22zm10.09-3.638l-.66 2.228a17.45 17.45 0 002.24-1.98l.65-2.188a17.24 17.24 0 01-2.23 1.94zm-1.71 3.015l.636-2.143a4.875 4.875 0 01-1.697 1.403l-.636 2.144a11.697 11.697 0 001.697-1.404zm3.803-4.82l-1.023 3.448a21.37 21.37 0 003.27-2.935l1.023-3.446a21.235 21.235 0 01-3.27 2.932zm-8.09 7.84l-.593 2a17.25 17.25 0 002.53-.508l.593-2a17.35 17.35 0 01-2.53.508zm3.87-.998l.626-2.112a11.614 11.614 0 01-1.697.44l-.625 2.11a17.26 17.26 0 001.697-.438zm7.845-9.066l-1.59 5.36a26.1 26.1 0 004.21-3.665l1.59-5.36a26.01 26.01 0 01-4.21 3.665zM24 4.31l-1.988 6.7a30.04 30.04 0 004.988-4.71V4.31H24zM7.174 23.1l.6-2.02a13.79 13.79 0 01-1.727-.67l-.603 2.033c.556.258 1.137.483 1.73.657zm7.08-1.97l1.137-3.83a8.77 8.77 0 01-1.727.813l-1.137 3.83a13.9 13.9 0 001.727-.813zm-3.92 1.497l.74-2.49a11.63 11.63 0 01-1.698.224l-.74 2.492c.56-.044 1.13-.125 1.698-.226zm-5.22-2.274l.745-2.508a10.7 10.7 0 01-1.633-.916l-.748 2.52a13.76 13.76 0 001.635.904zm-2.903-1.94l.887-2.99a13.5 13.5 0 01-1.45-1.202l-.886 2.99c.45.427.936.836 1.45 1.202z"/></svg>',
      
      // Payment
      'stripe': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>',
      'paypal': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 00-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 00.554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 01.923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>',
      
      // Misc
      'node': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.998 24c-.321 0-.641-.084-.922-.247L8.14 22.016c-.439-.245-.224-.332-.08-.383.548-.192.659-.236 1.243-.57.062-.035.141-.022.204.017l2.257 1.34c.082.045.198.045.275 0l8.8-5.08c.082-.045.135-.136.135-.231V6.887c0-.1-.053-.186-.138-.235l-8.795-5.076c-.082-.05-.192-.05-.274 0L2.972 6.652c-.087.049-.14.137-.14.236v10.172c0 .094.055.183.134.228l2.41 1.392c1.308.654 2.108-.117 2.108-.89V7.78c0-.136.11-.248.248-.248h1.08c.133 0 .247.112.247.248v10.011c0 1.745-.95 2.746-2.604 2.746-.508 0-.909 0-2.026-.55l-2.309-1.33A1.85 1.85 0 011.2 17.058V6.887c0-.675.362-1.303.95-1.641L10.95.167a1.928 1.928 0 011.847 0l8.8 5.08c.585.337.95.966.95 1.64v10.172c0 .674-.365 1.302-.95 1.64l-8.8 5.078c-.282.16-.6.247-.929.247h.13zm2.717-6.99c-3.843 0-4.648-1.766-4.648-3.247 0-.137.11-.248.247-.248h1.103c.124 0 .227.09.246.212.169 1.14.666 1.715 2.935 1.715 1.805 0 2.576-.41 2.576-1.367 0-.553-.218-.963-3.025-1.238-2.345-.234-3.794-.75-3.794-2.63 0-1.734 1.463-2.766 3.916-2.766 2.756 0 4.117 .957 4.29 3.008a.248.248 0 01-.247.274h-1.108a.246.246 0 01-.238-.191c-.264-1.175-.908-1.55-2.697-1.55-1.986 0-2.22.692-2.22 1.21 0 .628.272.81 2.932 1.166 2.632.35 3.889.847 3.889 2.686 0 1.873-1.561 2.944-4.285 2.944l.128.022z"/></svg>',
      'nodejs': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.998 24c-.321 0-.641-.084-.922-.247L8.14 22.016c-.439-.245-.224-.332-.08-.383.548-.192.659-.236 1.243-.57.062-.035.141-.022.204.017l2.257 1.34c.082.045.198.045.275 0l8.8-5.08c.082-.045.135-.136.135-.231V6.887c0-.1-.053-.186-.138-.235l-8.795-5.076c-.082-.05-.192-.05-.274 0L2.972 6.652c-.087.049-.14.137-.14.236v10.172c0 .094.055.183.134.228l2.41 1.392c1.308.654 2.108-.117 2.108-.89V7.78c0-.136.11-.248.248-.248h1.08c.133 0 .247.112.247.248v10.011c0 1.745-.95 2.746-2.604 2.746-.508 0-.909 0-2.026-.55l-2.309-1.33A1.85 1.85 0 011.2 17.058V6.887c0-.675.362-1.303.95-1.641L10.95.167a1.928 1.928 0 011.847 0l8.8 5.08c.585.337.95.966.95 1.64v10.172c0 .674-.365 1.302-.95 1.64l-8.8 5.078c-.282.16-.6.247-.929.247h.13z"/></svg>',
      'php': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 01-.349.903c-.17.283-.39.527-.657.727zm4.89 2.396l.538-2.77c.076-.39.04-.68-.111-.865-.151-.185-.464-.278-.939-.278h-1.09l-.677 3.913H10.03l1.229-6.326h1.32l-.327 1.682h1.2c.798 0 1.348.15 1.651.45.304.3.394.755.272 1.365l-.557 2.828h-1.328l-.001.001zm6.086-2.095c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164h-1.18l-.328 1.681h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.418.477 1.002.33 1.752a2.836 2.836 0 01-.348.903 2.169 2.169 0 01-.657.727v-.08h.14zm-.4-1.463c.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.456-.559.55-1.049z"/></svg>',
      'python': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22zM21.1 6.11l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01.21.03zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08-.33.23z"/></svg>',
      'ruby': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089v.026-.029.003zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.048-6.22 3.612-9.753h.003z"/></svg>',
      'laravel': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 01.375 0L9.93 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.375 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033a.3.3 0 01.024.06c.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.51 7.75v-4.287l-2.146 1.225-6.127 3.498v4.325zM1.093 3.624v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003H5.04c-.014-.01-.025-.021-.04-.031-.011-.01-.024-.018-.035-.027l-.001-.002c-.013-.012-.021-.025-.031-.04-.01-.011-.021-.022-.028-.036h-.002c-.01-.014-.015-.03-.022-.046-.006-.01-.014-.022-.018-.034l-.004-.017c-.008-.017-.01-.035-.014-.054-.004-.013-.008-.027-.008-.04v-.085-.01-9.739l-2.18-1.254-1.578-.91-.003.006zm3.763-2.2L1.095 3.272l3.76 2.164 3.758-2.164-3.757-2.848zm2.094 14.744l2.178-1.25V4.249L7.55 5.157 5.369 6.413v10.705h.002zm10.614-9.62l-3.76 2.164 3.76 2.163 3.76-2.164-3.76-2.163zm-.377 4.976l-2.182-1.256-1.579-.908v4.283l2.182 1.256 1.579.908v-4.283zm-8.652 6.254l5.52-3.152 2.756-1.572-3.757-2.163-4.324 2.49-3.939 2.267z"/></svg>',
      'django': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.146 0h3.924v18.166c-2.013.382-3.491.535-5.096.535-4.791 0-7.288-2.166-7.288-6.32 0-4.002 2.65-6.6 6.753-6.6.637 0 1.121.05 1.707.203zm0 9.143a3.894 3.894 0 00-1.325-.204c-1.988 0-3.134 1.223-3.134 3.365 0 2.09 1.096 3.236 3.109 3.236.433 0 .79-.025 1.35-.102V9.142zM21.314 6.06v9.098c0 3.134-.229 4.638-.917 5.937-.637 1.249-1.478 2.039-3.211 2.905l-3.644-1.733c1.733-.815 2.574-1.53 3.109-2.625.561-1.121.739-2.421.739-5.835V6.059h3.924zM17.39.021h3.924v4.026H17.39z"/></svg>',
      'express': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957 6.272 6.272 0 01-7.306-.933 6.575 6.575 0 01-1.64-3.858c0-.235-.08-.455-.134-.666A88.33 88.33 0 010 11.577zm1.127-.286h9.654c-.06-3.076-2.001-5.258-4.59-5.278-2.882-.04-4.944 2.094-5.071 5.264z"/></svg>',
      'mongodb': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/></svg>',
      'mysql': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.063h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.723-1.006 1.084-1.574 1.084-.16 0-.357-.047-.593-.14v-.493c.116.016.222.024.32.024.357 0 .636-.1.838-.303.235-.24.352-.57.352-.985 0-.3-.072-.737-.214-1.313L6.3 13.135h.873l.685 2.756c.162.625.21 1.1.146 1.425-.348-.168-.597-.358-.747-.573-.213-.293-.32-.68-.32-1.163l-.008-.54z"/></svg>',
      'postgresql': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5586 14.7227c-.4102-.1778-1.0019-.246-1.5742-.1524-.1895.0283-.3574.0713-.5117.127-.0264-.0889-.0528-.1778-.0781-.2715l.4961-.0664c1.3828-.1856 2.9355-1.127 2.9355-2.3652 0-1.461-1.3252-2.291-2.3496-2.8516-.166-.0918-.3262-.1807-.4805-.2676-.2578-.1445-.4394-.4316-.6054-.7148-.166-.2813-.332-.5606-.54-.8379-.2481-.3281-.7227-.7207-1.2637-1.1622-1.1328-.9238-2.5508-2.0742-2.5508-3.0078 0-.7813.8438-1.4414 1.7344-2.1406.6309-.4922 1.293-1.0117 1.7187-1.6328.5606-.8184.6231-1.8926.168-2.8984C19.7617.1699 18.6035 0 17.7168 0c-1.7617 0-3.2656.8477-4.0703 2.2852-.5547-.7852-1.4355-1.2559-2.4805-1.2559-1.0879 0-2.041.5312-2.6426 1.4609-.4336.6698-.6953 1.5127-.6953 2.4942v3.8437c-1.1035.2266-2.1426.5508-3.0234.959C2.25 10.8652.0293 12.9961.0293 15.5586c0 2.0859.918 4.0625 2.5898 5.5723 1.4883 1.3437 3.4688 2.0898 5.584 2.0898.8164 0 1.6133-.0918 2.3789-.2754.9063-.2168 1.7539-.5449 2.5039-1.0019.5156.1953 1.0742.3262 1.6523.3965 1.0703.1289 2.2207-.0137 3.209-.4727 1.3711-.6367 2.5137-1.8008 3.1191-3.2363.0996-.2363.1856-.4863.252-.7441l.207-.8106c.6035-.4062 1.1738-.9023 1.6914-1.4453.8438-.8867 1.541-1.9453 1.541-3.0664 0-.6504-.2715-1.1387-.6914-1.461zm-8.9238-9.4629c.3535-.5508.8594-.8301 1.5039-.8301.3809 0 .6856.1094.9063.3242.2012.1973.334.4746.3945.8242l.0352.207c.0654.3438.0615.7188-.0176 1.0781-.248 1.1211-1.2949 2.4492-2.0703 3.3399-.2617.3008-.502.5703-.6993.7969-.1113.127-.2187.2519-.3242.3769-.6464-.7519-1.082-1.5878-1.2675-2.4628-.3516-1.6563.0977-3.0352 1.5391-3.9453zm-3.457.7637c.5722 0 1.0352.4101 1.0352.918 0 .5079-.4629.918-1.0352.918-.5722 0-1.0351-.4101-1.0351-.918 0-.5078.463-.918 1.0351-.918zm-3.1269 1.9687c0-.6445.1817-1.207.5098-1.582.3047-.3476.7246-.5312 1.2148-.5312.5352 0 .9297.2051 1.1954.5098-.1778.252-.2852.5683-.2852.9121 0 .8516.6934 1.543 1.543 1.543.2403 0 .4688-.0547.6738-.1543.0469.1953.0703.3984.0703.6074 0 1.1758-.5761 2.1953-1.4355 2.8574-.4903.3789-.9981.623-1.5352.7363-1.0488-.084-1.9453-.9511-1.9453-2.0312V8.207zm.5078 12.6328c-1.8125 0-3.4473-.584-4.6309-1.6562-1.3319-1.209-2.0664-2.8437-2.0664-4.6055 0-2.041 1.8399-3.791 4.0938-5.0528.0469-.0273.0996-.0527.1523-.0761.1465-.0743.3008-.1407.4531-.2032.2168.4688.5196.8985.8985 1.2813.4375.4414 1.0019.8359 1.707 1.1699-.1621.1406-.3242.2793-.4863.4199-.6953.6015-1.3848 1.1973-1.627 1.8203-.2324.5976-.0215 1.1699.5567 1.4921.4277.2403.9902.3067 1.502.1778.5508-.1387.998-.4414 1.2812-.8496.2402-.3457.3555-.7696.3535-1.1934-.001-.2773-.0469-.5547-.127-.8281.4238-.3438.8515-.6856 1.2793-1.0274.1855-.1484.373-.2968.5566-.4453.0108.0606.0235.127.0333.1875.0088.0508.0185.1016.0283.1485.0098.0469.0196.0937.0283.1406-.1855.3535-.3398.7207-.4609 1.1015-.4063 1.2832-.3242 2.6699.2246 3.8145.6406 1.334 1.8086 2.2969 3.2168 2.6563.2402.0615.4843.1074.7324.1367.0986-.0215.2011-.0449.3027-.0684-.1563.5-.3613.9727-.6172 1.4121-.75 1.289-1.916 2.166-3.1855 2.4004-.5528.1015-1.1211.1523-1.6934.1523zm4.9551-4.4316c-.9922-.1211-1.8145-.6387-2.2637-1.4395-.4356-.7773-.5215-1.7676-.2403-2.6484.0957.0019.1934.0039.2891.0039 1.4824 0 2.8945-.5781 3.9707-1.6386.0489-.0489.0957-.0997.1445-.1504.248.9218.2227 1.9375-.1055 2.8476-.3535.9786-1.0078 1.7832-1.7949 2.0254zm4.2226 1.0703c-.3945.3125-.8125.5879-1.252.8223 0-.002.002-.0039.002-.006.1406-.4961.4727-1.1094.7168-1.5664.2715-.5117.5136-.9903.4785-1.5273-.0547-.8145-.5175-1.5587-1.2598-2.0547.5157-.6973.9278-1.4942 1.209-2.3399.1836-.5527.291-1.125.3242-1.7109.0176-.3144.0059-.625-.0273-.9297l.1758-.1621c.166-.1543.334-.3067.5-.461.1172.5645.168 1.1387.1543 1.7109-.0313 1.1328-.2793 2.2403-.7012 3.207-.207.4726-.4453.9199-.7148 1.3379-.2715.4218-.5684.8203-.8926 1.1914-.1641.1875-.334.3692-.5098.5449z"/></svg>',
      
      // Server
      'docker': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.084.185.185.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.185.185v1.888c0 .102.084.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/></svg>',
      'kubernetes': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 01-2.075-2.597l2.578-.437.004.005a.44.44 0 01.484.606zm-.833-2.129a.44.44 0 00.173-.756l.002-.011L7.585 9.7a5.143 5.143 0 00-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 00.699-.337l.01-.005.15-2.62a5.144 5.144 0 00-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.778zm1.5-2.449a.44.44 0 00.7.336l.008.003 2.134-1.513a5.188 5.188 0 00-2.992-1.442l.148 2.615.002.001zm10.876 5.97l-5.773 7.181a1.6 1.6 0 01-1.248.594l-9.261.003a1.6 1.6 0 01-1.247-.596l-5.776-7.18a1.583 1.583 0 01-.307-1.34L2.1 5.573c.108-.47.425-.864.863-1.073L11.305.513a1.606 1.606 0 011.385 0l8.345 3.985c.438.209.755.604.863 1.073l2.062 9.608a1.585 1.585 0 01-.308 1.34zm-7.51-9.66l-.003-.006a1.42 1.42 0 00-1.04-.46L12 6.46h-.045a1.42 1.42 0 00-1.04.457l-.003.006a1.395 1.395 0 00-.37 1.044l.005.05-.004.06a1.42 1.42 0 00.42.96l.003.003a1.406 1.406 0 001.035.472h.044a1.409 1.409 0 001.034-.47l.003-.004a1.42 1.42 0 00.42-.962l-.003-.058.004-.047a1.404 1.404 0 00-.37-1.044z"/></svg>',
      'git': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/></svg>',
      'github': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
      'gitlab': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.845.904c-.435 0-.82.28-.955.692C2.639 5.449 1.246 9.728.07 13.335a1.437 1.437 0 00.522 1.607l11.071 8.045c.2.145.472.144.67-.004l11.073-8.04a1.436 1.436 0 00.522-1.61c-1.285-3.942-2.683-7.89-3.821-11.76a1.004 1.004 0 00-.957-.686.996.996 0 00-.942.765l-2.556 7.834H8.387L5.828 1.623a.994.994 0 00-.983-.72z"/></svg>',
      
      // Marketing
      'google tag manager': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.18l8.25 4.72v9.38L12 21.82l-8.25-4.54V6.9L12 2.18z"/><path d="M12 6.5l-4.5 2.57v5.14L12 16.78l4.5-2.57V8.57L12 6.5z"/></svg>',
      'gtm': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.18l8.25 4.72v9.38L12 21.82l-8.25-4.54V6.9L12 2.18z"/><path d="M12 6.5l-4.5 2.57v5.14L12 16.78l4.5-2.57V8.57L12 6.5z"/></svg>',
      'facebook pixel': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.92 3.78-3.92 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>',
      'intercom': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.802 18.267a1.418 1.418 0 01-1.336-1.49V9.653c0-.745.567-1.418 1.336-1.49V18.267zM18.469 18.713a1.418 1.418 0 01-1.336-1.49V6.68c0-.745.567-1.418 1.336-1.49v13.523zM16.178 19.113a1.418 1.418 0 01-1.336-1.49V5.534c0-.745.567-1.418 1.336-1.49v15.069zm-4.178.447a1.418 1.418 0 01-1.336-1.49V4.685c0-.745.567-1.418 1.336-1.49V19.56zM7.867 19.113a1.418 1.418 0 01-1.336-1.49V5.534c0-.745.567-1.418 1.336-1.49v15.069zm-2.333-.4a1.418 1.418 0 01-1.336-1.49V6.68c0-.745.567-1.418 1.336-1.49v13.523zM3.2 18.267a1.418 1.418 0 01-1.336-1.49V9.653c0-.745.567-1.418 1.336-1.49v10.104zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>',
      'hubspot': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.98V3.08A2.162 2.162 0 0017.238.91h-.022a2.162 2.162 0 00-2.194 2.168v.024a2.2 2.2 0 001.267 1.98v2.844a6.163 6.163 0 00-2.9 1.387l-7.65-5.95a2.603 2.603 0 00.092-.66 2.655 2.655 0 00-5.31 0 2.655 2.655 0 002.655 2.654c.405 0 .79-.092 1.136-.255l7.505 5.837a6.165 6.165 0 00-.6 2.67c0 .95.216 1.847.6 2.65l-2.126 1.652a2.138 2.138 0 00-1.414-.536 2.166 2.166 0 102.166 2.166c0-.52-.186-.995-.493-1.367l2.053-1.595a6.188 6.188 0 107.12-9.658zm-1.14 9.497a3.54 3.54 0 110-7.082 3.54 3.54 0 010 7.082z"/></svg>',
      'mailchimp': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.836 13.885c-.278-.19-.456-.395-.616-.676.153-.18.292-.374.416-.576.19-.309.37-.684.355-1.093-.016-.456-.202-.87-.52-1.078-.234-.153-.547-.224-.944-.152.164-.558.248-1.063.261-1.485.013-.43-.04-.8-.18-1.077-.216-.42-.572-.642-1.05-.663-.46-.02-.946.148-1.402.43-.17.106-.34.225-.512.358-.084-1.102-.538-1.95-1.248-2.444-.78-.54-1.8-.612-2.784-.312-.8.244-1.548.7-2.152 1.3-.13-.108-.27-.205-.42-.287-1.132-.625-2.656-.16-3.406.96-.62.926-.618 2.13-.026 3.185l.052.103c-.07.058-.133.12-.2.186-.536.525-.837 1.23-.762 1.99.075.76.515 1.362 1.045 1.778.253.2.536.364.835.496-.006.087-.01.176-.01.266 0 .92.318 1.81.91 2.6.582.78 1.39 1.42 2.373 1.87.98.452 2.105.695 3.32.695.742 0 1.492-.082 2.228-.247 1.085-.244 2.138-.667 3.052-1.227.86-.527 1.595-1.172 2.083-1.827.498-.67.784-1.397.822-2.027.04-.657-.25-1.237-.584-1.56z"/></svg>',
      'zendesk': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 16.79V24h-7.21c0-3.982 3.23-7.21 7.21-7.21zm-24 0V24h7.21c0-3.982-3.23-7.21-7.21-7.21zm15.71-7.79H24V0h-8.29c0 4.974-4.025 9-9 9H0v9h8.29c4.974 0 9-4.025 9-9z"/></svg>',
      
      // Default fallback icons by category
    };
    
    return logos[name] || null;
  }
  // === TIC TAC TOE EASTER EGG ===
  resetTTT() {
    this.tttBoard = Array(9).fill(null);
    this.tttCurrentPlayer = 'X';
    this.tttGameOver = false;
    
    if (this.el.tictactoeStatus) {
      this.el.tictactoeStatus.textContent = 'Your turn (X)';
      this.el.tictactoeStatus.className = 'tictactoe-status';
    }
    
    this.el.tictactoeBoard?.querySelectorAll('.ttt-cell').forEach(cell => {
      cell.textContent = '';
      cell.className = 'ttt-cell';
    });
  }
  handleTTTClick(index) {
    if (this.tttGameOver || this.tttBoard[index] || this.tttCurrentPlayer !== 'X') return;
    this.makeTTTMove(index, 'X');
    
    if (!this.tttGameOver) {
      // AI's turn
      setTimeout(() => this.makeAIMove(), 400);
    }
  }
  makeTTTMove(index, player) {
    this.tttBoard[index] = player;
    
    const cell = this.el.tictactoeBoard?.querySelector(`[data-cell="${index}"]`);
    if (cell) {
      cell.textContent = player;
      cell.classList.add(player.toLowerCase(), 'taken');
    }
    const winner = this.checkTTTWinner();
    if (winner) {
      this.endTTTGame(winner);
    } else if (!this.tttBoard.includes(null)) {
      this.endTTTGame('draw');
    } else {
      this.tttCurrentPlayer = player === 'X' ? 'O' : 'X';
      if (this.el.tictactoeStatus && !this.tttGameOver) {
        this.el.tictactoeStatus.textContent = this.tttCurrentPlayer === 'X' ? 'Your turn (X)' : 'AI thinking...';
      }
    }
  }
  makeAIMove() {
    if (this.tttGameOver) return;
    // Simple AI: Try to win, then block, then take center, then random
    let move = this.findWinningMove('O');
    if (move === null) move = this.findWinningMove('X');
    if (move === null && this.tttBoard[4] === null) move = 4;
    if (move === null) {
      const corners = [0, 2, 6, 8].filter(i => this.tttBoard[i] === null);
      if (corners.length) move = corners[Math.floor(Math.random() * corners.length)];
    }
    if (move === null) {
      const available = this.tttBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (available.length) move = available[Math.floor(Math.random() * available.length)];
    }
    if (move !== null) {
      this.makeTTTMove(move, 'O');
    }
  }
  findWinningMove(player) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      const values = [this.tttBoard[a], this.tttBoard[b], this.tttBoard[c]];
      const playerCount = values.filter(v => v === player).length;
      const emptyCount = values.filter(v => v === null).length;
      if (playerCount === 2 && emptyCount === 1) {
        return line[values.indexOf(null)];
      }
    }
    return null;
  }
  checkTTTWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (this.tttBoard[a] && this.tttBoard[a] === this.tttBoard[b] && this.tttBoard[a] === this.tttBoard[c]) {
        // Highlight winning cells
        line.forEach(i => {
          const cell = this.el.tictactoeBoard?.querySelector(`[data-cell="${i}"]`);
          if (cell) cell.classList.add('winner');
        });
        return this.tttBoard[a];
      }
    }
    return null;
  }
  endTTTGame(result) {
    this.tttGameOver = true;
    
    if (this.el.tictactoeStatus) {
      if (result === 'X') {
        this.el.tictactoeStatus.textContent = '🎉 You win!';
        this.el.tictactoeStatus.className = 'tictactoe-status win';
      } else if (result === 'O') {
        this.el.tictactoeStatus.textContent = '🤖 AI wins!';
        this.el.tictactoeStatus.className = 'tictactoe-status lose';
      } else {
        this.el.tictactoeStatus.textContent = "🤝 It's a draw!";
        this.el.tictactoeStatus.className = 'tictactoe-status draw';
      }
    }
  }
  // === QUICK CHECKS TAB ===
  networkRequests = [];
  networkFilterText = '';
  selectedNetworkRequest = null;
  
  async loadQuickChecks() {
    this.lastConsentValue = null; // Reset for fresh load
    await this.checkUTMParams();
    await this.checkConsent(false);
  }
  // UTM Parameter Checker
  async checkUTMParams() {
    const container = this.el.utmContent;
    if (!container) return;
    
    container.innerHTML = '<div class="qc-loading">Scanning...</div>';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url || tab.url.startsWith('chrome')) {
        container.innerHTML = '<div class="qc-empty">⚠️ Cannot read this page</div>';
        return;
      }
      const url = new URL(tab.url);
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'fbclid', 'ttclid', 'li_fat_id', 'msclkid'];
      const found = [];
      utmParams.forEach(param => {
        const value = url.searchParams.get(param);
        if (value) found.push({ key: param, value });
      });
      if (found.length === 0) {
        container.innerHTML = '<div class="qc-empty">🚫 No UTM parameters found</div>';
        return;
      }
      let html = '<div class="utm-grid">';
      found.forEach(p => {
        const label = p.key.replace('utm_', '').replace('clid', '');
        html += `
          <div class="utm-item">
            <span class="utm-label">${label}</span>
            <span class="utm-value" title="${this.escapeHtml(p.value)}">${this.escapeHtml(p.value)}</span>
            <button class="utm-copy" data-copy="${this.escapeHtml(p.value)}">📋</button>
          </div>`;
      });
      html += '</div>';
      container.innerHTML = html;
      container.querySelectorAll('.utm-copy').forEach(btn => {
        btn.onclick = () => {
          navigator.clipboard.writeText(btn.dataset.copy);
          btn.textContent = '✓';
          setTimeout(() => btn.textContent = '📋', 1000);
        };
      });
    } catch (e) {
      container.innerHTML = '<div class="qc-empty">❌ Error reading URL</div>';
    }
  }
  // ============================================
  // CONSENT STATUS - Production Ready v2.0
  // ============================================
  // Detects Google Consent Mode v1 (gcs) and v2 (gcd)
  // Supports 15+ CMP platforms with real-time cookie monitoring
  // ============================================
  
  consentCheckInterval = null;
  lastConsentValue = null;
  
  async checkConsent(autoRefresh = true) {
    const container = this.el.consentContent;
    if (!container) return;
    
    // Show loading only on first load
    if (!this.lastConsentValue) {
      container.innerHTML = '<div class="qc-loading">Analyzing consent status...</div>';
    }
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || tab.url?.startsWith('chrome')) {
        container.innerHTML = '<div class="qc-empty">⚠️ Cannot check this page</div>';
        return;
      }
      
      // Get consent data from background (network-level gcs/gcd capture)
      let data = { 
        gcs: null, 
        gcd: null, 
        cmp: { detected: false, name: null },
        consentState: null,
        consentSource: null
      };
      
      try {
        const bgData = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'GET_CONSENT_DATA', tabId: tab.id }, (response) => {
            resolve(response || {});
          });
        });
        if (bgData?.gcs) data.gcs = bgData.gcs;
        if (bgData?.gcd) data.gcd = bgData.gcd;
      } catch {}
      
      // Execute comprehensive consent detection on page
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const result = {
            cmp: { detected: false, name: null },
            gcd: null,
            gcs: null,
            consentState: null,
            consentSource: null,
            gcmFromDataLayer: null
          };
          
          // ========================================
          // 1. CHECK GOOGLE CONSENT MODE FROM DATALAYER
          // ========================================
          try {
            if (window.dataLayer && Array.isArray(window.dataLayer)) {
              // Find most recent consent state (search backwards)
              for (let i = window.dataLayer.length - 1; i >= 0; i--) {
                const item = window.dataLayer[i];
                if (!item) continue;
                
                // gtag consent update: ['consent', 'update', {ad_storage: 'granted'...}]
                if (Array.isArray(item) && item[0] === 'consent' && (item[1] === 'update' || item[1] === 'default')) {
                  result.gcmFromDataLayer = {
                    type: item[1],
                    ...item[2]
                  };
                  break;
                }
                
                // Alternative format: {event: 'consent_update', ad_storage: 'granted'...}
                if (item.event === 'consent_update' || item.event === 'cookie_consent_update') {
                  result.gcmFromDataLayer = item;
                  break;
                }
              }
            }
          } catch {}
          
          // ========================================
          // 2. CHECK GCS/GCD FROM NETWORK REQUESTS
          // ========================================
          try {
            const entries = performance.getEntriesByType('resource');
            for (let i = entries.length - 1; i >= 0; i--) {
              const url = entries[i].name || '';
              if (url.includes('google') && (url.includes('gcd=') || url.includes('gcs='))) {
                const gcdMatch = url.match(/[?&]gcd=([^&]+)/);
                const gcsMatch = url.match(/[?&]gcs=([^&]+)/);
                if (gcsMatch && !result.gcs) result.gcs = gcsMatch[1];
                if (gcdMatch && !result.gcd) result.gcd = gcdMatch[1];
                if (result.gcs || result.gcd) break;
              }
            }
          } catch {}
          
          // ========================================
          // 3. COMPREHENSIVE CMP DETECTION
          // ========================================
          const detectCMP = () => {
            // Helper to safely get cookie value
            const getCookie = (name) => {
              const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
              return match ? decodeURIComponent(match[2]) : null;
            };
            
            // Helper to parse JSON cookie safely
            const parseJsonCookie = (name) => {
              try {
                const val = getCookie(name);
                return val ? JSON.parse(val) : null;
              } catch { return null; }
            };
            
            // ---- OneTrust ----
            if (window.OneTrust || window.OptanonActiveGroups || document.querySelector('#onetrust-banner-sdk')) {
              result.cmp = { detected: true, name: 'OneTrust' };
              try {
                const groups = window.OptanonActiveGroups || '';
                const cookieVal = getCookie('OptanonConsent');
                result.consentState = {
                  necessary: true,
                  analytics: groups.includes('C0002') || cookieVal?.includes('C0002:1'),
                  marketing: groups.includes('C0004') || cookieVal?.includes('C0004:1'),
                  functional: groups.includes('C0003') || cookieVal?.includes('C0003:1')
                };
                result.consentSource = 'cookie';
              } catch {}
              return true;
            }
            
            // ---- Cookiebot ----
            if (window.Cookiebot || document.querySelector('#CybotCookiebotDialog')) {
              result.cmp = { detected: true, name: 'Cookiebot' };
              try {
                if (window.Cookiebot?.consent) {
                  result.consentState = {
                    necessary: window.Cookiebot.consent.necessary,
                    preferences: window.Cookiebot.consent.preferences,
                    statistics: window.Cookiebot.consent.statistics,
                    marketing: window.Cookiebot.consent.marketing
                  };
                  result.consentSource = 'api';
                } else {
                  const cookieVal = getCookie('CookieConsent');
                  if (cookieVal) {
                    result.consentState = {
                      necessary: true,
                      preferences: cookieVal.includes('preferences:true'),
                      statistics: cookieVal.includes('statistics:true'),
                      marketing: cookieVal.includes('marketing:true')
                    };
                    result.consentSource = 'cookie';
                  }
                }
              } catch {}
              return true;
            }
            
            // ---- CookieConsent (Orest Bida) ----
            if (window.CookieConsent) {
              result.cmp = { detected: true, name: 'CookieConsent' };
              try {
                // Try cookie first (most reliable for real-time)
                const ccCookie = parseJsonCookie('cc_cookie');
                if (ccCookie?.categories) {
                  result.consentState = {
                    necessary: ccCookie.categories.includes('necessary'),
                    analytics: ccCookie.categories.includes('analytics'),
                    marketing: ccCookie.categories.includes('marketing'),
                    personalization: ccCookie.categories.includes('personalization')
                  };
                  result.consentSource = 'cookie';
                } else if (typeof window.CookieConsent.getUserPreferences === 'function') {
                  const prefs = window.CookieConsent.getUserPreferences();
                  if (prefs?.acceptedCategories) {
                    result.consentState = {
                      necessary: prefs.acceptedCategories.includes('necessary'),
                      analytics: prefs.acceptedCategories.includes('analytics'),
                      marketing: prefs.acceptedCategories.includes('marketing'),
                      personalization: prefs.acceptedCategories.includes('personalization')
                    };
                    result.consentSource = 'api';
                  }
                }
              } catch {}
              return true;
            }
            
            // ---- Usercentrics ----
            if (window.UC_UI || document.querySelector('#usercentrics-root')) {
              result.cmp = { detected: true, name: 'Usercentrics' };
              try {
                if (window.UC_UI?.getServicesBaseInfo) {
                  const services = window.UC_UI.getServicesBaseInfo();
                  result.consentState = {};
                  services.forEach(s => {
                    result.consentState[s.name] = s.consent?.status === true;
                  });
                  result.consentSource = 'api';
                }
              } catch {}
              return true;
            }
            
            // ---- TCF 2.0 CMP ----
            if (window.__tcfapi) {
              result.cmp = { detected: true, name: 'TCF 2.0 CMP' };
              try {
                window.__tcfapi('getTCData', 2, (tcData, success) => {
                  if (success && tcData.purpose?.consents) {
                    result.consentState = {
                      purpose1: tcData.purpose.consents[1], // Store info
                      purpose2: tcData.purpose.consents[2], // Basic ads
                      purpose3: tcData.purpose.consents[3], // Ad performance
                      purpose4: tcData.purpose.consents[4], // Content selection
                      purpose7: tcData.purpose.consents[7], // Measurement
                    };
                    result.consentSource = 'api';
                  }
                });
              } catch {}
              return true;
            }
            
            // ---- Klaro ----
            if (window.klaro) {
              result.cmp = { detected: true, name: 'Klaro' };
              try {
                const manager = window.klaro.getManager?.();
                if (manager?.consents) {
                  result.consentState = manager.consents;
                  result.consentSource = 'api';
                }
              } catch {}
              return true;
            }
            
            // ---- Complianz ----
            if (window.complianz || getCookie('cmplz_consent_status')) {
              result.cmp = { detected: true, name: 'Complianz' };
              try {
                const status = getCookie('cmplz_consent_status');
                const marketing = getCookie('cmplz_marketing');
                const statistics = getCookie('cmplz_statistics');
                result.consentState = {
                  necessary: true,
                  statistics: statistics === 'allow',
                  marketing: marketing === 'allow',
                  status: status
                };
                result.consentSource = 'cookie';
              } catch {}
              return true;
            }
            
            // ---- Iubenda ----
            if (window._iub || window.iubenda || getCookie('_iub_cs')) {
              result.cmp = { detected: true, name: 'Iubenda' };
              try {
                const iubCookie = parseJsonCookie('_iub_cs');
                if (iubCookie?.purposes) {
                  result.consentState = {
                    purpose1: iubCookie.purposes[1],
                    purpose2: iubCookie.purposes[2],
                    purpose3: iubCookie.purposes[3],
                    purpose4: iubCookie.purposes[4],
                    purpose5: iubCookie.purposes[5]
                  };
                  result.consentSource = 'cookie';
                }
              } catch {}
              return true;
            }
            
            // ---- Termly ----
            if (window.Termly || getCookie('termly_consent')) {
              result.cmp = { detected: true, name: 'Termly' };
              try {
                const termlyData = parseJsonCookie('termly_consent');
                if (termlyData) {
                  result.consentState = termlyData;
                  result.consentSource = 'cookie';
                }
              } catch {}
              return true;
            }
            
            // ---- CookieYes / CookieLaw ----
            if (window.CookieYes || getCookie('cookieyes-consent')) {
              result.cmp = { detected: true, name: 'CookieYes' };
              try {
                const consent = getCookie('cookieyes-consent');
                if (consent) {
                  result.consentState = {
                    necessary: consent.includes('necessary:yes'),
                    functional: consent.includes('functional:yes'),
                    analytics: consent.includes('analytics:yes'),
                    performance: consent.includes('performance:yes'),
                    advertisement: consent.includes('advertisement:yes')
                  };
                  result.consentSource = 'cookie';
                }
              } catch {}
              return true;
            }
            
            // ---- GDPR Cookie Compliance ----
            if (getCookie('moove_gdpr_popup')) {
              result.cmp = { detected: true, name: 'GDPR Cookie Compliance' };
              try {
                const gdprData = parseJsonCookie('moove_gdpr_popup');
                if (gdprData) {
                  result.consentState = {
                    necessary: gdprData.strict === '1',
                    thirdparty: gdprData.thirdparty === '1',
                    advanced: gdprData.advanced === '1'
                  };
                  result.consentSource = 'cookie';
                }
              } catch {}
              return true;
            }
            
            // ---- Generic Cookie Banner Detection ----
            const bannerSelectors = [
              '[class*="cookie-banner"]', '[class*="cookie-consent"]', 
              '[class*="cookie-notice"]', '[class*="gdpr"]',
              '[id*="cookie-banner"]', '[id*="cookie-consent"]',
              '[id*="gdpr"]', '.cc-window', '#cookie-law-info-bar'
            ];
            
            if (document.querySelector(bannerSelectors.join(','))) {
              result.cmp = { detected: true, name: 'Cookie Banner' };
              return true;
            }
            
            return false;
          };
          
          detectCMP();
          return result;
        },
        world: 'MAIN'
      });
      
      // Process results
      if (results?.[0]?.result) {
        const pageData = results[0].result;
        if (pageData.cmp) data.cmp = pageData.cmp;
        data.consentState = pageData.consentState;
        data.consentSource = pageData.consentSource;
        data.gcmFromDataLayer = pageData.gcmFromDataLayer;
        if (!data.gcs && pageData.gcs) data.gcs = pageData.gcs;
        if (!data.gcd && pageData.gcd) data.gcd = pageData.gcd;
      }
      
      // Build comparison key for change detection
      const stateKey = data.consentState ? JSON.stringify(data.consentState) : '';
      const gcmKey = data.gcmFromDataLayer ? JSON.stringify(data.gcmFromDataLayer) : '';
      const currentValue = (data.gcs || data.gcd || '') + stateKey + gcmKey;
      
      if (autoRefresh && this.lastConsentValue === currentValue) {
        return; // No change
      }
      this.lastConsentValue = currentValue;
      // Parse gcd parameter - Google Consent Mode v2
      // Format: 1[sep]<ad_storage>[sep]<analytics_storage>[sep]<ad_user_data>[sep]<ad_personalization>5...
      // Letters: l=not implemented, n/r/t/v=granted, m/p/q/u=denied
      const parseGcd = (gcd) => {
        if (!gcd) return null;
        
        const result = {
          ad_storage: null,
          analytics_storage: null
        };
        
        // Extract letters using regex: 1[digit][letter][digit][letter][digit][letter][digit][letter]...
        const match = gcd.match(/^1[0-9]([a-z])[0-9]([a-z])[0-9]([a-z])[0-9]([a-z])/i);
        
        if (match) {
          const mapLetter = (letter) => {
            const l = letter.toLowerCase();
            if (l === 'l') return 'not_implemented';
            if (['n', 'r', 't', 'v'].includes(l)) return 'granted';
            if (['m', 'p', 'q', 'u'].includes(l)) return 'denied';
            return 'unknown';
          };
          
          result.ad_storage = mapLetter(match[1]);
          result.analytics_storage = mapLetter(match[2]);
        }
        
        return result;
      };
      // Parse gcs parameter - Google Consent Mode v1
      // G1xy: x=ad_storage, y=analytics_storage (1=granted, 0=denied)
      // G1 = default state
      // G111 = both granted, G110 = ads only, G101 = analytics only, G100 = both denied
      const parseGcs = (gcs) => {
        if (!gcs) return null;
        
        const digits = gcs.replace(/^G/i, '');
        
        const result = {
          ad_storage: null,
          analytics_storage: null,
          isDefault: false
        };
        
        if (digits === '1') {
          // G1 = Default state
          result.isDefault = true;
          result.ad_storage = 'default';
          result.analytics_storage = 'default';
        } else if (digits.length >= 3) {
          // G1xy format: digits[1]=ad_storage, digits[2]=analytics_storage
          result.ad_storage = digits[1] === '1' ? 'granted' : 'denied';
          result.analytics_storage = digits[2] === '1' ? 'granted' : 'denied';
        }
        
        return result;
      };
      // Prefer GCS for display, fallback to GCD for parsing
      let consentData = null;
      let rawValue = null;
      
      // Try GCS first (simpler, preferred for display)
      if (data.gcs && data.gcs.length >= 3) {
        consentData = parseGcs(data.gcs);
        rawValue = data.gcs; // Show GCS like G111, G100
      }
      
      // Fallback to GCD if no valid GCS
      if ((!consentData || !consentData.ad_storage) && data.gcd) {
        consentData = parseGcd(data.gcd);
        // Still show GCS if available, otherwise show GCD
        if (!rawValue || rawValue === 'G1') {
          rawValue = data.gcs || data.gcd;
        }
      }
      // Build the consent status UI
      let html = '<div class="consent-status-grid">';
      
      // Google Consent Mode Section
      html += '<div class="consent-section">';
      html += `<div class="consent-section-title">Google Consent Mode ${rawValue ? `<span class="gcs-raw">${rawValue}</span>` : ''}</div>`;
      
      if (consentData && (consentData.ad_storage || consentData.isDefault)) {
        const consentItems = [
          { key: 'ad_storage', label: 'Ad Storage', icon: '📢' },
          { key: 'analytics_storage', label: 'Analytics', icon: '📊' }
        ];
        
        html += '<div class="consent-items">';
        consentItems.forEach(item => {
          const value = consentData[item.key];
          let statusClass = 'unknown';
          let statusText = 'N/A';
          let statusIcon = '➖';
          
          if (value === 'granted') {
            statusClass = 'granted';
            statusText = 'Granted';
            statusIcon = '✅';
          } else if (value === 'denied') {
            statusClass = 'denied';
            statusText = 'Denied';
            statusIcon = '🚫';
          } else if (value === 'default') {
            statusClass = 'unknown';
            statusText = 'Default';
            statusIcon = '⏳';
          } else if (value === 'not_implemented') {
            statusClass = 'unknown';
            statusText = 'Not Set';
            statusIcon = '❓';
          }
          
          html += `
            <div class="consent-item ${statusClass}">
              <span class="consent-item-icon">${item.icon}</span>
              <span class="consent-item-label">${item.label}</span>
              <span class="consent-item-status">${statusIcon} ${statusText}</span>
            </div>`;
        });
        html += '</div>';
      } else {
        html += '<div class="consent-not-detected">⚠️ No Google requests detected yet<br><small>Waiting for tracking to fire...</small></div>';
      }
      html += '</div>';
      
      // CMP Section
      html += '<div class="consent-section">';
      html += '<div class="consent-section-title">Consent Platform (CMP)</div>';
      html += `<div class="cmp-status ${data.cmp.detected ? 'detected' : 'not-detected'}">
        <span class="cmp-icon">${data.cmp.detected ? '✅' : '❌'}</span>
        <span class="cmp-name">${data.cmp.detected ? data.cmp.name : 'Not detected'}</span>
      </div>`;
      
      // Show CMP consent details if available
      if (data.consentFromCMP && Object.keys(data.consentFromCMP).length > 0) {
        html += '<div class="cmp-details">';
        html += '<div class="cmp-details-title">Current Preferences:</div>';
        html += '<div class="consent-items">';
        
        // Map common consent categories with icons
        const categoryIcons = {
          'necessary': '🔒',
          'preferences': '⚙️',
          'statistics': '📊',
          'analytics': '📊',
          'marketing': '📢',
          'personalization': '👤',
          'functional': '🔧',
          'performance': '⚡'
        };
        
        for (const [key, value] of Object.entries(data.consentFromCMP)) {
          const isGranted = value === true || value === 'granted' || value === 'Active' || value === 'AlwaysActive';
          const isDenied = value === false || value === 'denied' || value === 'Inactive';
          const statusClass = isGranted ? 'granted' : (isDenied ? 'denied' : 'unknown');
          const statusIcon = isGranted ? '✅' : (isDenied ? '🚫' : '➖');
          const statusText = isGranted ? 'Granted' : (isDenied ? 'Denied' : 'Unknown');
          
          // Get icon for category (case insensitive)
          const lowerKey = key.toLowerCase();
          let icon = '📋';
          for (const [cat, catIcon] of Object.entries(categoryIcons)) {
            if (lowerKey.includes(cat)) {
              icon = catIcon;
              break;
            }
          }
          
          // Format the key name nicely
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          
          html += `
            <div class="consent-item ${statusClass}">
              <span class="consent-item-icon">${icon}</span>
              <span class="consent-item-label">${label}</span>
              <span class="consent-item-status">${statusIcon} ${statusText}</span>
            </div>`;
        }
        html += '</div></div>';
      }
      html += '</div>';
      
      html += '</div>';
      container.innerHTML = html;
      
      // Start auto-refresh polling if not already running (200ms for INSTANT updates)
      if (!this.consentCheckInterval) {
        this.consentCheckInterval = setInterval(() => {
          this.checkConsent(true);
        }, 200);
      }
    } catch (e) {
      container.innerHTML = '<div class="qc-empty">❌ Error analyzing consent</div>';
    }
  }
  
  stopConsentPolling() {
    if (this.consentCheckInterval) {
      clearInterval(this.consentCheckInterval);
      this.consentCheckInterval = null;
    }
  }
  // === NETWORK TAB ===
  
  currentTabUrl = '';
  
  async loadNetworkTab() {
    // Check if URL changed - if so, clear old data
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && this.currentTabUrl && this.currentTabUrl !== tab.url) {
      this.networkRequests = [];
    }
    this.currentTabUrl = tab?.url || '';
    
    await this.startNetworkMonitor();
  }
  async startNetworkMonitor() {
    const container = this.el.networkContent;
    const statsBar = this.el.networkStats;
    if (!container) return;
    
    container.innerHTML = '<div class="network-empty-state"><div class="empty-icon">📡</div><div class="empty-text">Starting monitor...</div></div>';
    if (statsBar) statsBar.innerHTML = '<span style="color:var(--text3);font-size:11px;">Loading...</span>';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || tab.url?.startsWith('chrome')) {
        container.innerHTML = '<div class="network-empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">Cannot monitor this page</div></div>';
        return;
      }
      // Inject comprehensive network monitor
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Check if we're on a new page (URL changed) - clear old data
          const currentUrl = window.location.href;
          if (window.__INSIGHTER_LAST_URL__ && window.__INSIGHTER_LAST_URL__ !== currentUrl) {
            window.__INSIGHTER_NET_V5__ = [];
          }
          window.__INSIGHTER_LAST_URL__ = currentUrl;
          
          if (!window.__INSIGHTER_NET_V5__) {
            window.__INSIGHTER_NET_V5__ = [];
          }
          
          // Only initialize interceptors once
          if (!window.__INSIGHTER_INITIALIZED__) {
            window.__INSIGHTER_INITIALIZED__ = true;
            
            // Platform detection function - order matters!
            const detectPlatform = (url) => {
              const urlLower = url.toLowerCase();
              
              // GA4 Server-Side - google.com/ccm/collect (check for scrsrc parameter)
              if (urlLower.includes('google.com/ccm/collect') && url.includes('scrsrc=')) {
                return 'GA4-SST';
              }
              
              // GA4 Server-Side - custom domains with GA4 params
              if (url.includes('tid=G-')) {
                // If NOT google-analytics.com, it's server-side
                if (!urlLower.includes('google-analytics.com') && 
                    !urlLower.includes('analytics.google.com')) {
                  return 'GA4-SST';
                }
              }
              
              // Server-side patterns - custom domains with collect endpoints
              if ((urlLower.includes('/g/collect') || 
                   urlLower.includes('/j/collect')) && 
                  !urlLower.includes('google-analytics.com') &&
                  !urlLower.includes('analytics.google.com') &&
                  !urlLower.includes('google.com')) {
                return 'GA4-SST';
              }
              
              // GA4 - Standard Google Analytics
              if (urlLower.includes('google-analytics.com/g/collect') || 
                  urlLower.includes('google-analytics.com/j/collect') ||
                  (urlLower.includes('analytics.google.com') && urlLower.includes('collect'))) {
                return 'GA4';
              }
              
              // Meta / Facebook - Check before Google Ads
              if (urlLower.includes('facebook.com/tr') ||
                  urlLower.includes('facebook.net/tr') ||
                  urlLower.includes('connect.facebook.net') ||
                  urlLower.includes('facebook.com/ajax') ||
                  urlLower.includes('fbevents') ||
                  urlLower.includes('pixel.facebook') ||
                  urlLower.includes('www.facebook.com/tr')) {
                return 'Meta';
              }
              
              // Google Ads - specific patterns (must be after SST check)
              if (urlLower.includes('googleadservices.com/pagead') ||
                  urlLower.includes('googleadservices.com/pagead/conversion') ||
                  urlLower.includes('googleads.g.doubleclick') ||
                  /js\?id=AW-/i.test(url) ||
                  urlLower.includes('pagead/1p-user-list') ||
                  urlLower.includes('pagead/viewthroughconversion')) {
                return 'GAds';
              }
              
              // Google Ads - google.com/pagead (but not ccm/collect)
              if (urlLower.includes('google.com/pagead') && !urlLower.includes('/ccm/')) {
                return 'GAds';
              }
              
              // TikTok
              if (urlLower.includes('analytics.tiktok.com') ||
                  (urlLower.includes('tiktok.com') && urlLower.includes('pixel'))) {
                return 'TikTok';
              }
              
              // LinkedIn
              if (urlLower.includes('px.ads.linkedin.com') ||
                  urlLower.includes('px4.ads.linkedin.com') ||
                  urlLower.includes('snap.licdn.com') ||
                  (urlLower.includes('linkedin.com') && urlLower.includes('conversion'))) {
                return 'LinkedIn';
              }
              
              // Microsoft Clarity
              if (urlLower.includes('clarity.ms')) {
                return 'Clarity';
              }
              
              // Bing Ads
              if (urlLower.includes('bat.bing.com')) {
                return 'Bing';
              }
              
              // Pinterest
              if (urlLower.includes('ct.pinterest.com') ||
                  urlLower.includes('pinterest.com/ct')) {
                return 'Pinterest';
              }
              
              // Snapchat
              if (urlLower.includes('tr.snapchat.com') ||
                  (urlLower.includes('sc-static.net') && urlLower.includes('scevent'))) {
                return 'Snap';
              }
              
              // Twitter/X
              if (urlLower.includes('ads-twitter.com') ||
                  urlLower.includes('analytics.twitter.com') ||
                  urlLower.includes('t.co/i/adsct')) {
                return 'Twitter';
              }
              
              // Reddit
              if (urlLower.includes('ads.reddit.com') ||
                  urlLower.includes('alb.reddit.com') ||
                  (urlLower.includes('redditmedia.com') && urlLower.includes('ads'))) {
                return 'Reddit';
              }
              
              // Taboola
              if (urlLower.includes('trc.taboola.com') ||
                  urlLower.includes('cdn.taboola')) {
                return 'Taboola';
              }
              
              // Outbrain
              if (urlLower.includes('outbrain.com')) {
                return 'Outbrain';
              }
              
              // Criteo
              if (urlLower.includes('criteo.com') || urlLower.includes('criteo.net')) {
                return 'Criteo';
              }
              
              // Hotjar
              if (urlLower.includes('hotjar.com') || urlLower.includes('vars.hotjar.com')) {
                return 'Hotjar';
              }
              
              // GTM
              if (urlLower.includes('googletagmanager.com/gtm.js') ||
                  urlLower.includes('googletagmanager.com/gtag/js')) {
                return 'GTM';
              }
              
              // Hubspot
              if (urlLower.includes('js.hs-scripts.com') ||
                  urlLower.includes('js.hs-analytics.net')) {
                return 'Hubspot';
              }
              
              // Klaviyo
              if (urlLower.includes('static.klaviyo.com') || urlLower.includes('a.klaviyo.com')) {
                return 'Klaviyo';
              }
              
              // Segment
              if (urlLower.includes('api.segment.io') || urlLower.includes('cdn.segment.com')) {
                return 'Segment';
              }
              
              // Mixpanel
              if (urlLower.includes('api.mixpanel.com') || urlLower.includes('mixpanel.com')) {
                return 'Mixpanel';
              }
              
              // Amplitude
              if (urlLower.includes('api.amplitude.com') || urlLower.includes('amplitude.com')) {
                return 'Amplitude';
              }
              
              // Heap
              if (urlLower.includes('heapanalytics.com')) {
                return 'Heap';
              }
              
              // Fullstory
              if (urlLower.includes('fullstory.com') || urlLower.includes('rs.fullstory.com')) {
                return 'Fullstory';
              }
              
              // Lucky Orange
              if (urlLower.includes('luckyorange.com')) {
                return 'LuckyOrange';
              }
              
              // Mouseflow
              if (urlLower.includes('mouseflow.com')) {
                return 'Mouseflow';
              }
              
              return null;
            };
            const parseUrlParams = (url) => {
              const params = {};
              try {
                const u = new URL(url, location.origin);
                u.searchParams.forEach((v, k) => {
                  try { params[k] = decodeURIComponent(v); } catch(e) { params[k] = v; }
                });
              } catch(e) {}
              return params;
            };
            const parseBody = (body) => {
              if (!body) return {};
              try {
                if (typeof body === 'string') {
                  if (body.startsWith('{') || body.startsWith('[')) {
                    return JSON.parse(body);
                  } else {
                    const params = {};
                    new URLSearchParams(body).forEach((v, k) => {
                      try { params[k] = decodeURIComponent(v); } catch(e) { params[k] = v; }
                    });
                    return params;
                  }
                } else if (body instanceof FormData) {
                  const params = {};
                  body.forEach((v, k) => { params[k] = v; });
                  return params;
                }
              } catch(e) {}
              return { _raw: String(body).substring(0, 500) };
            };
            const getEventName = (url, params, body) => {
              // GA4
              if (params.en) return params.en;
              // Older GA
              if (params.t) return params.t;
              // Meta
              if (params.ev) return params.ev;
              // TikTok
              if (params.event) return params.event;
              // Google Ads - extract from URL or params
              if (/viewthroughconversion/i.test(url)) return 'conversion';
              if (/1p-user-list/i.test(url)) return 'remarketing';
              if (/pagead\/landing/i.test(url)) return 'landing';
              if (/pagead\/conversion/i.test(url)) return params.bttype || 'conversion';
              // GTM config
              if (/gtm\.js\?id=/i.test(url)) return 'gtm.load';
              if (/gtag\/js\?id=/i.test(url)) return 'gtag.config';
              // LinkedIn
              if (params.fmt) return 'pixel';
              // Clarity
              if (/clarity\.ms/i.test(url)) return 'collect';
              // Check body
              if (body?.event) return body.event;
              if (body?.en) return body.en;
              // SST specific
              if (params['ep.event_name']) return params['ep.event_name'];
              
              return 'request';
            };
            const addRequest = (url, method, reqHeaders = {}, reqBody = null, status = null) => {
              const platform = detectPlatform(url);
              if (!platform) return;
              const urlParams = parseUrlParams(url);
              const bodyParams = parseBody(reqBody);
              const eventName = getEventName(url, urlParams, bodyParams);
              // Extract key identifiers
              const identifiers = {};
              // GA4 Measurement ID
              if (urlParams.tid) identifiers.measurementId = urlParams.tid;
              // GA4 Client ID
              if (urlParams.cid) identifiers.clientId = urlParams.cid;
              // Meta Pixel ID
              if (urlParams.id) identifiers.pixelId = urlParams.id;
              // Google Ads ID
              const adsMatch = url.match(/AW-(\d+)/);
              if (adsMatch) identifiers.adsId = 'AW-' + adsMatch[1];
              // Google Ads Conversion ID from URL path
              const convMatch = url.match(/conversion\/(\d+)/);
              if (convMatch) identifiers.conversionId = convMatch[1];
              // Google Ads Label
              if (urlParams.label) identifiers.conversionLabel = urlParams.label;
              // LinkedIn Partner ID
              if (urlParams.pid) identifiers.partnerId = urlParams.pid;
              // TikTok Pixel ID
              if (urlParams.pixel_code) identifiers.pixelCode = urlParams.pixel_code;
              // Server-side source
              if (urlParams.scrsrc) identifiers.serverSource = urlParams.scrsrc;
              if (urlParams['sst.scrsrc']) identifiers.serverSource = urlParams['sst.scrsrc'];
              // SST domain indicator
              if (urlParams['sst.etld']) identifiers.sstDomain = urlParams['sst.etld'];
              // Get base URL without params
              let baseUrl = url;
              try {
                const u = new URL(url, location.origin);
                baseUrl = u.origin + u.pathname;
              } catch(e) {}
              const request = {
                p: platform,
                e: eventName,
                m: method.toUpperCase(),
                url: url,
                baseUrl: baseUrl,
                urlParams: urlParams,
                bodyParams: bodyParams,
                headers: reqHeaders,
                identifiers: identifiers,
                status: status,
                t: new Date().toLocaleTimeString('en-US', { hour12: false }),
                ts: Date.now()
              };
              window.__INSIGHTER_NET_V5__.push(request);
              
              // Keep max 300 requests
              if (window.__INSIGHTER_NET_V5__.length > 300) {
                window.__INSIGHTER_NET_V5__.shift();
              }
            };
            // Intercept Fetch with full details
            const origFetch = window.fetch;
            window.fetch = async function(input, init = {}) {
              const url = input?.url || input || '';
              const method = init?.method || 'GET';
              const headers = {};
              
              // Extract headers
              if (init?.headers) {
                if (init.headers instanceof Headers) {
                  init.headers.forEach((v, k) => { headers[k] = v; });
                } else if (typeof init.headers === 'object') {
                  Object.assign(headers, init.headers);
                }
              }
              const body = init?.body;
              addRequest(url.toString(), method, headers, body);
              return origFetch.apply(this, arguments);
            };
            // Intercept XHR with full details
            const origOpen = XMLHttpRequest.prototype.open;
            const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
            const origSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.open = function(method, url) {
              this._insighter = { method, url: url?.toString(), headers: {} };
              return origOpen.apply(this, arguments);
            };
            XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
              if (this._insighter) {
                this._insighter.headers[name] = value;
              }
              return origSetHeader.apply(this, arguments);
            };
            XMLHttpRequest.prototype.send = function(body) {
              if (this._insighter) {
                const { method, url, headers } = this._insighter;
                addRequest(url, method, headers, body);
              }
              return origSend.apply(this, arguments);
            };
            // Intercept sendBeacon
            if (navigator.sendBeacon) {
              const origBeacon = navigator.sendBeacon.bind(navigator);
              navigator.sendBeacon = function(url, data) {
                addRequest(url?.toString() || '', 'BEACON', {}, data);
                return origBeacon(url, data);
              };
            }
            // Intercept Image src for pixel tracking
            const origImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
            if (origImageSrc) {
              Object.defineProperty(HTMLImageElement.prototype, 'src', {
                set: function(val) {
                  addRequest(val, 'IMG', {}, null);
                  origImageSrc.set.call(this, val);
                },
                get: origImageSrc.get
              });
            }
          }
          return window.__INSIGHTER_NET_V5__ || [];
        },
        world: 'MAIN'
      });
      this.networkRequests = results?.[0]?.result || [];
      this.renderNetworkRequests();
    } catch (e) {
      container.innerHTML = '<div class="network-empty-state"><div class="empty-icon">❌</div><div class="empty-text">Monitor error: ' + e.message + '</div></div>';
    }
  }
  async refreshNetworkMonitor() {
    const container = this.el.networkContent;
    if (container) {
      container.innerHTML = '<div class="network-empty-state"><div class="empty-icon">🔄</div><div class="empty-text">Refreshing...</div></div>';
    }
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      
      // Update current URL
      this.currentTabUrl = tab.url || '';
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__INSIGHTER_NET_V5__ || [],
        world: 'MAIN'
      });
      this.networkRequests = results?.[0]?.result || [];
      this.renderNetworkRequests();
    } catch (e) {
      if (container) {
        container.innerHTML = '<div class="network-empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">Could not refresh</div></div>';
      }
    }
  }
  async clearNetworkMonitor() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => { 
          window.__INSIGHTER_NET_V5__ = []; 
          window.__INSIGHTER_LAST_URL__ = window.location.href;
        },
        world: 'MAIN'
      });
      this.networkRequests = [];
      this.selectedNetworkRequest = null;
      this.networkFilterText = '';
      if (this.el.networkFilter) this.el.networkFilter.value = '';
      this.renderNetworkRequests();
      const detailPanel = document.getElementById('networkDetail');
      if (detailPanel) detailPanel.style.display = 'none';
    } catch (e) {}
  }
  filterNetworkRequests() {
    this.networkFilterText = (this.el.networkFilter?.value || '').toLowerCase();
    this.renderNetworkRequests();
  }
  renderNetworkRequests() {
    const container = this.el.networkContent;
    const statsBar = this.el.networkStats;
    if (!container) return;
    // Filter requests
    let requests = this.networkRequests || [];
    if (this.networkFilterText) {
      requests = requests.filter(r => 
        r.p.toLowerCase().includes(this.networkFilterText) ||
        r.e.toLowerCase().includes(this.networkFilterText) ||
        r.url.toLowerCase().includes(this.networkFilterText)
      );
    }
    // Update stats bar with clickable badges
    if (statsBar) {
      const counts = {};
      (this.networkRequests || []).forEach(r => {
        counts[r.p] = (counts[r.p] || 0) + 1;
      });
      if (Object.keys(counts).length === 0) {
        statsBar.innerHTML = '<span style="color:var(--text3);font-size:10px;">No requests yet</span>';
      } else {
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const isFiltered = this.networkFilterText && this.networkFilterText.length > 0;
        
        statsBar.innerHTML = `<span class="network-total ${isFiltered ? 'filtered' : ''}" data-filter="">${total} total</span>` + 
          Object.entries(counts).map(([platform, count]) => {
            const cls = platform.toLowerCase().replace('-', '').replace(' ', '');
            const isActive = this.networkFilterText === platform.toLowerCase();
            return `<div class="network-stat ${isActive ? 'active' : ''}" data-filter="${platform.toLowerCase()}">
              <span class="network-badge ${cls}">${platform}</span>
              <span class="network-stat-count">${count}</span>
            </div>`;
          }).join('');
        
        // Add click handlers to badges
        statsBar.querySelectorAll('.network-stat, .network-total').forEach(badge => {
          badge.style.cursor = 'pointer';
          badge.onclick = () => {
            const filter = badge.dataset.filter;
            if (this.el.networkFilter) {
              this.el.networkFilter.value = filter;
            }
            this.networkFilterText = filter;
            this.renderNetworkRequests();
          };
        });
      }
    }
    if (requests.length === 0) {
      let pageInfo = '';
      try {
        if (this.currentTabUrl) {
          const urlPath = new URL(this.currentTabUrl).pathname;
          pageInfo = `<div class="network-page-info">📍 ${urlPath.substring(0, 30)}${urlPath.length > 30 ? '...' : ''}</div>`;
        }
      } catch(e) {}
      
      container.innerHTML = `
        <div class="network-empty-state">
          ${pageInfo}
          <div class="empty-icon">📡</div>
          <div class="empty-text">${this.networkFilterText ? 'No matching requests for "' + this.networkFilterText + '"' : 'Waiting for requests...'}</div>
          <div class="empty-hint">${this.networkFilterText ? 'Click "total" to clear filter' : 'Interact with the page to capture pixels (scroll, click, navigate)'}</div>
        </div>`;
      return;
    }
    // Show requests (newest first)
    container.innerHTML = requests.slice().reverse().map((r, idx) => {
      const realIdx = requests.length - 1 - idx;
      const cls = r.p.toLowerCase().replace('-', '').replace(' ', '');
      const isSST = r.p.includes('SST') ? '<span class="sst-badge">SST</span>' : '';
      const hasId = r.identifiers?.measurementId || r.identifiers?.pixelId || r.identifiers?.adsId || '';
      return `
        <div class="network-item" data-idx="${realIdx}">
          <span class="network-badge ${cls}">${r.p.replace('-SST', '')}</span>
          ${isSST}
          <span class="network-event">${this.escapeHtml(r.e)}</span>
          ${hasId ? `<span class="network-id">${this.escapeHtml(hasId.substring(0, 15))}</span>` : ''}
          <span class="network-method">${r.m}</span>
          <span class="network-time">${r.t}</span>
        </div>`;
    }).join('');
    // Bind click events
    container.querySelectorAll('.network-item').forEach(item => {
      item.onclick = () => {
        const idx = parseInt(item.dataset.idx);
        this.showNetworkDetail(requests[idx]);
        container.querySelectorAll('.network-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      };
    });
  }
  showNetworkDetail(request) {
    this.selectedNetworkRequest = request;
    let detailPanel = document.getElementById('networkDetail');
    
    if (!detailPanel) {
      const panel = document.createElement('div');
      panel.id = 'networkDetail';
      panel.className = 'network-detail-panel';
      document.getElementById('network-panel')?.appendChild(panel);
      detailPanel = panel;
    }
    // Combine all parameters for display
    const urlParams = request.urlParams || {};
    const bodyParams = request.bodyParams || {};
    const headers = request.headers || {};
    const identifiers = request.identifiers || {};
    const baseUrl = request.baseUrl || request.url.split('?')[0];
    // Build sections
    const buildTable = (data, title, icon) => {
      const entries = Object.entries(data);
      if (entries.length === 0) return '';
      
      let html = `<div class="detail-section">
        <div class="detail-section-title">${icon} ${title} <span class="param-count">(${entries.length})</span></div>
        <table class="param-table"><tbody>`;
      entries.forEach(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        // Highlight important params
        const isImportant = ['en', 'ev', 'event', 'tid', 'id', 'cid', 'pid', 'dl', 'dt', 'dr', 'v', 'gtm'].includes(key);
        html += `<tr class="${isImportant ? 'important-param' : ''}">
          <td class="param-key">${this.escapeHtml(key)}</td>
          <td class="param-value">${this.escapeHtml(displayValue)}</td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      return html;
    };
    // Build full JSON
    const fullData = {
      platform: request.p,
      event: request.e,
      method: request.m,
      timestamp: request.t,
      baseUrl: baseUrl,
      fullUrl: request.url,
      identifiers: identifiers,
      urlParameters: urlParams,
      bodyParameters: bodyParams,
      requestHeaders: headers
    };
    const jsonStr = JSON.stringify(fullData, null, 2);
    // Table view content
    let tableContent = '';
    
    if (Object.keys(identifiers).length > 0) {
      tableContent += buildTable(identifiers, 'Identifiers', '🔑');
    }
    tableContent += buildTable(urlParams, 'URL Parameters', '🔗');
    if (Object.keys(bodyParams).length > 0) {
      tableContent += buildTable(bodyParams, 'Request Payload', '📦');
    }
    if (Object.keys(headers).length > 0) {
      tableContent += buildTable(headers, 'Request Headers', '📋');
    }
    if (Object.keys(urlParams).length === 0 && Object.keys(bodyParams).length === 0) {
      tableContent += '<div class="qc-empty">No parameters extracted</div>';
    }
    detailPanel.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">
          <span class="network-badge ${request.p.toLowerCase().replace('-', '')}">${request.p}</span>
          <span class="detail-event">${this.escapeHtml(request.e)}</span>
          <span class="detail-method">${request.m}</span>
        </div>
        <button class="detail-close" id="closeNetworkDetail">×</button>
      </div>
      <div class="detail-tabs">
        <button class="detail-tab active" data-view="table">📊 Table</button>
        <button class="detail-tab" data-view="json">{ } JSON</button>
      </div>
      <div class="detail-content">
        <div class="detail-view active" id="tableView">${tableContent}</div>
        <div class="detail-view" id="jsonView"><pre class="json-view">${this.escapeHtml(jsonStr)}</pre></div>
      </div>
      <div class="detail-actions">
        <button class="btn-xs btn-primary" id="copyNetworkUrl">📋 Copy URL</button>
        <button class="btn-xs" id="copyNetworkJson">📋 Copy JSON</button>
        <button class="btn-xs" id="copyNetworkParams">📋 Copy Params</button>
      </div>
    `;
    detailPanel.style.display = 'flex';
    // Bind events
    document.getElementById('closeNetworkDetail').onclick = () => {
      detailPanel.style.display = 'none';
      document.querySelectorAll('.network-item').forEach(i => i.classList.remove('selected'));
    };
    detailPanel.querySelectorAll('.detail-tab').forEach(tab => {
      tab.onclick = () => {
        detailPanel.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        detailPanel.querySelectorAll('.detail-view').forEach(v => v.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.view + 'View')?.classList.add('active');
      };
    });
    document.getElementById('copyNetworkUrl').onclick = () => {
      navigator.clipboard.writeText(request.url);
      document.getElementById('copyNetworkUrl').textContent = '✓ Copied!';
      setTimeout(() => document.getElementById('copyNetworkUrl').textContent = '📋 Copy URL', 1000);
    };
    document.getElementById('copyNetworkJson').onclick = () => {
      navigator.clipboard.writeText(jsonStr);
      document.getElementById('copyNetworkJson').textContent = '✓ Copied!';
      setTimeout(() => document.getElementById('copyNetworkJson').textContent = '📋 Copy JSON', 1000);
    };
    document.getElementById('copyNetworkParams').onclick = () => {
      const params = { ...urlParams, ...bodyParams };
      navigator.clipboard.writeText(JSON.stringify(params, null, 2));
      document.getElementById('copyNetworkParams').textContent = '✓ Copied!';
      setTimeout(() => document.getElementById('copyNetworkParams').textContent = '📋 Copy Params', 1000);
    };
  }
  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  
  // Alias for escapeHtml
  esc(str) {
    return this.escapeHtml(str);
  }
  // Format cookie expiration timestamp
  formatCookieExpiry(expires) {
    if (!expires) return 'Session';
    try {
      const date = new Date(expires * 1000);
      const now = new Date();
      const diffMs = date - now;
      
      if (diffMs < 0) return 'Expired';
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return `${diffMins}m`;
        }
        return `${diffHours}h`;
      }
      if (diffDays < 30) return `${diffDays}d`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
      return `${Math.floor(diffDays / 365)}y`;
    } catch {
      return 'Unknown';
    }
  }
  // Format GTM event names to friendly display names
  formatEventName(eventName, entryData = null) {
    // If we have an event name, format it
    if (eventName) {
      // Handle gtag-style events (config:, set:, consent:)
      if (eventName.startsWith('config:')) {
        const id = eventName.substring(7);
        if (id.startsWith('G-')) return `⚙️ Config: GA4 (${id})`;
        if (id.startsWith('AW-')) return `⚙️ Config: Google Ads (${id})`;
        if (id.startsWith('GTM-')) return `⚙️ Config: GTM (${id})`;
        return `⚙️ Config: ${id}`;
      }
      if (eventName.startsWith('set:')) {
        const prop = eventName.substring(4);
        return `📝 Set: ${prop.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;
      }
      if (eventName.startsWith('consent:')) {
        const type = eventName.substring(8);
        return `🔒 Consent: ${type.replace(/\b\w/g, c => c.toUpperCase())}`;
      }
      if (eventName === 'gtag:init') return '🚀 Gtag Initialize';
      
      // GTM built-in events mapping
      const gtmEventMap = {
        'gtm.js': '🚀 Initialization',
        'gtm.dom': '📄 DOM Ready',
        'gtm.load': '✅ Window Loaded',
        'gtm.click': '👆 Click',
        'gtm.linkClick': '🔗 Link Click',
        'gtm.formSubmit': '📝 Form Submit',
        'gtm.historyChange': '📜 History Change',
        'gtm.historyChange-v2': '📜 History Change',
        'gtm.scrollDepth': '📊 Scroll Depth',
        'gtm.timer': '⏱️ Timer',
        'gtm.video': '🎬 Video',
        'gtm.elementVisibility': '👁️ Element Visibility',
        'gtm.triggerGroup': '🎯 Trigger Group',
        'gtm.init': '🏁 Container Loaded',
        'gtm.init_consent': '🔐 Consent Init'
      };
      
      if (gtmEventMap[eventName]) {
        return gtmEventMap[eventName];
      }
      
      // GA4/Ecommerce events mapping
      const ecommerceEventMap = {
        'page_view': '📄 Page View',
        'view_item': '👁️ View Item',
        'view_item_list': '📋 View Item List',
        'select_item': '👆 Select Item',
        'add_to_cart': '🛒 Add to Cart',
        'remove_from_cart': '❌ Remove from Cart',
        'view_cart': '🛒 View Cart',
        'begin_checkout': '💳 Begin Checkout',
        'add_shipping_info': '📦 Add Shipping Info',
        'add_payment_info': '💰 Add Payment Info',
        'purchase': '✅ Purchase',
        'refund': '↩️ Refund',
        'add_to_wishlist': '❤️ Add to Wishlist',
        'generate_lead': '🎯 Generate Lead',
        'sign_up': '📝 Sign Up',
        'login': '🔑 Login',
        'search': '🔍 Search',
        'select_content': '📌 Select Content',
        'share': '📤 Share',
        'view_promotion': '🏷️ View Promotion',
        'select_promotion': '🏷️ Select Promotion'
      };
      
      if (ecommerceEventMap[eventName]) {
        return ecommerceEventMap[eventName];
      }
      
      // For other events, format nicely
      return eventName
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    // No event name - try to infer from data
    if (entryData && typeof entryData === 'object') {
      // Check if it's an Arguments/Array-like object from gtag
      if (entryData[0] && typeof entryData[0] === 'string') {
        const cmd = entryData[0];
        if (cmd === 'event' && entryData[1]) {
          return this.formatEventName(entryData[1]);
        }
        if (cmd === 'config') return `⚙️ Config: ${entryData[1] || 'Unknown'}`;
        if (cmd === 'set') return `📝 Set: ${entryData[1] || 'Properties'}`;
        if (cmd === 'consent') return `🔒 Consent: ${entryData[1] || 'Update'}`;
        if (cmd === 'js') return '🚀 Gtag Initialize';
      }
      
      const keys = Object.keys(entryData).filter(k => !k.startsWith('gtm.') && k !== '0' && k !== '1' && k !== '2');
      
      // Check for common data patterns
      if (entryData.ecommerce) {
        const ecomKeys = Object.keys(entryData.ecommerce);
        if (ecomKeys.includes('purchase')) return '💰 Ecommerce: Purchase';
        if (ecomKeys.includes('checkout')) return '🛒 Ecommerce: Checkout';
        if (ecomKeys.includes('add')) return '➕ Ecommerce: Add to Cart';
        if (ecomKeys.includes('remove')) return '➖ Ecommerce: Remove';
        if (ecomKeys.includes('impressions')) return '👁️ Ecommerce: Impressions';
        if (ecomKeys.includes('detail')) return '📋 Ecommerce: Detail';
        if (ecomKeys.includes('click')) return '👆 Ecommerce: Click';
        if (ecomKeys.includes('items')) return '📦 Ecommerce Data';
        return '🛍️ Ecommerce Data';
      }
      
      if (entryData.user || entryData.userId || entryData.user_id) return '👤 User Data';
      if (entryData.page || entryData.pageType || entryData.page_type) return '📄 Page Data';
      if (entryData.product || entryData.products) return '📦 Product Data';
      if (entryData.transaction || entryData.transactionId) return '💳 Transaction Data';
      if (entryData.consent || entryData.consentMode) return '🔒 Consent Data';
      if (entryData.virtualPagePath || entryData.virtualPageURL) return '📱 Virtual Pageview';
      
      // Show first meaningful key
      if (keys.length > 0) {
        const key = keys[0];
        return key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());
      }
    }
    
    return '📊 Data';
  }
  // ============================================================================
  // EVENT INSPECTOR - Capture & Display Event Parameters
  // ============================================================================
  async captureEventParameters() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const btn = this.el.captureEventsBtn;
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 11-3-6.7M21 3v6h-6"/></svg> Loading...';
    // Clear existing events
    this.capturedEvents = [];
    try {
      const allEvents = [];
      
      // =====================================================
      // 1. Get GA4 and Google Ads from Performance API
      // =====================================================
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const events = [];
          const timestamp = Date.now();
          function parseUrlParams(url) {
            const params = {};
            try {
              const urlObj = new URL(url);
              urlObj.searchParams.forEach((value, key) => {
                try { params[key] = JSON.parse(decodeURIComponent(value)); }
                catch { params[key] = decodeURIComponent(value); }
              });
            } catch {}
            return params;
          }
          function decodeGA4Params(params) {
            const decoded = {};
            if (params.tid) decoded.measurement_id = params.tid;
            if (params.cid) decoded.client_id = params.cid;
            if (params.en) decoded.event_name = params.en;
            if (params.dl) decoded.page_location = params.dl;
            if (params.cu) decoded.currency = params.cu;
            if (params['epn.value']) decoded.value = params['epn.value'];
            
            // Parse items
            const items = [];
            Object.keys(params).forEach(key => {
              if (key.match(/^pr\d+$/)) {
                const item = {};
                (params[key] || '').split('~').forEach(part => {
                  const dot = part.indexOf('.');
                  if (dot > 0) {
                    const k = part.substring(0, dot);
                    const v = part.substring(dot + 1);
                    const map = { 'id': 'item_id', 'nm': 'item_name', 'pr': 'price', 'qt': 'quantity' };
                    item[map[k] || k] = isNaN(v) ? v : parseFloat(v);
                  }
                });
                if (Object.keys(item).length > 0) items.push(item);
              }
            });
            if (items.length > 0) decoded.items = items;
            return decoded;
          }
          const resources = performance.getEntriesByType('resource');
          const seen = new Set();
          
          resources.forEach(r => {
            const url = r.name;
            const key = url.split('?')[0] + (url.match(/en=[^&]+/) || '');
            if (seen.has(key)) return;
            seen.add(key);
            
            // GA4
            if (url.includes('/g/collect')) {
              const params = parseUrlParams(url);
              const decoded = decodeGA4Params(params);
              events.push({
                id: 'ga4_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                platform: 'ga4',
                platformName: 'Google Analytics 4',
                eventName: decoded.event_name || params.en || 'page_view',
                status: 'Succeeded',
                timestamp,
                fullUrl: url,
                urlParams: params,
                params: decoded
              });
            }
            
            // Google Ads
            else if (url.includes('googleadservices.com/pagead') || url.includes('googleads.g.doubleclick.net')) {
              const params = parseUrlParams(url);
              events.push({
                id: 'gads_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                platform: 'googleads',
                platformName: 'Google Ads',
                eventName: params.label ? 'Conversion' : 'Remarketing',
                status: 'Succeeded',
                timestamp,
                fullUrl: url,
                urlParams: params,
                params: { conversion_id: params.id, conversion_label: params.label, value: params.value }
              });
            }
          });
          
          return events;
        }
      });
      if (results?.[0]?.result?.length > 0) {
        allEvents.push(...results[0].result);
      }
      
      // =====================================================
      // 2. Get SST events from background.js
      // =====================================================
      try {
        const sstResponse = await chrome.runtime.sendMessage({ type: 'GET_SST_EVENTS', tabId: tab.id });
        if (sstResponse?.events?.length) {
          allEvents.push(...sstResponse.events);
        }
      } catch {}
      
      // =====================================================
      // 3. Get PIXEL events from background.js (network monitoring)
      //    This captures Meta, TikTok, Snapchat, etc. from network requests
      // =====================================================
      try {
        const bgPixelResponse = await chrome.runtime.sendMessage({ type: 'GET_PIXEL_EVENTS', tabId: tab.id });
        if (bgPixelResponse?.events?.length) {
          bgPixelResponse.events.forEach(pe => {
            allEvents.push({
              id: pe.id || `${pe.platform}_${pe.timestamp}`,
              platform: pe.platform,
              platformName: pe.platformName || pe.platform,
              eventName: pe.eventName || pe.event || 'Unknown',
              status: 'Succeeded',
              timestamp: pe.timestamp || Date.now(),
              fullUrl: pe.fullUrl || '',
              urlParams: pe.urlParams || {},
              params: pe.params || {},
              source: 'network_monitor'
            });
          });
        }
      } catch (e) {
        console.log('Pixel events from background.js:', e);
      }
      
      // =====================================================
      // 4. Get PIXEL events from inject.js via content.js
      //    This captures events from function hooks (fbq, ttq, etc.)
      // =====================================================
      try {
        const pixelResponse = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PIXEL_EVENTS' });
        
        if (pixelResponse?.events?.length) {
          // Platform name mapping
          const platformNames = {
            facebook: 'Meta Pixel',
            tiktok: 'TikTok Pixel',
            snapchat: 'Snapchat Pixel',
            pinterest: 'Pinterest Tag',
            reddit: 'Reddit Pixel',
            twitter: 'Twitter/X Pixel',
            linkedin: 'LinkedIn Insight',
            bing: 'Microsoft Ads'
          };
          
          pixelResponse.events.forEach(pe => {
            allEvents.push({
              id: pe.id || `${pe.platform}_${pe.timestamp}`,
              platform: pe.platform === 'facebook' ? 'meta' : pe.platform,
              platformName: pe.platformName || platformNames[pe.platform] || pe.platform,
              eventName: pe.event || pe.eventName || 'Unknown',
              status: 'Succeeded',
              timestamp: pe.timestamp || Date.now(),
              params: pe.params || {},
              source: 'function_hook'
            });
          });
        }
      } catch (e) {
        console.log('Pixel events from inject.js:', e);
      }
      
      // =====================================================
      // 5. Deduplicate events
      // =====================================================
      const seen = new Set();
      const dedupedEvents = [];
      
      allEvents.forEach(event => {
        const key = `${event.platform}:${event.eventName}`;
        if (!seen.has(key)) {
          seen.add(key);
          dedupedEvents.push(event);
        }
      });
      
      // Set events and render
      this.capturedEvents = dedupedEvents;
      this.renderCapturedEvents();
      
    } catch (err) {
      console.error('Event capture error:', err);
    }
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-3-6.7M21 3v6h-6"/></svg> Refresh';
  }
  clearCapturedEvents() {
    this.capturedEvents = [];
    // Clear events from background.js and content.js
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        chrome.runtime.sendMessage({ type: 'CLEAR_SST_EVENTS', tabId: tab.id }).catch(() => {});
        chrome.runtime.sendMessage({ type: 'CLEAR_PIXEL_EVENTS', tabId: tab.id }).catch(() => {});
        chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_PIXEL_EVENTS' }).catch(() => {});
      }
    });
    this.renderCapturedEvents();
  }
  filterCapturedEvents() {
    this.renderCapturedEvents();
  }
  renderCapturedEvents() {
    const container = this.el.eventInspectorList;
    if (!container) return;
    const filter = this.el.eventPlatformFilter?.value || 'all';
    const filtered = filter === 'all' 
      ? this.capturedEvents 
      : this.capturedEvents.filter(e => e.platform === filter);
    // Store for button handlers
    this.filteredEvents = filtered;
    this.el.eventCount.textContent = filtered.length;
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="event-empty-state">
          <div class="event-empty-icon">📡</div>
          <p>${this.capturedEvents.length === 0 ? 'No events captured yet' : 'No events match the selected filter'}</p>
          <small>${this.capturedEvents.length === 0 ? 'Navigate the page to trigger events, then click Refresh' : 'Try selecting "All Platforms" to see all events'}</small>
        </div>
      `;
      return;
    }
    container.innerHTML = filtered.map((event, idx) => `
      <div class="event-card ${event.isServerSide ? 'sst-event' : ''}" data-event-idx="${idx}">
        <div class="event-card-header">
          <div class="event-card-left">
            <span class="event-platform-badge ${event.platform}">${this.getPlatformLogo(event.platform)}${event.platformName}</span>
            ${event.isServerSide ? '<span class="sst-badge">🖥️ Server-Side</span>' : ''}
            <div class="event-info">
              <span class="event-name">${this.esc(event.eventName)}</span>
              <span class="event-meta">
                <span class="event-status success">${event.status || 'captured'}</span>
                ${event.sstHost ? `<span class="sst-host">${this.esc(event.sstHost)}</span>` : ''}
              </span>
            </div>
          </div>
          <div class="event-card-right">
            <span class="event-toggle">▼</span>
          </div>
        </div>
        <div class="event-params">
          ${this.renderFullRequestSection(event)}
          ${this.renderQueryStringSection(event)}
          ${this.renderEventParams(event.params)}
          <div class="event-actions">
            <button class="btn-xs event-copy-btn" data-idx="${idx}">📋 Copy JSON</button>
            ${event.fullUrl ? `<button class="btn-xs event-copy-url-btn" data-idx="${idx}">🔗 Copy URL</button>` : ''}
            <button class="btn-xs event-console-btn" data-idx="${idx}">🖥️ Console</button>
          </div>
        </div>
      </div>
    `).join('');
    // Add click handlers for expand/collapse
    container.querySelectorAll('.event-card-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('expanded');
      });
    });
    // Add click handlers for collapsible sections
    container.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        header.parentElement.classList.toggle('section-expanded');
      });
    });
    // Add click handlers for items preview
    container.querySelectorAll('.items-preview-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        header.parentElement.classList.toggle('expanded');
      });
    });
    // Add click handlers for Copy JSON buttons
    container.querySelectorAll('.event-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const event = this.filteredEvents[idx];
        if (event) {
          const jsonStr = JSON.stringify(event.params, null, 2);
          navigator.clipboard.writeText(jsonStr).then(() => {
            btn.textContent = '✓ Copied!';
            setTimeout(() => btn.textContent = '📋 Copy JSON', 1500);
          });
        }
      });
    });
    // Add click handlers for Copy URL buttons
    container.querySelectorAll('.event-copy-url-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const event = this.filteredEvents[idx];
        if (event?.fullUrl) {
          navigator.clipboard.writeText(event.fullUrl).then(() => {
            btn.textContent = '✓ Copied!';
            setTimeout(() => btn.textContent = '🔗 Copy URL', 1500);
          });
        }
      });
    });
    // Add click handlers for Console buttons
    container.querySelectorAll('.event-console-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const event = this.filteredEvents[idx];
        if (event) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab?.id) {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (eventData) => {
                console.log('%c[Insighter Pro] Event Parameters:', 'color: #00e5c7; font-weight: bold;', eventData);
              },
              args: [event.params]
            });
          }
          btn.textContent = '✓ Logged!';
          setTimeout(() => btn.textContent = '🖥️ Console', 1500);
        }
      });
    });
  }
  renderFullRequestSection(event) {
    if (!event.fullUrl) return '';
    
    return `
      <div class="collapsible-section section-expanded">
        <div class="collapsible-header">
          <span class="collapsible-title">Full Request</span>
          <span class="collapsible-toggle">▼</span>
        </div>
        <div class="collapsible-content">
          <div class="full-call-section">
            <div class="full-call-label">Full call</div>
            <div class="full-call-url">${this.esc(event.fullUrl)}</div>
          </div>
        </div>
      </div>
    `;
  }
  renderQueryStringSection(event) {
    const params = event.urlParams || {};
    const entries = Object.entries(params);
    
    if (entries.length === 0) return '';
    
    return `
      <div class="collapsible-section section-expanded">
        <div class="collapsible-header">
          <span class="collapsible-title">Query String Parameters</span>
          <span class="collapsible-toggle">▼</span>
        </div>
        <div class="collapsible-content">
          <table class="query-params-table">
            <tbody>
              ${entries.map(([key, value]) => `
                <tr>
                  <td class="qp-key">${this.esc(key)}</td>
                  <td class="qp-value">${this.formatQueryValue(value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  formatQueryValue(value) {
    if (value === null || value === undefined) {
      return '<span class="qp-empty">(Empty)</span>';
    }
    if (typeof value === 'boolean') {
      return `<span class="qp-boolean">${value}</span>`;
    }
    if (typeof value === 'number') {
      return `<span class="qp-number">${value}</span>`;
    }
    if (typeof value === 'string') {
      if (value === '') {
        return '<span class="qp-empty">(Empty)</span>';
      }
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return `<span class="qp-url">${this.esc(value)}</span>`;
      }
      return `<span class="qp-string">${this.esc(value)}</span>`;
    }
    if (Array.isArray(value)) {
      return `<span class="qp-array">[${value.length} items]</span>`;
    }
    if (typeof value === 'object') {
      return `<span class="qp-object">{${Object.keys(value).length} props}</span>`;
    }
    return this.esc(String(value));
  }
  renderEventParams(params) {
    if (!params || typeof params !== 'object') return '';
    const sections = [];
    const infoParams = params._info || {};
    const regularParams = { ...params };
    delete regularParams._info;
    delete regularParams.items;
    delete regularParams.contents;
    // Info section
    if (Object.keys(infoParams).length > 0) {
      sections.push(`
        <div class="event-params-section">
          <div class="event-params-title">Event Info</div>
          <table class="event-params-table">
            ${Object.entries(infoParams).map(([key, value]) => `
              <tr>
                <td>${this.esc(this.formatParamName(key))}</td>
                <td>${this.formatParamValue(value)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `);
    }
    // Main parameters section
    const mainParams = Object.entries(regularParams).filter(([key]) => !key.startsWith('_'));
    if (mainParams.length > 0) {
      sections.push(`
        <div class="event-params-section">
          <div class="event-params-title">Parameters</div>
          <table class="event-params-table">
            ${mainParams.map(([key, value]) => `
              <tr>
                <td>${this.esc(this.formatParamName(key))}</td>
                <td>${this.formatParamValue(value)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `);
    }
    // Items/Contents section (for ecommerce)
    const items = params.items || params.contents;
    if (items && Array.isArray(items) && items.length > 0) {
      sections.push(`
        <div class="event-params-section">
          <div class="event-params-title">Items / Products</div>
          <div class="items-preview">
            <div class="items-preview-header">
              <span class="items-count">${items.length} item${items.length > 1 ? 's' : ''}</span>
              <span class="event-toggle">▼</span>
            </div>
            <div class="items-list">
              ${items.map((item, i) => this.renderItemCard(item, i)).join('')}
            </div>
          </div>
        </div>
      `);
    }
    return sections.join('');
  }
  renderItemCard(item, index) {
    const name = item.item_name || item.content_name || item.nm || item.name || `Item ${index + 1}`;
    const price = item.price || item.pr || item.value || 0;
    const currency = item.currency || '';
    
    return `
      <div class="item-card">
        <div class="item-header">
          <span class="item-name">${this.esc(name)}</span>
          <span class="item-price">${currency} ${price}</span>
        </div>
        <div class="item-details">
          ${Object.entries(item).filter(([k]) => !['item_name', 'content_name', 'name', 'nm'].includes(k)).map(([key, value]) => `
            <div class="item-detail">
              <span class="item-detail-label">${this.esc(this.formatParamName(key))}:</span>
              <span class="item-detail-value">${this.esc(String(value))}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  // Get official platform logo - Using uploaded official brand images
  getPlatformLogo(platform) {
    const logoImages = {
      ga4: 'logos/ga4.svg',
      meta: 'logos/meta.png',
      googleads: 'logos/googleads.png',
      tiktok: 'logos/tiktok.png',
      linkedin: 'logos/linkedin.png',
      snapchat: 'logos/snapchat.png',
      pinterest: 'logos/pinterest.png',
      twitter: 'logos/twitter.png',
      reddit: 'logos/reddit.png',
      bing: 'logos/bing.png',
      sst_ga4: 'logos/ga4.svg'
    };
    
    if (logoImages[platform]) {
      return `<img src="${logoImages[platform]}" alt="${platform}" class="platform-logo-img">`;
    }
    return '';
  }
  formatParamName(name) {
    // Convert to clean lowercase with spaces (like official pixel helpers)
    return name
      .replace(/_/g, ' ')      // snake_case to spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase to spaces
      .toLowerCase();          // all lowercase
  }
  formatParamValue(value) {
    if (value === null || value === undefined) {
      return '<span class="param-value-null">Not Set</span>';
    }
    if (typeof value === 'boolean') {
      return `<span class="param-value-boolean">${value}</span>`;
    }
    if (typeof value === 'number') {
      return `<span class="param-value-number">${value}</span>`;
    }
    if (typeof value === 'string') {
      // Show string values without quotes (like official pixel helpers)
      if (value.length > 100) {
        return `<span class="param-value-string">${this.esc(value.substring(0, 100))}...</span>`;
      }
      return `<span class="param-value-string">${this.esc(value)}</span>`;
    }
    if (Array.isArray(value)) {
      // Show array contents inline if small
      if (value.length <= 3 && value.every(v => typeof v === 'string' || typeof v === 'number')) {
        return `<span class="param-value-array">${value.join(', ')}</span>`;
      }
      return `<span class="param-value-array">[${value.length} items]</span>`;
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length <= 3) {
        return `<span class="param-value-object">{${keys.join(', ')}}</span>`;
      }
      return `<span class="param-value-object">{${keys.length} properties}</span>`;
    }
    return this.esc(String(value));
  }
  // === URL PARSER TOOL ===
  
  toggleUrlParser(show = null) {
    const section = document.getElementById('urlParserSection');
    if (!section) return;
    
    if (show === null) {
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    } else {
      section.style.display = show ? 'block' : 'none';
    }
  }
  clearUrlParser() {
    const input = document.getElementById('urlParserInput');
    const result = document.getElementById('urlParserResult');
    if (input) input.value = '';
    if (result) result.innerHTML = '';
  }
  parseUrl() {
    const input = document.getElementById('urlParserInput');
    const result = document.getElementById('urlParserResult');
    if (!input || !result) return;
    let urlStr = input.value.trim();
    if (!urlStr) {
      result.innerHTML = '<div class="qc-empty">Please paste a URL to parse</div>';
      return;
    }
    // Clean up the URL - remove any leading/trailing whitespace and newlines
    urlStr = urlStr.replace(/[\r\n]/g, '').trim();
    
    // Add protocol if missing
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    try {
      const url = new URL(urlStr);
      const params = {};
      
      // Parse all parameters including nested ones
      url.searchParams.forEach((v, k) => {
        try { 
          params[k] = decodeURIComponent(v); 
        } catch(e) { 
          params[k] = v; 
        }
      });
      const paramEntries = Object.entries(params);
      
      // Detect platform
      const urlLower = urlStr.toLowerCase();
      let platform = 'Unknown';
      let platformClass = '';
      
      if (urlLower.includes('google.com/ccm/collect') && urlStr.includes('scrsrc=')) {
        platform = 'GA4-SST';
        platformClass = 'ga4sst';
      } else if (urlStr.includes('tid=G-') && !urlLower.includes('google-analytics.com')) {
        platform = 'GA4-SST';
        platformClass = 'ga4sst';
      } else if (urlLower.includes('google-analytics.com') && urlLower.includes('collect')) {
        platform = 'GA4';
        platformClass = 'ga4';
      } else if (urlLower.includes('facebook.com/tr')) {
        platform = 'Meta';
        platformClass = 'meta';
      } else if (urlLower.includes('googleadservices.com/pagead') || urlLower.includes('google.com/pagead')) {
        platform = 'GAds';
        platformClass = 'gads';
      } else if (urlLower.includes('analytics.tiktok.com') || urlLower.includes('tiktok.com')) {
        platform = 'TikTok';
        platformClass = 'tiktok';
      } else if (urlLower.includes('linkedin.com') || urlLower.includes('licdn.com')) {
        platform = 'LinkedIn';
        platformClass = 'linkedin';
      } else if (urlLower.includes('clarity.ms')) {
        platform = 'Clarity';
        platformClass = 'clarity';
      } else if (urlLower.includes('tr.snapchat.com')) {
        platform = 'Snap';
        platformClass = 'snap';
      }
      
      // Build table view
      let tableHtml = '';
      if (paramEntries.length > 0) {
        tableHtml = `
          <div class="detail-section">
            <div class="detail-section-title">🔗 URL Parameters <span class="param-count">(${paramEntries.length})</span></div>
            <table class="param-table"><tbody>`;
        paramEntries.forEach(([key, value]) => {
          const isImportant = ['en', 'ev', 'event', 'tid', 'id', 'cid', 'pid', 'dl', 'dt', 'dr', 'v', 'gtm', 'scrsrc', 'label', 'value', 'currency'].includes(key);
          tableHtml += `<tr class="${isImportant ? 'important-param' : ''}">
            <td class="param-key">${this.escapeHtml(key)}</td>
            <td class="param-value">${this.escapeHtml(value)}</td>
          </tr>`;
        });
        tableHtml += '</tbody></table></div>';
      }
      // Build JSON
      const jsonData = {
        platform: platform,
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        parameters: params
      };
      const jsonStr = JSON.stringify(jsonData, null, 2);
      result.innerHTML = `
        <div class="parser-platform-badge">
          <span class="network-badge ${platformClass}">${platform}</span>
          <span class="parser-host">${this.escapeHtml(url.host)}</span>
        </div>
        <div class="url-parser-tabs">
          <button class="detail-tab active" data-view="parserTable">📊 Table</button>
          <button class="detail-tab" data-view="parserJson">{ } JSON</button>
        </div>
        <div class="url-parser-content">
          <div class="url-parser-view active" id="parserTableView">
            <div class="detail-section">
              <div class="detail-section-title">🌐 URL Info</div>
              <table class="param-table"><tbody>
                <tr><td class="param-key">Host</td><td class="param-value">${this.escapeHtml(url.host)}</td></tr>
                <tr><td class="param-key">Path</td><td class="param-value">${this.escapeHtml(url.pathname)}</td></tr>
              </tbody></table>
            </div>
            ${tableHtml || '<div class="qc-empty">No query parameters found</div>'}
          </div>
          <div class="url-parser-view" id="parserJsonView">
            <pre class="json-view">${this.escapeHtml(jsonStr)}</pre>
          </div>
        </div>
        <div class="url-parser-copy-actions">
          <button class="btn-xs btn-primary" id="copyParsedJson">📋 Copy JSON</button>
          <button class="btn-xs" id="copyParsedParams">📋 Copy Params Only</button>
        </div>
      `;
      // Bind tab switching
      result.querySelectorAll('.detail-tab').forEach(tab => {
        tab.onclick = () => {
          result.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
          result.querySelectorAll('.url-parser-view').forEach(v => v.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(tab.dataset.view + 'View')?.classList.add('active');
        };
      });
      // Bind copy buttons
      document.getElementById('copyParsedJson')?.addEventListener('click', () => {
        navigator.clipboard.writeText(jsonStr);
        document.getElementById('copyParsedJson').textContent = '✓ Copied!';
        setTimeout(() => document.getElementById('copyParsedJson').textContent = '📋 Copy JSON', 1000);
      });
      document.getElementById('copyParsedParams')?.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(params, null, 2));
        document.getElementById('copyParsedParams').textContent = '✓ Copied!';
        setTimeout(() => document.getElementById('copyParsedParams').textContent = '📋 Copy Params Only', 1000);
      });
    } catch (e) {
      result.innerHTML = `<div class="qc-empty">❌ Invalid URL: ${this.escapeHtml(e.message)}</div>`;
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new TrackerDetective());
