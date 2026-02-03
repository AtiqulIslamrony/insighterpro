# Insighter Pro — User Guide

Welcome to Insighter Pro! This guide covers everything you need to know to get the most out of the extension.

---

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Pixels Tab](#pixels-tab)
4. [Events Tab](#events-tab)
5. [DataLayer Tab](#datalayer-tab)
6. [Consent Tab](#consent-tab)
7. [Storage Tab](#storage-tab)
8. [Tech Stack Tab](#tech-stack-tab)
9. [GTM Preview & Loader](#gtm-preview--loader)
10. [Insights Tab](#insights-tab)
11. [Settings & Preferences](#settings--preferences)
12. [Tips & Best Practices](#tips--best-practices)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)

---

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [Insighter Pro Chrome Web Store page](https://chromewebstore.google.com/detail/insighter-pro/bfpddkljoofdiomkmbbmfgbgmfhpgoec)
2. Click **Add to Chrome**
3. Click **Add extension** in the popup
4. Pin the extension to your toolbar for quick access (click the puzzle icon → pin Insighter Pro)

---

## Getting Started

### Opening Insighter Pro

1. Navigate to any website you want to analyze
2. Click the Insighter Pro icon in your toolbar
3. The popup opens with all detected information

### Interface Overview

The extension has a tabbed interface:

| Tab | Purpose |
|-----|---------|
| **Pixels** | Detected tracking pixels and tags |
| **Events** | Real-time event monitoring |
| **DataLayer** | GTM dataLayer inspection |
| **Consent** | Consent Mode status and CMP detection |
| **Storage** | Cookies and localStorage browser |
| **Tech** | Technology stack detection |
| **GTM** | GTM Preview & Loader tool |
| **Insights** | Quick checks and diagnostics |

### Theme Toggle

Click the moon/sun icon in the header to switch between dark and light mode. Your preference is saved automatically.

---

## Pixels Tab

The Pixels tab shows all tracking pixels and marketing tags detected on the current page.

### What You'll See

For each detected pixel:

- **Platform name** and logo (GA4, GTM, Meta, TikTok, etc.)
- **Pixel/Container ID** (e.g., G-XXXXXXX, GTM-XXXXXX)
- **Event count** — number of events fired
- **SST indicator** — shows if server-side tracking is detected
- **Status** — active, inactive, or blocked

### Supported Platforms

Insighter Pro detects 200+ platforms including:

**Analytics**: Google Analytics 4, Adobe Analytics, Mixpanel, Amplitude, Heap, Segment, Hotjar, Microsoft Clarity, PostHog, Matomo, Piwik Pro, FullStory, Lucky Orange, Crazy Egg

**Marketing Pixels**: Meta Pixel (Facebook), Google Ads, TikTok Pixel, LinkedIn Insight Tag, Pinterest Tag, Snapchat Pixel, Twitter/X Pixel, Reddit Pixel, Microsoft Ads (Bing), Quora Pixel, Taboola, Outbrain, Criteo

**Tag Management**: Google Tag Manager, Adobe Launch, Tealium iQ, Segment, Ensighten

**Attribution**: Hyros, Triple Whale, Northbeam, AppsFlyer, Adjust, Branch, Rockerbox, Wicked Reports, Ruler Analytics

**CMP/Consent**: OneTrust, Cookiebot, TrustArc, Quantcast, Didomi, Usercentrics, Complianz, Iubenda, Termly, CookieYes

### Tips

- Click any pixel row to expand and see more details
- Use the search/filter box to find specific pixels
- The count badge shows total detected pixels
- SST (Server-Side Tracking) indicator helps identify advanced implementations

---

## Events Tab

The Events tab shows tracking events firing in real-time.

### Real-Time Monitoring

As you interact with the page (clicks, scrolls, form submissions, purchases), watch events appear live:

- **Event name** (page_view, purchase, add_to_cart, Lead, ViewContent, etc.)
- **Platform** (which pixel fired the event)
- **Timestamp** (when it fired)
- **Parameters** (full payload data)

### Event Details

Click any event to expand and see:

- Full parameter list
- Request URL
- Request method (GET/POST)
- Payload data
- Response status

### Filtering Events

- Use the search box to filter by event name or platform
- Toggle platforms on/off to focus on specific ones
- Clear button resets the event list

### Use Cases

- Verify purchase events fire with correct revenue values
- Check that add_to_cart includes product IDs
- Confirm lead form submissions trigger the right pixels
- Debug why conversions aren't tracking

---

## DataLayer Tab

The DataLayer tab provides deep inspection of the GTM dataLayer.

### What is dataLayer?

The dataLayer is a JavaScript array that GTM uses to receive information from your website. Every `dataLayer.push()` appears here.

### Features

**Tree View**: Expand nested objects to see full structure

**Friendly Labels**: Common keys are labeled for clarity:
- `event` → Event Name
- `ecommerce.purchase.transaction_id` → Transaction ID
- `ecommerce.items` → Product Array

**Search**: Find specific keys or values instantly

**Copy**: One-click copy any event or the entire dataLayer

**History**: See all pushes since page load, not just current state

### Reading DataLayer Events

Each card shows:

- **Event name** (if present)
- **Timestamp** of the push
- **Full data structure** with expandable tree

### Common Events to Look For

| Event | Purpose |
|-------|---------|
| `gtm.js` | GTM initialization |
| `gtm.dom` | DOM ready |
| `gtm.load` | Window load |
| `page_view` | Page view tracking |
| `view_item` | Product page view |
| `add_to_cart` | Add to cart action |
| `begin_checkout` | Checkout started |
| `purchase` | Transaction complete |

---

## Consent Tab

The Consent tab verifies Google Consent Mode v2 implementation and detects CMP platforms.

### Google Consent Mode v2

Consent Mode lets you adjust how Google tags behave based on user consent. This tab shows:

**Consent States**:
- `ad_storage` — Enables storage for advertising
- `analytics_storage` — Enables storage for analytics
- `ad_user_data` — Allows sending user data to Google for advertising
- `ad_personalization` — Allows personalized advertising

**Status Values**:
- ✅ `granted` — User gave consent
- ❌ `denied` — User denied consent
- ⚠️ `not set` — No consent signal detected

### GCS and GCD Parameters

The tab shows the encoded consent strings:
- **GCS** (Google Consent State) — Current consent status
- **GCD** (Google Consent Default) — Default consent values

### CMP Detection

Insighter Pro detects 15+ Consent Management Platforms:

OneTrust, Cookiebot, TrustArc, Quantcast Choice, Didomi, Usercentrics, Complianz, Iubenda, Termly, CookieYes, Sourcepoint, Osano, CookieFirst, Cookie Script, Borlabs Cookie

### Why This Matters

- **GDPR Compliance**: EU requires consent before tracking
- **DMA Compliance**: Digital Markets Act requires Consent Mode v2 for Google services
- **Accurate Tracking**: Consent Mode enables conversion modeling for denied users

---

## Storage Tab

The Storage tab lets you browse and manage all browser storage for the current site.

### Storage Types

**Cookies**: Small text files stored by websites
- View name, value, domain, path, expiration
- See secure and httpOnly flags
- Filter by first-party vs third-party

**localStorage**: Persistent key-value storage
- View all stored data
- See data size
- Survives browser close

**sessionStorage**: Temporary key-value storage
- Same as localStorage but clears when tab closes

### Features

- **Search**: Find specific cookies or storage keys
- **Filter**: Show only cookies from specific domains
- **Size**: See how much storage each item uses
- **Expiration**: Check when cookies expire
- **Copy**: Copy any value with one click

### Common Tracking Cookies

| Cookie | Platform | Purpose |
|--------|----------|---------|
| `_ga` | Google Analytics | Client ID |
| `_gid` | Google Analytics | Session ID |
| `_fbp` | Meta Pixel | Browser ID |
| `_fbc` | Meta Pixel | Click ID |
| `_ttp` | TikTok | Pixel ID |
| `_gcl_au` | Google Ads | Conversion Linker |

---

## Tech Stack Tab

The Tech Stack tab identifies technologies used on the website.

### Categories Detected

**CMS & Platforms**: WordPress, Shopify, Wix, Squarespace, Webflow, Magento, WooCommerce, BigCommerce, PrestaShop

**JavaScript Frameworks**: React, Vue.js, Angular, Next.js, Nuxt.js, Svelte, jQuery

**CDN Providers**: Cloudflare, Fastly, Akamai, Amazon CloudFront, StackPath

**Hosting**: AWS, Google Cloud, Azure, Vercel, Netlify, WP Engine

**Analytics & Marketing**: (covered in Pixels tab)

**A/B Testing**: Optimizely, VWO, Google Optimize, AB Tasty, Convert

**Live Chat**: Intercom, Drift, Zendesk, LiveChat, Crisp, Tawk.to

**Email Marketing**: Mailchimp, Klaviyo, ActiveCampaign, HubSpot, Drip

**Heatmaps & Session Recording**: Hotjar, Microsoft Clarity, Crazy Egg, FullStory, Lucky Orange

### Use Cases

- Competitive analysis — see what tools competitors use
- Pre-audit research — understand the tech stack before diving in
- Migration planning — identify all integrations that need updating

---

## GTM Preview & Loader

The GTM Preview & Loader lets you load any GTM container on any page for debugging purposes.

### How to Use

1. Go to the **GTM** tab
2. Enter a GTM Container ID (e.g., `GTM-XXXXXX`)
3. Click **Load Container**
4. The container loads on the current page

### Use Cases

- **Testing new containers**: Load your staging GTM on the live site
- **Auditing**: Load a known-good container to compare behavior
- **Learning**: See how other containers are configured
- **QA**: Test changes before publishing

### Important Notes

- The loaded container is temporary — it only exists for the current page session
- Refresh the page to remove the loaded container
- This doesn't modify the actual website — it's local to your browser
- Use GTM Preview mode for full debugging capabilities

---

## Insights Tab

The Insights tab runs quick diagnostics and provides actionable recommendations.

### Quick Checks

**UTM Parameters**: Detects UTM tags in the URL
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

**Missing Pixels**: Alerts if common pixels are missing:
- Google Analytics not detected
- GTM not detected
- Facebook Pixel not detected

**Duplicate Tags**: Warns if the same pixel is loaded multiple times

**SSL Status**: Confirms the page uses HTTPS

**Server-Side Tracking**: Indicates if SST is detected for any platform

### Health Score

Based on the checks, you'll see an overall health indicator:
- 🟢 Good — Everything looks correct
- 🟡 Warning — Some issues to review
- 🔴 Issues — Problems that need attention

---

## Settings & Preferences

### Theme

Toggle between dark and light mode. Your preference persists across sessions.

### About

View extension version, credits, and links to:
- Privacy Policy
- GitHub Repository
- Support (Patreon)
- Contact Email

---

## Tips & Best Practices

### For Pixel Debugging

1. **Refresh after changes**: After modifying tags, refresh the page and Insighter Pro
2. **Check multiple pages**: Some pixels only fire on specific pages
3. **Test conversions end-to-end**: Go through the full funnel to verify all events
4. **Compare staging vs production**: Use the extension on both environments

### For DataLayer Debugging

1. **Watch for typos**: Common issues are misspelled event names or parameter keys
2. **Check data types**: Ensure prices are numbers, not strings
3. **Verify ecommerce structure**: GA4 expects specific object formats
4. **Look for timing issues**: Some events might fire before dataLayer is ready

### For Consent Mode

1. **Test both states**: Verify behavior with consent granted AND denied
2. **Check default values**: Ensure defaults are set before Google tags load
3. **Verify CMP integration**: Confirm your CMP properly updates consent states
4. **Test across regions**: Behavior may differ for EU vs non-EU visitors

### For Client Audits

1. **Screenshot everything**: Capture the Pixels, Consent, and DataLayer tabs
2. **Document what's missing**: Use Insights tab for quick health check
3. **Export dataLayer**: Copy the full dataLayer for your audit report
4. **Check multiple pages**: Home, product, cart, checkout, thank-you

---

## Troubleshooting

### Extension Shows No Pixels

**Possible causes:**
- The page hasn't fully loaded yet — wait a moment and check again
- The page has no tracking pixels (rare but possible)
- Pixels are blocked by an ad blocker — disable it and refresh
- The site uses unusual implementation — try the Events tab instead

### DataLayer is Empty

**Possible causes:**
- The site doesn't use GTM or dataLayer
- DataLayer has a different variable name (check page source)
- GTM is blocked — check the Pixels tab

### Events Not Appearing

**Possible causes:**
- No actions have been taken yet — try clicking, scrolling, or submitting a form
- Pixels are using non-standard methods — check Network tab in DevTools
- Events fire before extension loads — refresh and watch immediately

### Consent Mode Shows "Not Set"

**Possible causes:**
- The site doesn't implement Consent Mode
- Consent defaults aren't set properly
- CMP hasn't initialized yet — accept/reject cookies and check again

### Extension Popup is Blank

**Possible causes:**
- Chrome needs to be restarted
- Extension needs reinstalling
- Try disabling and re-enabling the extension

---

## FAQ

**Q: Is Insighter Pro free?**
A: Yes, 100% free. No premium tier, no limits, no subscription.

**Q: Does Insighter Pro collect my data?**
A: No. Everything runs locally in your browser. We don't collect any data.

**Q: Can I use this on client sites?**
A: Absolutely. That's what it's built for.

**Q: Does it work on all websites?**
A: It works on most websites. Some highly restricted sites may block extensions.

**Q: How often is it updated?**
A: We regularly add support for new platforms and features. Updates are automatic through Chrome Web Store.

**Q: Can I request a new platform?**
A: Yes! Open an issue on GitHub or email us at insighterpro@gmail.com.

**Q: Is the source code available?**
A: Yes, on GitHub: https://github.com/AtiqulIslamRony/insighterpro

**Q: How do I report a bug?**
A: Open an issue on GitHub or email insighterpro@gmail.com.

---

## Support

**Email**: insighterpro@gmail.com

**GitHub Issues**: https://github.com/AtiqulIslamRony/insighterpro/issues

**Patreon**: https://www.patreon.com/join/2951366

---

## Credits

Built with 🧡 by the Insighter Pro team:

- **Atiqul Islam** — Founder & Lead Developer
- **Abdul Kader Shimul** — Co-Founder
- Nadim Mahmud Sizan
- Rafiqul Islam Siman
- Md Abu Sufiyan
- Imran Hossain
- Md Zobair
- Md Alimul Islam Emon
- Sakib Hossain

---

**Version**: 1.0.5

**Last Updated**: February 2025

**License**: Proprietary — see [LICENSE](LICENSE) for details
