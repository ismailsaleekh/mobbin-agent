# Troubleshooting

Known issues and solutions for the Mobbin Agent MCP server.

---

## Quick Reference

| Issue | Cause | Fix |
|-------|-------|-----|
| `"Browser not connected"` error | Forgot to connect | Call `mobbin_connect` before any other tool |
| Redirected to login page | Session expired | Call `mobbin_login` again (sessions last ~24-48 hours) |
| Empty extract results | Page still loading | Wait 2 seconds or scroll first, then call `mobbin_extract` |
| Missing screen images | Lazy loading | Scroll down to trigger image loading before extracting |
| Promotional modal blocks content | Mobbin popup | `mobbin_click({ text: "×" })` or press Escape after navigation |
| Download returns HTTP 403 | CDN auth or rate limit | Download within same browser session; check URL is valid |
| Infinite scroll not loading | Scroll too small or too fast | Use 1500px scroll amount with 2.5s delay between scrolls |
| Duplicate screens in results | Same app in multiple categories | Deduplicate by screen URL (`/screens/{UUID}`) |
| Low-resolution images | Using default CDN params | Append `?f=png&w=1920&q=100` to CDN URLs (default thumbnails are 512px webp) |
| Login times out | 5-minute window elapsed | Retry `mobbin_login` — ensure browser is non-headless and visible |
| Click does nothing | Wrong text or selector | Try `mobbin_screenshot` to see current page state; use different selector |
| Type not working | No focused input | Provide `selector` parameter to target the specific input field |

---

## Detailed Solutions

### Session Management

**Problem:** Tools return errors or Mobbin redirects to login page.

**Solution:**
1. Always start with `mobbin_connect` — this is required before any other tool
2. If session exists, it will be restored automatically
3. If redirected to login, call `mobbin_login` (browser must be non-headless)
4. Sessions last approximately 24-48 hours before expiring

### Popup Dismissal

**Problem:** Mobbin shows promotional modals that block page content after navigation.

**Solution:**
```
Step 1: mobbin_navigate({ url: "..." })
Step 2: mobbin_click({ text: "×" })      // or press Escape
Step 3: Proceed with extract/screenshot
```

This should be done after every `mobbin_navigate` call, as popups appear frequently.

### Infinite Scroll Collection

**Problem:** Only a few screens appear when extracting from listing pages.

**Solution:**
```
Repeat 8 times:
  1. mobbin_extract()          // collect current visible data
  2. mobbin_scroll({ direction: "down", amount: 1500 })
  3. Wait 2.5 seconds         // allow content to load
```

Key parameters:
- Scroll amount: `1500` pixels (enough to trigger lazy loading)
- Delay: `2500`ms between scrolls (Mobbin needs time to fetch new content)
- Wait for network idle fires automatically after scroll (8s timeout)

### Image Resolution

**Problem:** Downloaded images are low quality (512px webp thumbnails).

**Solution:** Transform CDN URLs before downloading:

```javascript
// Extract gives you thumbnail URLs like:
// https://bytescale.mobbin.com/.../screen.png?f=webp&w=512&q=85

// Convert to full resolution:
const fullRes = thumbnailUrl.split('?')[0] + '?f=png&w=1920&q=100';

// Then download:
mobbin_download({ urls: [fullRes], prefix: "screen-name" })
```

### Connection Errors

**Problem:** `"Browser not connected. Call mobbin_connect first."` error.

**Causes:**
- Never called `mobbin_connect` at start of session
- Browser crashed or was closed externally
- Previous `mobbin_disconnect` was called

**Solution:** Call `mobbin_connect` to launch a new browser instance. If a session file exists, it will be restored automatically.
