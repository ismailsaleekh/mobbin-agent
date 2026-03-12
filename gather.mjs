// Usage: PATTERN=Dashboard node gather.mjs
// Usage: PATTERN=Home node gather.mjs
// Usage: PATTERN=Checkout node gather.mjs
// Usage: PATTERN=Dashboard SORT=mostPopular MAX_SCROLLS=12 node gather.mjs

import fs from 'fs';
import path from 'path';

const PATTERN = process.env.PATTERN || 'Dashboard';
const SORT = process.env.SORT || 'trending';
const MAX_SCROLLS = parseInt(process.env.MAX_SCROLLS || '8');
const encoded = encodeURIComponent(PATTERN).replace(/%20/g, '+');

const { BrowserManager } = await import('./dist/browser.js');
const { MobbinNavigator } = await import('./dist/mobbin.js');

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
