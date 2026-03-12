# Interaction

User input simulation — click elements and type text.

---

## `mobbin_click`

Click on an element in the current page.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | No | Click element containing this text |
| `selector` | string | No | CSS selector of the element to click |
| `x` | number | No | X coordinate to click at |
| `y` | number | No | Y coordinate to click at |

Provide **one** of: `text`, `selector`, or `x`+`y`.

**Returns:** Text describing what was clicked.

| Input | Response |
|-------|----------|
| `text` | `"Clicked element with text \"{text}\"."` |
| `selector` | `"Clicked element matching \"{selector}\"."` |
| `x` + `y` | `"Clicked at coordinates ({x}, {y})."` |

**Notes:**
- `text` uses Playwright's `getByText()` with inexact matching (finds partial matches)
- `selector` and `text` clicks have a 10-second timeout
- An 800ms delay is added after every click (anti-detection)
- Throws error if none of `text`, `selector`, or `x`+`y` are provided

**Common uses:**

```json
// Dismiss promotional modal
{ "text": "×" }

// Click a filter chip
{ "text": "Dashboard" }

// Click by CSS selector
{ "selector": "button[data-testid='close']" }

// Click at specific coordinates
{ "x": 720, "y": 450 }
```

---

## `mobbin_type`

Type text into an input field.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | — | Text to type |
| `selector` | string | No | — | CSS selector of target input (types into focused element if omitted) |
| `pressEnter` | boolean | No | `false` | Press Enter after typing |
| `clear` | boolean | No | `false` | Clear the field before typing |

**Returns:** Text — `"Typed \"{text}\""` with optional `" and pressed Enter"` suffix.

**Notes:**
- With `selector`: uses Playwright's `fill()` method (instant, 10s timeout)
- Without `selector`: uses keyboard `type()` with 50ms delay per character (simulates real typing)
- `clear` without selector: sends `Cmd+A` then `Backspace` to clear focused input
- `clear` with selector: fills with empty string first, then fills with text
- An 800ms delay is added after typing (anti-detection)

**Example — search for an app:**

```json
{
  "text": "airbnb",
  "selector": "input[type='search']",
  "pressEnter": true,
  "clear": true
}
```
