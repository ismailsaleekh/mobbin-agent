# Collection

Image downloading — save design screens to local filesystem.

---

## `mobbin_download`

Download one or more images by URL to the local filesystem.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `urls` | string[] | Yes | — | Array of image URLs to download |
| `prefix` | string | No | — | Filename prefix (e.g., `"airbnb-onboarding"`) |

**Returns:** Text summary — download count, file paths, any errors.

**Example response:**

```
Downloaded 12/12 images.

Saved to:
  /path/to/mobbin-agent/data/downloads/airbnb-onboarding_1.png
  /path/to/mobbin-agent/data/downloads/airbnb-onboarding_2.png
  ...
```

**Notes:**
- Saves to `mobbin-agent/data/downloads/`
- 500ms delay between downloads (rate limiting)
- If `prefix` provided, files named `{prefix}_1.png`, `{prefix}_2.png`, etc.
- Without prefix, filename derived from URL path (last path segment, sanitized, max 80 chars)
- Fallback filename: `mobbin_{timestamp}.png` if URL parsing fails
- Downloads continue even if individual URLs fail — errors are reported per-URL
- Uses Node.js `fetch` API (not browser context) — CDN URLs must be publicly accessible

**For full resolution images:** modify CDN URLs before passing:

```javascript
// Thumbnail (default from extract)
"https://bytescale.mobbin.com/.../screen.png?f=webp&w=512&q=85"

// Full resolution — strip params and replace
"https://bytescale.mobbin.com/.../screen.png?f=png&w=1920&q=100"

// Pattern: split on '?' and append full-res params
url.split('?')[0] + '?f=png&w=1920&q=100'
```

**Example — download with prefix:**

```json
{
  "urls": [
    "https://bytescale.mobbin.com/.../screen1.png?f=png&w=1920&q=100",
    "https://bytescale.mobbin.com/.../screen2.png?f=png&w=1920&q=100"
  ],
  "prefix": "dashboard-screens"
}
```
