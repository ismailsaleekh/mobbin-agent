# Systematic Crawler — Mobbin Corpus Collection

## Purpose

Systematically crawl all of Mobbin to build a complete, pre-classified design inspiration corpus. Downloads every screen, flow, and UI element across all platforms, categories, and sort orders — producing a structured dataset ready for AI classification agents.

This replaces the on-demand, per-project Mobbin browsing pattern (Phase G Stage 1) with a one-time, exhaustive collection that any project can query.

## Architecture

```
systematic-crawler.mjs
  │
  ├── Imports BrowserManager + MobbinNavigator from ../dist/
  ├── Reads category catalogs from catalogs.mjs
  │
  ├── Generates crawl plan (288 category pages)
  │   2 platforms × (57 screen patterns + 8 flow actions + 7 UI elements) × 2 sort orders
  │
  ├── Per category page:
  │   navigate → dismiss popup → scroll 10x (extract + dedup) → download new items
  │
  ├── Global dedup by UUID across all categories
  │   Duplicate items get their foundIn[] array extended, not re-downloaded
  │
  ├── Checkpoint after every category
  │   Resume-safe: handles session expiry, crashes, manual stops
  │
  └── Output: data/corpus/ (structured tree + index.json)
```

## Key Numbers

| Metric | Value |
|--------|-------|
| Category pages to crawl | 456 |
| Screen patterns | 99 |
| Flow actions | 8 |
| UI element types | 7 |
| Platforms | 2 (mobile/iOS, web) |
| Sort orders | 2 (trending, mostPopular) |
| Estimated unique items | 10,000-20,000 |
| Estimated runtime | 4-6 hours (single browser instance) |
| Estimated storage | 10-45 GB |

## Content Matrix

```
SCREENS:   99 patterns × 2 platforms × 2 sorts = 396 pages
FLOWS:      8 actions  × 2 platforms × 2 sorts =  32 pages
UI-ELEMS:   7 elements × 2 platforms × 2 sorts =  28 pages
                                          TOTAL = 456 pages
```

## Output Structure

```
data/corpus/                              (gitignored — runtime output)
├── index.json                            Master index — all items, searchable
├── checkpoint.json                       Resume state — which categories done
├── stats.json                            Run statistics
│
├── screens/
│   ├── mobile/
│   │   ├── dashboard/{appslug}-{uuid}.png
│   │   ├── home/{appslug}-{uuid}.png
│   │   └── ...57 pattern directories
│   └── web/
│       └── ...57 pattern directories
│
├── flows/
│   ├── mobile/
│   │   ├── onboarding/{appslug}-{uuid}.png
│   │   └── ...8 action directories
│   └── web/
│       └── ...8 action directories
│
└── ui-elements/
    ├── mobile/
    │   ├── button/{appslug}-{uuid}.png
    │   └── ...7 element directories
    └── web/
        └── ...7 element directories
```

## Metadata Schema (index.json entries)

Each item in the corpus index contains:

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Screen/flow UUID from Mobbin URL (global dedup key) |
| `file` | string | Relative path from `data/corpus/` root |
| `contentType` | string | `screens`, `flows`, or `ui-elements` |
| `platform` | string | `mobile` or `web` |
| `pattern` | string | Display name (e.g., `"Dashboard"`) |
| `patternSlug` | string | Filesystem-safe slug (e.g., `"dashboard"`) |
| `appName` | string | App name from img alt attribute |
| `imgSrc` | string | Original CDN thumbnail URL |
| `screenUrl` | string | Mobbin detail page URL |
| `foundIn` | string[] | All categories that surfaced this item |
| `collectedAt` | string | ISO 8601 timestamp |

## Rate Limiting & Anti-Detection

- Single browser instance (avoids IP-level detection)
- 2.5s between scrolls (Mobbin infinite scroll settle time)
- 500ms between downloads (CDN rate limiting)
- 800ms action delay (built into BrowserManager)
- Realistic user agent + viewport (Chrome 131, 1440x900, 2x scale)

## Resume & Checkpoint

The crawler is fully resume-safe:

1. `checkpoint.json` records which categories are complete
2. `index.json` provides the global seen-set for dedup
3. On startup: load both, skip completed categories, resume
4. Handles session expiry (24-48h): stop, re-login, re-run

## Error Handling

| Error | Strategy |
|-------|----------|
| HTTP 403 on download | Log, skip item, continue |
| HTTP 429 (rate limit) | Back off 30s, retry once, skip on second failure |
| Navigation timeout | Skip category, log, continue |
| Empty extract (0 items) | Mark category done, log, continue |
| Login redirect | Save checkpoint, exit with re-login message |
| Process crash | Resume from checkpoint on next run |

## Relationship to Pipeline

| Before (Phase G Stage 1) | After (corpus-based) |
|--------------------------|---------------------|
| Browse Mobbin at runtime via MCP | Query pre-built corpus |
| Per-project collection | One-time collection, multi-project reuse |
| Style-direction-dependent search | Universal collection, project-specific filtering |
| Agent-driven browsing | Script-driven crawling + agent-driven classification |
| ~30 min per project | 0 min per project (corpus already exists) |

## Prerequisites

```bash
cd mobbin-agent
npm install
npm run build          # Compile TypeScript → dist/
# Ensure authenticated session exists (data/session/storage-state.json)
```

## Usage

```bash
cd mobbin-agent
node crawler/systematic-crawler.mjs

# Resume after interruption:
node crawler/systematic-crawler.mjs    # Reads checkpoint.json automatically
```

## Related

| Resource | Path | Purpose |
|----------|------|---------|
| Browser automation | `../src/browser.ts` | BrowserManager class (Playwright) |
| Mobbin navigation | `../src/mobbin.ts` | MobbinNavigator, URL patterns, categories |
| Original batch script | `../gather.mjs` | Single-pattern collection (predecessor) |
| URL patterns reference | `../docs/reference/url-patterns.md` | Full category catalogs with URL encoding |
| Operational guide | `../docs/OPERATIONAL-GUIDE.md` | Rate limits, timeouts, workflows |
| Pipeline Phase G | `/pipeline/context/instructions/screen-spec/01-inspiration/` | How inspirations are consumed |
| Design DNA inspirations | `/pipeline/context/design-dna/inspirations/` | Current 14 category files (188 techniques) |

---

## Last Updated

2026-03-27
