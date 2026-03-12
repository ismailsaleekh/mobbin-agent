# Perception

Page observation — screenshot the viewport and extract structured data.

---

## `mobbin_screenshot`

Take a screenshot of the current browser viewport.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fullPage` | boolean | No | `false` | Capture the full scrollable page instead of just the viewport |

**Returns:** PNG image (base64-encoded via MCP image content type, `mimeType: "image/png"`).

**Notes:**
- Default viewport: 1440x900 at 2x device scale (2880x1800 actual pixels)
- Use for visual inspection when `mobbin_extract` data isn't sufficient
- Full-page screenshots can be very large on infinite scroll pages — use with caution

---

## `mobbin_extract`

Extract structured data from the current Mobbin page.

**Parameters:** None.

**Returns:** JSON object:

```json
{
  "url": "https://mobbin.com/explore/mobile/screens/dashboard",
  "title": "Dashboard Screen Patterns | Mobbin",
  "pageType": "explore-screens",
  "headings": ["Dashboard", "Trending screens"],
  "designImages": [
    {
      "src": "https://bytescale.mobbin.com/FW25bBB/image/...",
      "alt": "Airbnb",
      "size": "512x900"
    }
  ],
  "screenLinks": [
    { "href": "https://mobbin.com/explore/screens/abc-123-...", "text": "Dashboard" }
  ],
  "flowLinks": [
    { "href": "https://mobbin.com/explore/flows/def-456-...", "text": "Onboarding" }
  ],
  "appLinks": [
    { "href": "https://mobbin.com/apps/airbnb/v123/screens", "text": "Airbnb" }
  ],
  "categoryLinks": [
    { "href": "https://mobbin.com/explore/mobile/screens/home", "text": "Home" }
  ],
  "allLinksCount": 150,
  "allImagesCount": 45,
  "textPreview": "First 1000 chars of visible text..."
}
```

**Field details:**

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Current page URL |
| `title` | string | Page title |
| `pageType` | string | Classified page type (see [Page Types](../reference/page-types.md)) |
| `headings` | string[] | Up to 20 `h1`/`h2`/`h3` headings on the page |
| `designImages` | object[] | Up to 50 design-relevant images (>100px, from CDN domains) |
| `screenLinks` | object[] | Up to 30 links matching `/screens/{UUID}` pattern |
| `flowLinks` | object[] | Up to 30 links matching `/flows/{UUID}` pattern |
| `appLinks` | object[] | Up to 30 links matching `/apps/` pattern |
| `categoryLinks` | object[] | Up to 30 links matching `/explore/{platform}/{type}/{category}` pattern |
| `allLinksCount` | number | Total link count on page (before filtering) |
| `allImagesCount` | number | Total image count on page (before filtering) |
| `textPreview` | string | First 1000 characters of visible page text |

**Notes:**
- Waits up to 8 seconds for content (`img[src]` or `a[href]`) to appear before extracting
- `designImages` filters for images >100px from CDN domains: `bytescale`, `upcdn.io`, `mobbin`, `cdn`
- All images must be >30px to appear in raw image data (filters out icons/spacers)
- `screenLinks` matches both `/explore/screens/{UUID}` and `/screens/{UUID}` patterns
- Links are deduplicated by `href` — each URL appears only once
- Link text is truncated to 120 characters
- Use `mobbin_scroll` first to load more content via infinite scroll, then extract
