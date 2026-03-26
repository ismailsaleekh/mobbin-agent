// Systematic Mobbin Crawler
//
// Crawls all of Mobbin systematically: 99 screen patterns + 8 flow actions +
// 7 UI elements × 2 platforms × 2 sort orders = 456 category pages.
// Downloads every unique item at full resolution, deduplicates globally by UUID,
// and produces a structured corpus with a searchable index.
//
// Usage:
//   cd mobbin-agent
//   npm run build
//   node crawler/systematic-crawler.mjs
//
// Resume after interruption:
//   node crawler/systematic-crawler.mjs   (reads checkpoint automatically)

import fs from 'fs';
import path from 'path';
import { SCREEN_PATTERNS, FLOW_ACTIONS, UI_ELEMENTS, PLATFORMS, SORT_ORDERS } from './catalogs.mjs';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CONFIG = {
  MAX_SCROLLS: 10,
  SCROLL_AMOUNT: 1500,
  SCROLL_DELAY_MS: 2500,
  DOWNLOAD_DELAY_MS: 500,
  POPUP_DELAY_MS: 2000,
  RATE_LIMIT_BACKOFF_MS: 30_000,
  FULL_RES_PARAMS: '?f=png&w=1920&q=100',
  SEARCH_BASE: 'https://mobbin.com/search/apps',
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT_DIR = path.join(import.meta.dirname, '..');
const CORPUS_DIR = path.join(ROOT_DIR, 'data', 'corpus');
const INDEX_PATH = path.join(CORPUS_DIR, 'index.json');
const CHECKPOINT_PATH = path.join(CORPUS_DIR, 'checkpoint.json');
const STATS_PATH = path.join(CORPUS_DIR, 'stats.json');

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function log(message) {
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`[${ts}] ${message}`);
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ---------------------------------------------------------------------------
// UUID extraction
// ---------------------------------------------------------------------------

function extractUuid(url) {
  const match = url.match(/\/(screens|flows)\/([a-f0-9-]{20,})/);
  return match ? match[2] : null;
}

function toFullRes(thumbnailUrl) {
  return thumbnailUrl.split('?')[0] + CONFIG.FULL_RES_PARAMS;
}

// ---------------------------------------------------------------------------
// Crawl plan generation
// ---------------------------------------------------------------------------

function generateCrawlPlan() {
  const plan = [];

  for (const platform of PLATFORMS) {
    for (const sort of SORT_ORDERS) {
      for (const pattern of SCREEN_PATTERNS) {
        plan.push({
          contentType: 'screens',
          filterKey: 'screenPatterns',
          platform,
          pattern,
          sort,
          categoryKey: `screens/${platform.name}/${pattern.slug}/${sort}`,
        });
      }
      for (const action of FLOW_ACTIONS) {
        plan.push({
          contentType: 'flows',
          filterKey: 'flowActions',
          platform,
          pattern: action,
          sort,
          categoryKey: `flows/${platform.name}/${action.slug}/${sort}`,
        });
      }
      for (const element of UI_ELEMENTS) {
        plan.push({
          contentType: 'ui-elements',
          filterKey: 'screenElements',
          platform,
          pattern: element,
          sort,
          categoryKey: `ui-elements/${platform.name}/${element.slug}/${sort}`,
        });
      }
    }
  }

  return plan;
}

function buildSearchUrl(entry) {
  return [
    CONFIG.SEARCH_BASE,
    '/', entry.platform.searchParam,
    '?content_type=', entry.contentType,
    '&sort=', entry.sort,
    '&filter=', entry.filterKey, '.', entry.pattern.encoded,
  ].join('');
}

// ---------------------------------------------------------------------------
// State management (checkpoint + index)
// ---------------------------------------------------------------------------

function loadState() {
  const state = {
    index: new Map(),        // uuid -> entry
    completed: new Set(),    // categoryKey set
    startedAt: new Date().toISOString(),
    totalDownloaded: 0,
    totalDuplicates: 0,
    totalErrors: 0,
  };

  // Load existing index
  if (fs.existsSync(INDEX_PATH)) {
    const entries = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
    for (const entry of entries) {
      state.index.set(entry.uuid, entry);
    }
    log(`Loaded index: ${state.index.size} items`);
  }

  // Load checkpoint
  if (fs.existsSync(CHECKPOINT_PATH)) {
    const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'));
    for (const key of checkpoint.completedCategories) {
      state.completed.add(key);
    }
    state.startedAt = checkpoint.startedAt;
    state.totalDownloaded = checkpoint.totalDownloaded || 0;
    state.totalDuplicates = checkpoint.totalDuplicates || 0;
    state.totalErrors = checkpoint.totalErrors || 0;
    log(`Loaded checkpoint: ${state.completed.size} categories complete`);
  }

  return state;
}

function saveState(state, totalCategories) {
  fs.mkdirSync(CORPUS_DIR, { recursive: true });

  // Write index (array of entries)
  const indexArray = Array.from(state.index.values());
  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexArray, null, 2));

  // Write checkpoint
  const checkpoint = {
    startedAt: state.startedAt,
    completedCategories: Array.from(state.completed),
    totalCategories,
    totalItemsIndexed: state.index.size,
    totalDownloaded: state.totalDownloaded,
    totalDuplicates: state.totalDuplicates,
    totalErrors: state.totalErrors,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

function saveStats(state, plan, elapsedMs) {
  const stats = {
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    elapsedMs,
    elapsed: formatDuration(elapsedMs),
    totalCategories: plan.length,
    categoriesCompleted: state.completed.size,
    totalItemsIndexed: state.index.size,
    totalDownloaded: state.totalDownloaded,
    totalDuplicates: state.totalDuplicates,
    totalErrors: state.totalErrors,
    byContentType: {
      screens: Array.from(state.index.values()).filter(e => e.contentType === 'screens').length,
      flows: Array.from(state.index.values()).filter(e => e.contentType === 'flows').length,
      'ui-elements': Array.from(state.index.values()).filter(e => e.contentType === 'ui-elements').length,
    },
    byPlatform: {
      mobile: Array.from(state.index.values()).filter(e => e.platform === 'mobile').length,
      web: Array.from(state.index.values()).filter(e => e.platform === 'web').length,
    },
  };
  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
}

// ---------------------------------------------------------------------------
// DOM extraction
// ---------------------------------------------------------------------------

async function extractPageItems(page, contentType) {
  // Screens and UI elements surface as /screens/{uuid} links.
  // Flows surface as /flows/{uuid} links.
  const linkFragment = contentType === 'flows' ? '/flows/' : '/screens/';
  const uuidPattern = contentType === 'flows'
    ? '\\/flows\\/([a-f0-9-]{20,})'
    : '\\/screens\\/([a-f0-9-]{20,})';

  return await page.evaluate(({ linkFragment, uuidPattern }) => {
    const regex = new RegExp(uuidPattern);
    return Array.from(document.querySelectorAll(`a[href*="${linkFragment}"]`))
      .filter(a => regex.test(a.href))
      .map(a => {
        const img = a.querySelector('img[src*="bytescale"]');
        return {
          itemUrl: a.href,
          imgSrc: img?.src || '',
          alt: img?.alt || '',
        };
      })
      .filter(item => item.imgSrc.length > 0);
  }, { linkFragment, uuidPattern });
}

// ---------------------------------------------------------------------------
// Single category crawl
// ---------------------------------------------------------------------------

async function crawlCategory(browser, entry, state) {
  const url = buildSearchUrl(entry);
  const result = { newItems: 0, dupes: 0, errors: 0, skipped: false };

  // Navigate
  try {
    await browser.navigate(url);
  } catch (err) {
    log(`  Navigation failed: ${err.message}`);
    result.errors = 1;
    return result;
  }

  // Check for login redirect
  const page = await browser.getPage();
  const currentUrl = page.url();
  if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
    throw new LoginRequiredError();
  }

  // Dismiss popup
  try {
    await page.keyboard.press('Escape');
  } catch { /* popup may not exist */ }
  await delay(CONFIG.POPUP_DELAY_MS);

  // Scroll and collect items
  const newItems = [];

  for (let scroll = 0; scroll < CONFIG.MAX_SCROLLS; scroll++) {
    const items = await extractPageItems(page, entry.contentType);

    for (const item of items) {
      const uuid = extractUuid(item.itemUrl);
      if (!uuid) continue;

      if (state.index.has(uuid)) {
        // Duplicate — extend foundIn
        const existing = state.index.get(uuid);
        if (!existing.foundIn.includes(entry.categoryKey)) {
          existing.foundIn.push(entry.categoryKey);
        }
        result.dupes++;
      } else {
        // New item — queue for download
        newItems.push({ ...item, uuid });
      }
    }

    // Scroll down
    await browser.scroll({ direction: 'down', amount: CONFIG.SCROLL_AMOUNT });
    await delay(CONFIG.SCROLL_DELAY_MS);
  }

  // Deduplicate items discovered within this category (same UUID from multiple scroll positions)
  const uniqueNew = new Map();
  for (const item of newItems) {
    if (!uniqueNew.has(item.uuid)) {
      uniqueNew.set(item.uuid, item);
    }
  }

  if (uniqueNew.size === 0) {
    return result;
  }

  // Create output directory
  const outDir = path.join(CORPUS_DIR, entry.contentType, entry.platform.name, entry.pattern.slug);
  fs.mkdirSync(outDir, { recursive: true });

  // Download each new item
  for (const [uuid, item] of uniqueNew) {
    const filePath = path.join(outDir, `${uuid}.png`);
    const relPath = path.relative(CORPUS_DIR, filePath);

    // Skip if file already exists on disk (partial previous run)
    if (fs.existsSync(filePath)) {
      state.index.set(uuid, state.index.get(uuid) || createIndexEntry(uuid, relPath, item, entry));
      result.newItems++;
      continue;
    }

    try {
      const fullResUrl = toFullRes(item.imgSrc);
      const resp = await fetch(fullResUrl);

      if (resp.status === 429) {
        log(`  Rate limited — backing off ${CONFIG.RATE_LIMIT_BACKOFF_MS / 1000}s`);
        await delay(CONFIG.RATE_LIMIT_BACKOFF_MS);
        const retry = await fetch(fullResUrl);
        if (!retry.ok) {
          result.errors++;
          continue;
        }
        const buf = Buffer.from(await retry.arrayBuffer());
        fs.writeFileSync(filePath, buf);
      } else if (!resp.ok) {
        result.errors++;
        continue;
      } else {
        const buf = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(filePath, buf);
      }

      // Add to index
      state.index.set(uuid, createIndexEntry(uuid, relPath, item, entry));
      result.newItems++;
      state.totalDownloaded++;
      process.stdout.write('.');
    } catch {
      result.errors++;
      process.stdout.write('x');
    }

    await delay(CONFIG.DOWNLOAD_DELAY_MS);
  }

  if (uniqueNew.size > 0) {
    process.stdout.write('\n');
  }

  return result;
}

