# Operational Guide

Rules, workflows, and recipes for Mobbin design research sessions. Follow strictly.

---

## Rules

1. **Session first** — always call [`mobbin_connect`](tools/01-lifecycle.md#mobbin_connect) before any other tool. All tools require an active browser instance.
2. **Dismiss popups** — Mobbin shows promotional modals after navigation. Press Escape or call [`mobbin_click`](tools/03-interaction.md#mobbin_click) with `{ text: "×" }` to dismiss.
3. **Rate limit downloads** — 500ms delay between image downloads (built into [`mobbin_download`](tools/05-collection.md#mobbin_download)). For scripts, add explicit `setTimeout(r, 500)` between fetches.
4. **Rate limit scrolls** — wait 2.5s between scroll actions to let infinite scroll content load and settle.
5. **Full resolution images** — CDN thumbnails are 512px webp. For full resolution, replace query params with `?f=png&w=1920&q=100`. See [Image CDN URLs](reference/url-patterns.md#image-cdn-urls).
6. **Deduplicate** — the same app may appear across multiple categories. Deduplicate collected screens by screen URL before downloading.
7. **Session expiry** — Mobbin sessions last ~24–48 hours. If redirected to login page, call [`mobbin_login`](tools/01-lifecycle.md#mobbin_login) again to re-authenticate.
8. **Always disconnect** — call [`mobbin_disconnect`](tools/01-lifecycle.md#mobbin_disconnect) at end of session to save cookies for next time.

---

## Collection Workflow

Standard workflow for collecting screens from a category or search result.

```
Step 1: mobbin_connect()
Step 2: mobbin_navigate({ url: "<search or category URL>" })
Step 3: mobbin_click({ text: "×" })          — dismiss popup
Step 4: Repeat 8 times:
          mobbin_extract()                   — collect screen image URLs
          mobbin_scroll({ direction: "down", amount: 1500 })
          wait 2.5s
Step 5: Deduplicate collected URLs by screen href
Step 6: mobbin_download({ urls: [...], prefix: "category-name" })
Step 7: mobbin_disconnect()
```

> **Note**: Step 4 uses 1500px scroll amount (not the default 800px) for optimal Mobbin infinite scroll loading. The 2.5s delay lets new content render before the next extraction.

---

## Script Template

Standalone script that bypasses MCP and imports the modules directly. Save to `mobbin-agent/scripts/`.

```javascript
// Usage: PATTERN=Dashboard node gather.mjs
// Usage: PATTERN=Home SORT=mostPopular MAX_SCROLLS=12 node gather.mjs

import fs from 'fs';
import path from 'path';

const PATTERN = process.env.PATTERN || 'Dashboard';
const SORT = process.env.SORT || 'trending';
const MAX_SCROLLS = parseInt(process.env.MAX_SCROLLS || '8');
const encoded = encodeURIComponent(PATTERN).replace(/%20/g, '+');

const { BrowserManager } = await import('./dist/browser.js');

const browser = new BrowserManager();
await browser.launch({ headless: true });

const url = `https://mobbin.com/search/apps/ios?content_type=screens&sort=${SORT}&filter=screenPatterns.${encoded}`;
console.log(`Navigating to: ${PATTERN} (${SORT})`);
await browser.navigate(url);

const page = await browser.getPage();
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 2000));

// Collect screen images by scrolling
const allItems = [];
const seen = new Set();

for (let i = 0; i < MAX_SCROLLS; i++) {
  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/screens/"]'))
      .filter(a => a.href.match(/\/screens\/[a-f0-9-]{20,}/))
      .map(a => {
        const img = a.querySelector('img[src*="bytescale"]');
        return {
          screenUrl: a.href,
          imgSrc: img?.src || '',
          alt: img?.alt || ''
        };
      })
      .filter(item => item.imgSrc.length > 0);
  });

  for (const item of items) {
    if (!seen.has(item.screenUrl)) {
      seen.add(item.screenUrl);
      allItems.push(item);
    }
  }

  console.log(`Scroll ${i + 1}/${MAX_SCROLLS} — ${allItems.length} unique screens`);
  await browser.scroll({ direction: 'down', amount: 1500 });
  await new Promise(r => setTimeout(r, 2500));
}

// Download all at full resolution
const slug = PATTERN.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const outDir = path.join(import.meta.dirname, 'data', 'downloads', slug);
fs.mkdirSync(outDir, { recursive: true });

console.log(`\nDownloading ${allItems.length} screens to ${outDir}/`);

let saved = 0;
for (let i = 0; i < allItems.length; i++) {
  const { imgSrc, alt } = allItems[i];
  try {
    const fullRes = imgSrc.split('?')[0] + '?f=png&w=1920&q=100';
    const resp = await fetch(fullRes);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const buf = Buffer.from(await resp.arrayBuffer());
    const appName = alt.replace(/ screen$/i, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filePath = path.join(outDir, `${appName}-${i + 1}.png`);
    fs.writeFileSync(filePath, buf);
    saved++;
    process.stdout.write('.');
  } catch {
    process.stdout.write('x');
  }
  await new Promise(r => setTimeout(r, 500));
}

console.log(`\nDone. ${saved} files saved to ${outDir}/`);
await browser.close();
process.exit(0);
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PATTERN` | `Dashboard` | Screen pattern to search (see [Screen Patterns Catalog](reference/url-patterns.md#complete-screen-patterns-catalog)) |
| `SORT` | `trending` | Sort order: `trending` or `mostPopular` |
| `MAX_SCROLLS` | `8` | Number of scroll iterations to collect screens |

---

## Timeouts

### Built-in (hardcoded)

| Action | Duration | Source |
|--------|----------|--------|
| Page navigation | 30s | `browser.ts` `NAV_TIMEOUT` |
| Network idle settle | 8s | `browser.ts` `settleAfterNavigation` |
| Click/type action delay | 800ms | `browser.ts` `ACTION_DELAY_MS` |
| Scroll settle (network idle) | 8s | `browser.ts` `settleAfterNavigation` |
| Content selector wait | 8s | `mobbin.ts` `extract()` |
| Click/fill element timeout | 10s | `browser.ts` `click()` / `type()` |
| Login timeout | 5 minutes | `mobbin.ts` `LOGIN_TIMEOUT_MS` |
| Login poll interval | 2s | `mobbin.ts` `LOGIN_POLL_INTERVAL_MS` |
| Login settle after success | 3s | `mobbin.ts` `SETTLE_AFTER_LOGIN_MS` |

### Recommended (for scripts)

| Action | Duration |
|--------|----------|
| Between image downloads | 500ms |
| Between scroll iterations | 2.5s |
| After popup dismiss (Escape) | 2s |

---

## Troubleshooting Quick Reference

| Issue | Cause | Fix |
|-------|-------|-----|
| "Browser not connected" | Forgot to connect | Call `mobbin_connect` first |
| Redirected to login | Session expired | Call `mobbin_login` again |
| Empty extract results | Page still loading | Wait 2s or scroll first, then extract |
| Missing screen images | Lazy loading | Scroll down to trigger image loading |
| Promotional modal blocks content | Mobbin popup | `mobbin_click({ text: "×" })` or press Escape |
| Download returns HTTP 403 | CDN auth required | Download within same browser session |
| Low-resolution images | Default CDN params | Append `?f=png&w=1920&q=100` to CDN URLs |
| Duplicate screens in results | Same app in multiple categories | Deduplicate by screen URL |

> For detailed solutions, see [Troubleshooting](troubleshooting/README.md).

---

## Workflow Checklist

Use this checklist when running a collection session:

- [ ] `mobbin_connect` — browser launched
- [ ] Session active (or `mobbin_login` completed)
- [ ] Navigate to target URL
- [ ] Dismiss popup
- [ ] Scroll + extract loop (8 iterations)
- [ ] Deduplicate collected URLs
- [ ] Download with full-resolution CDN params
- [ ] `mobbin_disconnect` — session saved

---

**[API Reference](INDEX.md)** | **[Connection Guide](connection.md)** | **[URL Patterns](reference/url-patterns.md)**
