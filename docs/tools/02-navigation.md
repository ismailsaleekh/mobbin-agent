# Navigation

Page navigation and scrolling — go to URLs and load more content.

---

## `mobbin_navigate`

Navigate to a Mobbin URL and wait for the page to load.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | Full Mobbin URL to navigate to |

**Returns:** Text — `"Navigated to: {url}\nTitle: {title}"`

**Notes:**
- Waits for `domcontentloaded` event + network idle (8s timeout)
- Network idle timeout is non-blocking — navigation succeeds even if it fires late (common on SPAs)
- After navigation, dismiss popups with `mobbin_click({ text: "×" })` or Escape
- See [URL Patterns](../reference/url-patterns.md) for constructing URLs
- See [Page Types](../reference/page-types.md) for understanding what page you landed on

**Example:**

```json
{
  "url": "https://mobbin.com/explore/mobile/screens/dashboard"
}
```

---

## `mobbin_scroll`

Scroll the current page up or down. Essential for loading more content on Mobbin's infinite scroll pages.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `direction` | `"down"` \| `"up"` | No | `"down"` | Scroll direction |
| `amount` | number | No | `800` | Pixels to scroll |

**Returns:** Text — `"Scrolled {direction} {amount}px. Position: {y}/{maxY}px."`

**Notes:**
- Use `1500`px amount + 2.5s delay between scrolls for Mobbin infinite scroll
- Returns current scroll position (`y`) and maximum scroll height (`maxY`)
- Waits for network idle (8s timeout) after each scroll to allow content loading
- New content loads asynchronously after scroll — wait before calling `mobbin_extract`

**Example — infinite scroll collection loop:**

```javascript
for (let i = 0; i < 8; i++) {
  // Extract current page data
  mobbin_extract()
  // Scroll to load more
  mobbin_scroll({ direction: "down", amount: 1500 })
  // Wait for content to load
  await new Promise(r => setTimeout(r, 2500))
}
```