function createIndexEntry(uuid, relPath, item, entry) {
  const appName = (item.alt || '')
    .replace(/ screen$/i, '')
    .replace(/ mobile$/i, '')
    .replace(/ web$/i, '')
    .trim();

  return {
    uuid,
    file: relPath,
    contentType: entry.contentType,
    platform: entry.platform.name,
    pattern: entry.pattern.name,
    patternSlug: entry.pattern.slug,
    appName: appName || 'unknown',
    imgSrc: item.imgSrc,
    screenUrl: item.itemUrl,
    foundIn: [entry.categoryKey],
    collectedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

class LoginRequiredError extends Error {
  constructor() {
    super('Session expired — redirected to login page');
    this.name = 'LoginRequiredError';
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const plan = generateCrawlPlan();
  const state = loadState();
  const remaining = plan.filter(e => !state.completed.has(e.categoryKey));

  log(`Systematic crawl — ${plan.length} total categories, ${remaining.length} remaining`);
  log(`Index: ${state.index.size} items | Downloaded: ${state.totalDownloaded} | Dupes: ${state.totalDuplicates}`);

  if (remaining.length === 0) {
    log('All categories already complete. Nothing to do.');
    saveStats(state, plan, 0);
    return;
  }

  // Import and launch browser
  const { BrowserManager } = await import('../dist/browser.js');
  const browser = new BrowserManager();
  log('Launching browser...');
  const launchMsg = await browser.launch({ headless: true });
  log(launchMsg);

  const crawlStart = Date.now();
  let categoriesDone = 0;

  try {
    for (const entry of remaining) {
      const catNum = state.completed.size + 1;
      log(`[${catNum}/${plan.length}] ${entry.categoryKey}`);

      try {
        const result = await crawlCategory(browser, entry, state);

        state.totalDuplicates += result.dupes;
        state.totalErrors += result.errors;
        state.completed.add(entry.categoryKey);
        categoriesDone++;

        log(`  ${result.newItems} new, ${result.dupes} dupes, ${result.errors} errors — total: ${state.index.size} items`);

        // Save state after every category
        saveState(state, plan.length);

        // ETA
        const elapsed = Date.now() - crawlStart;
        const avgPerCat = elapsed / categoriesDone;
        const etaMs = avgPerCat * (remaining.length - categoriesDone);
        if (categoriesDone % 10 === 0) {
          log(`  ETA: ${formatDuration(etaMs)} remaining (avg ${formatDuration(avgPerCat)}/category)`);
        }
      } catch (err) {
        if (err instanceof LoginRequiredError) {
          log('');
          log('Session expired. Checkpoint saved.');
          log('To resume:');
          log('  1. cd mobbin-agent');
          log('  2. node -e "import(\'./dist/browser.js\').then(async m => { const b = new m.BrowserManager(); await b.launch({headless:false}); const {MobbinNavigator} = await import(\'./dist/mobbin.js\'); const n = new MobbinNavigator(b); await n.login(); await b.close(); })"');
          log('  3. node crawler/systematic-crawler.mjs');
          saveState(state, plan.length);
          await browser.close();
          process.exit(1);
        }

        // Unexpected error on single category — skip and continue
        log(`  ERROR: ${err.message} — skipping`);
        state.totalErrors++;
        state.completed.add(entry.categoryKey);
        saveState(state, plan.length);
      }
    }

    const totalElapsed = Date.now() - crawlStart;
    log('');
    log('Crawl complete!');
    log(`  Categories: ${state.completed.size}/${plan.length}`);
    log(`  Items indexed: ${state.index.size}`);
    log(`  Downloaded: ${state.totalDownloaded}`);
    log(`  Duplicates skipped: ${state.totalDuplicates}`);
    log(`  Errors: ${state.totalErrors}`);
    log(`  Time: ${formatDuration(totalElapsed)}`);

    saveStats(state, plan, totalElapsed);
    saveState(state, plan.length);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
