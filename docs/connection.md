# Connection Guide

MCP server setup, browser lifecycle, session persistence, and direct script usage.

---

## MCP Connection

| Property | Value |
|----------|-------|
| Protocol | MCP (Model Context Protocol) over stdio |
| Transport | stdin/stdout JSON-RPC 2.0 |
| Server | `node mobbin-agent/dist/index.js` |
| Server name | `mobbin-agent` |
| Server version | `1.0.0` |
| Capabilities | `tools` |

---

## Configuration

### Claude Code (project-level)

Add to `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "mobbin": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/absolute/path/to/mobbin-agent"
    }
  }
}
```

### Claude Code (global)

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "mobbin": {
      "command": "node",
      "args": ["/absolute/path/to/mobbin-agent/dist/index.js"]
    }
  }
}
```

### Build Before First Use

```bash
cd mobbin-agent
npm install
npx playwright install chromium
npm run build
```

---

## Browser Lifecycle

```
mobbin_connect          →  Launch Chromium + restore session
    ↓
[all other tools]       →  Operate on single browser instance
    ↓
mobbin_disconnect       →  Save session cookies + close browser
```

1. **Launch** — `mobbin_connect` starts a Chromium instance via Playwright. If `data/session/storage-state.json` exists, cookies and localStorage are restored automatically.
2. **Operate** — all 8 remaining tools (navigate, screenshot, extract, click, type, scroll, download, login) operate on the single browser page. Only one page is active at a time.
3. **Close** — `mobbin_disconnect` saves the current session state to disk and closes the browser. The session can be restored on the next `mobbin_connect` call.

> **Note**: The server handles graceful shutdown on SIGINT/SIGTERM — the browser is closed and the process exits cleanly.

---

## First-time Login

The first time you use the server, there is no saved session. You must authenticate manually in a visible browser window.

### Via MCP tools

```
Step 1: mobbin_connect({ headless: false })     — launches visible browser
Step 2: mobbin_login()                          — opens mobbin.com/login
Step 3: Complete login manually in browser      — you have 5 minutes
Step 4: Session saved automatically             — subsequent connects restore it
```

### Via standalone script

```bash
cd mobbin-agent
node -e "
import('./dist/browser.js').then(async ({ BrowserManager }) => {
  const { MobbinNavigator } = await import('./dist/mobbin.js');
  const browser = new BrowserManager();
  await browser.launch({ headless: false });
  const mobbin = new MobbinNavigator(browser);
  const result = await mobbin.login();
  console.log(result);
  await browser.close();
  process.exit(0);
});
"
```

### Login detection

The server polls every 2s and detects login success when the URL changes to one of:
- `/explore`
- `/browse`
- `/discover`
- `/collections`

After detection, it waits 3s for the page to settle, then saves the session.

---

## Session Persistence

| Property | Value |
|----------|-------|
| Storage path | `data/session/storage-state.json` |
| Contents | Cookies + localStorage from Mobbin |
| Auto-restored on | `mobbin_connect` (if file exists) |
| Auto-saved on | `mobbin_disconnect`, `mobbin_login`, graceful shutdown |
| Expiry | ~24–48 hours (Mobbin server-side) |
| Re-login trigger | Redirected to `/login` during navigation |

The session file is a Playwright `storageState` JSON containing all cookies and localStorage entries. It is created automatically — no manual setup required.

### Session expired?

If you are redirected to the login page during a session:

```
Step 1: mobbin_disconnect()                     — close current browser
Step 2: mobbin_connect({ headless: false })      — relaunch visible
Step 3: mobbin_login()                          — re-authenticate
Step 4: mobbin_disconnect()                     — save new session
Step 5: mobbin_connect()                        — continue headless
```

---

## Direct Script Usage

Scripts can bypass MCP and import the TypeScript modules directly after building. This is useful for batch collection tasks.

```javascript
import { BrowserManager } from './dist/browser.js';
import { MobbinNavigator } from './dist/mobbin.js';

const browser = new BrowserManager();
await browser.launch({ headless: true });

try {
  // Navigate
  await browser.navigate('https://mobbin.com/explore/mobile/screens/dashboard');

  // Get page reference for direct Playwright access
  const page = await browser.getPage();
  await page.keyboard.press('Escape');

  // Extract data
  const mobbin = new MobbinNavigator(browser);
  const data = await mobbin.extract();
  console.log(data.designImages.length, 'design images found');

  // Download
  for (const img of data.designImages) {
    const fullRes = img.src.split('?')[0] + '?f=png&w=1920&q=100';
    await browser.downloadImage(fullRes);
    await new Promise(r => setTimeout(r, 500));
  }
} finally {
  await browser.close();
}
```

### Available classes

| Class | Import | Purpose |
|-------|--------|---------|
| `BrowserManager` | `./dist/browser.js` | Browser launch, navigate, screenshot, click, type, scroll, download |
| `MobbinNavigator` | `./dist/mobbin.js` | Login flow, page extraction, page classification |

### Exported constants

| Export | Import | Value |
|--------|--------|-------|
| `MOBBIN_URLS` | `./dist/mobbin.js` | URL builders for all Mobbin page types |
| `SCREEN_CATEGORIES` | `./dist/mobbin.js` | 20 known screen category slugs |
| `FLOW_CATEGORIES` | `./dist/mobbin.js` | 12 known flow category slugs |

See `gather.mjs` in the project root for a complete batch collection example.

---

## Anti-Detection Measures

Built into the browser launch configuration. No user action required.

| Measure | Value |
|---------|-------|
| User agent | Chrome 131 on macOS Sonoma |
| Automation flag | `--disable-blink-features=AutomationControlled` |
| Device scale | 2x (Retina) |
| Viewport | 1440 × 900 |
| Locale | `en-US` |
| Timezone | `America/New_York` |
| Action delay | 800ms between user interactions |
| HTTPS errors | Ignored |

---

**[API Reference](INDEX.md)** | **[Operational Guide](OPERATIONAL-GUIDE.md)** | **[URL Patterns](reference/url-patterns.md)**
