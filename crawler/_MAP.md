# Systematic Crawler — File Map

## Structure

```
crawler/                                          Source files
├── _CONTEXT.md                                   Overview, architecture, output schema
├── _MAP.md                                       This file — navigation guide
├── systematic-crawler.mjs                        Main crawler script — orchestrates full crawl
└── catalogs.mjs                                  Category definitions — 57 screen patterns,
                                                  8 flow actions, 7 UI elements with URL encoding

data/corpus/                                      Output (gitignored)
├── index.json                                    Master index — all items with metadata
├── checkpoint.json                               Resume state — completed categories
├── stats.json                                    Run statistics (totals, timing, errors)
├── screens/{mobile,web}/{pattern-slug}/*.png      Screen screenshots by pattern
├── flows/{mobile,web}/{action-slug}/*.png         Flow screenshots by action
└── ui-elements/{mobile,web}/{element-slug}/*.png  UI element screenshots by type
```

## File Descriptions

| File | Purpose | Status |
|------|---------|--------|
| `_CONTEXT.md` | Crawler overview, architecture, metadata schema, error handling | Complete |
| `_MAP.md` | This file — navigation guide | Complete |
| `systematic-crawler.mjs` | Main script: crawl plan generation, scroll+extract loop, download, dedup, checkpoint | Complete |
| `catalogs.mjs` | All 114 categories (99 screen patterns + 8 flows + 7 UI elements) with URL-encoded values | Complete |

## Quick Reference

| Need | Read |
|------|------|
| Understand the crawler | `_CONTEXT.md` |
| Find a file | This file (`_MAP.md`) |
| Run the crawler | `_CONTEXT.md` → Usage section |
| Understand output format | `_CONTEXT.md` → Metadata Schema section |
| See all Mobbin categories | `catalogs.mjs` |
| Understand rate limits | `_CONTEXT.md` → Rate Limiting section |

## Navigation

- **Up:** `../README.md` — Mobbin Agent overview
- **Related:** `../gather.mjs` — Original single-pattern batch script (predecessor)
- **Related:** `../docs/reference/url-patterns.md` — Full Mobbin URL patterns reference
- **Related:** `../src/browser.ts` — BrowserManager class used by crawler
- **Related:** `../src/mobbin.ts` — MobbinNavigator, URL builders, category constants

---

## Last Updated

2026-03-27
