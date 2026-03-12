# Mobbin Agent API

MCP-based browser automation for Mobbin design research. **10 tools** across 5 categories.

**[Connection Guide](connection.md)** | **[Operational Guide](OPERATIONAL-GUIDE.md)** | **[URL Patterns](reference/url-patterns.md)** | **[Page Types](reference/page-types.md)**

---

## Tools by Category

### Lifecycle (3)

| Tool | Description |
|------|-------------|
| [`mobbin_connect`](tools/01-lifecycle.md#mobbin_connect) | Launch browser and restore saved session |
| [`mobbin_login`](tools/01-lifecycle.md#mobbin_login) | Navigate to login page for manual authentication |
| [`mobbin_disconnect`](tools/01-lifecycle.md#mobbin_disconnect) | Save session and close browser |

### Navigation (2)

| Tool | Description |
|------|-------------|
| [`mobbin_navigate`](tools/02-navigation.md#mobbin_navigate) | Go to any Mobbin URL, wait for load |
| [`mobbin_scroll`](tools/02-navigation.md#mobbin_scroll) | Scroll page to load more content (infinite scroll) |

### Interaction (2)

| Tool | Description |
|------|-------------|
| [`mobbin_click`](tools/03-interaction.md#mobbin_click) | Click element by text, CSS selector, or coordinates |
| [`mobbin_type`](tools/03-interaction.md#mobbin_type) | Type text into input field |

### Perception (2)

| Tool | Description |
|------|-------------|
| [`mobbin_screenshot`](tools/04-perception.md#mobbin_screenshot) | Take viewport screenshot (returns PNG image) |
| [`mobbin_extract`](tools/04-perception.md#mobbin_extract) | Extract structured data from current page |

### Collection (1)

| Tool | Description |
|------|-------------|
| [`mobbin_download`](tools/05-collection.md#mobbin_download) | Download screen images by URL to local filesystem |

---

## Quick Lookup

| Need to... | Use |
|------------|-----|
| Start a session | [`mobbin_connect`](tools/01-lifecycle.md#mobbin_connect) |
| Authenticate | [`mobbin_login`](tools/01-lifecycle.md#mobbin_login) |
| Open a page | [`mobbin_navigate`](tools/02-navigation.md#mobbin_navigate) |
| See the page | [`mobbin_screenshot`](tools/04-perception.md#mobbin_screenshot) |
| Get page data | [`mobbin_extract`](tools/04-perception.md#mobbin_extract) |
| Load more results | [`mobbin_scroll`](tools/02-navigation.md#mobbin_scroll) |
| Dismiss a popup | [`mobbin_click`](tools/03-interaction.md#mobbin_click) |
| Search for screens | [`mobbin_type`](tools/03-interaction.md#mobbin_type) |
| Save images locally | [`mobbin_download`](tools/05-collection.md#mobbin_download) |
| End session | [`mobbin_disconnect`](tools/01-lifecycle.md#mobbin_disconnect) |

---

## Summary

| Category | Count |
|----------|-------|
| Lifecycle | 3 |
| Navigation | 2 |
| Interaction | 2 |
| Perception | 2 |
| Collection | 1 |
| **Total** | **10** |
