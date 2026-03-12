# Lifecycle

Browser session management — launch, authenticate, and close.

---

## `mobbin_connect`

Launch a browser and connect to Mobbin. Restores saved session if available.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `headless` | boolean | No | `true` | Run browser in headless mode. Set `false` for interactive login. |

**Returns:** Text status message.

| Scenario | Response |
|----------|----------|
| Session exists | `"Browser launched with restored session."` |
| No session | `"Browser launched (no saved session — run mobbin_login to authenticate)."` |
| Already running | `"Browser already running."` |

**Notes:**
- Restores session from `data/session/storage-state.json` if the file exists
- If no session is saved, returns a message to run `mobbin_login`
- Only one browser instance runs at a time — calling again returns "already running"
- Browser launches with anti-detection measures (realistic user agent, disabled automation flags, 2x device scale)

---

## `mobbin_login`

Navigate to the Mobbin login page and wait for the user to authenticate manually.

**Parameters:** None.

**Returns:** Text — login result.

| Scenario | Response |
|----------|----------|
| Success | `"Login successful. Session saved. Current URL: {url}"` |
| Timeout | `"Login timed out after 5 minutes. Please try again."` |

**Notes:**
- Browser MUST be launched non-headless (`mobbin_connect` with `headless: false`)
- Opens `https://mobbin.com/login` in the browser window
- Waits up to 5 minutes for user to authenticate manually
- Polls every 2 seconds for URL change
- Detects login success when URL changes to `/explore`, `/browse`, `/discover`, or `/collections`
- Settles for 3 seconds after detection before saving session
- Saves session to `data/session/storage-state.json`

---

## `mobbin_disconnect`

Close the browser and save the current session for future restoration.

**Parameters:** None.

**Returns:** Text — `"Browser closed and session saved."`

**Notes:**
- Saves current session cookies and localStorage before closing
- Safe to call even if browser is not running (graceful cleanup)
- Session can be restored on the next `mobbin_connect` call
