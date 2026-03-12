# Mobbin Agent — Documentation Blueprint

Complete specification for creating the mobbin-agent documentation system. This file contains ALL context needed to implement every documentation file. Follow the structure exactly.

---

## Documentation Architecture

Mirror the figma-mcp-extended pattern: 3-layer hierarchy (entry → reference → detail).

```
mobbin-agent/
├── MOBBIN-INSTRUCTIONS.md              # Layer 1: Mandatory entry point
├── docs/
│   ├── INDEX.md                        # Layer 2: Master tool reference table
│   ├── OPERATIONAL-GUIDE.md            # Layer 2: Workflows, recipes, patterns
│   ├── connection.md                   # Layer 2: MCP setup + browser lifecycle
│   ├── tools/                          # Layer 3: Detailed tool docs
│   │   ├── 01-lifecycle.md             # connect, login, disconnect
│   │   ├── 02-navigation.md            # navigate, scroll
│   │   ├── 03-interaction.md           # click, type
│   │   ├── 04-perception.md            # screenshot, extract
│   │   └── 05-collection.md            # download
│   ├── reference/
│   │   ├── url-patterns.md             # Mobbin URL structure + filter catalog
│   │   └── page-types.md              # Page type classification
│   └── troubleshooting/
│       └── README.md                   # Known issues + solutions
```

**Agent navigation flow:**
1. Read `MOBBIN-INSTRUCTIONS.md` for rules
2. Check `docs/INDEX.md` to find the right tool
3. Jump to `docs/tools/NN-category.md` for parameters + examples
4. Consult `docs/reference/` for URL patterns and page types
5. Check `docs/troubleshooting/` for known issues

---

## Step-by-Step Implementation

### Step 1: Create `MOBBIN-INSTRUCTIONS.md`

**Location**: `mobbin-agent/MOBBIN-INSTRUCTIONS.md`
**Format**: Match `figma-mcp-extended/FIGMA-INSTRUCTIONS.md` exactly — short, mandatory, links to deeper docs.

**Content to include:**

```markdown
# Mobbin Agent Instructions

**Mandatory documentation for all Mobbin browsing tasks.**

---

## Required Reading

1. **[Operational Guide](docs/OPERATIONAL-GUIDE.md)** - Follow strictly
   - Browser session management
   - Collection workflows
   - Rate limiting rules

2. **[Tool Reference](docs/INDEX.md)** - All 10 MCP tools
   - Parameters and response formats
   - URL patterns for navigation

---

## Key Rules

- **MCP tools only** — connect via `mobbin_connect`, never launch browser manually
- **Session first** — always `mobbin_connect` before any other tool
- **Rate limit** — 500ms between downloads, 800ms between page actions
- **Escape popups** — after navigation, click Escape or use `mobbin_click` to dismiss modals
- **Full resolution images** — append `?f=png&w=1920&q=100` to CDN URLs
- **Scripts go in** `mobbin-agent/scripts/`
```

---

### Step 2: Create `docs/INDEX.md`

**Location**: `mobbin-agent/docs/INDEX.md`
**Format**: Match `figma-mcp-extended/docs/INDEX.md` — master table with links to detail files.

**Content to include:**

```markdown
# Mobbin Agent API

MCP-based browser automation for Mobbin design research. **10 tools** across 5 categories.

**[Connection Guide](connection.md)** | **[URL Patterns](reference/url-patterns.md)** | **[Page Types](reference/page-types.md)**

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
| [`mobbin_navigate`](tools/02-navigation.md#mobbin_navigate) | Go to any Mobbin URL |
| [`mobbin_scroll`](tools/02-navigation.md#mobbin_scroll) | Scroll page to load more content (infinite scroll) |

### Interaction (2)

| Tool | Description |
|------|-------------|
| [`mobbin_click`](tools/03-interaction.md#mobbin_click) | Click element by text, selector, or coordinates |
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

## Summary

| Category | Count |
|----------|-------|
| Lifecycle | 3 |
| Navigation | 2 |
| Interaction | 2 |
| Perception | 2 |
| Collection | 1 |
| **Total** | **10** |
```

---

### Step 3: Create `docs/OPERATIONAL-GUIDE.md`

**Location**: `mobbin-agent/docs/OPERATIONAL-GUIDE.md`
**Format**: Match `figma-mcp-extended/docs/OPERATIONAL-GUIDE.md` — rules, templates, workflows.

**Content to include:**

#### Section: Rules
1. **Session first** — always `mobbin_connect` before any tool
2. **Dismiss popups** — Mobbin shows promotional modals; press Escape after navigation
3. **Rate limit** — 500ms between image downloads, 2.5s between scroll actions
4. **Full resolution** — strip CDN query params or use `?f=png&w=1920&q=100`
5. **Deduplication** — same app may appear multiple times; deduplicate by screen URL
6. **Session expiry** — if redirected to login, call `mobbin_login` again

#### Section: Collection Workflow Template

```
Step 1: mobbin_connect()
Step 2: mobbin_navigate({ url: search/category URL })
Step 3: mobbin_click({ text: "×" }) or keyboard Escape — dismiss popup
Step 4: Loop 8 times:
          mobbin_extract() → collect screen image URLs
          mobbin_scroll({ direction: "down", amount: 1500 })
          wait 2.5s
Step 5: mobbin_download({ urls: collected_urls, prefix: "category-name" })
Step 6: mobbin_disconnect()
```

#### Section: Script Template

```javascript
import fs from 'fs';
import path from 'path';

const { BrowserManager } = await import('./dist/browser.js');
const { MobbinNavigator } = await import('./dist/mobbin.js');

const browser = new BrowserManager();
await browser.launch({ headless: true });

try {
  const url = 'https://mobbin.com/search/apps/ios?content_type=screens&sort=trending&filter=screenPatterns.Dashboard';
  await browser.navigate(url);

  const page = await browser.getPage();
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 2000));

  // Collect screens
  const allItems = [];
  const seen = new Set();

  for (let scroll = 0; scroll < 8; scroll++) {
    const items = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/screens/"]'))
        .filter(a => a.href.match(/\/screens\/[a-f0-9-]{20,}/))
        .map(a => {
          const img = a.querySelector('img[src*="bytescale"]');
          return {
            screenUrl: a.href,
            imgSrc: img?.src || '',
            alt: img?.alt || ''
          };
        })
        .filter(item => item.imgSrc.length > 0);
    });

    for (const item of items) {
      if (!seen.has(item.screenUrl)) {
        seen.add(item.screenUrl);
        allItems.push(item);
      }
    }

    await browser.scroll({ direction: 'down', amount: 1500 });
    await new Promise(r => setTimeout(r, 2500));
  }

  // Download at full resolution
  const outDir = 'data/downloads/category-name';
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < allItems.length; i++) {
    const fullRes = allItems[i].imgSrc.split('?')[0] + '?f=png&w=1920&q=100';
    try {
      const resp = await fetch(fullRes);
      const buf = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(path.join(outDir, `screen-${i + 1}.png`), buf);
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`Done. ${allItems.length} screens collected.`);
} finally {
  await browser.close();
}
```

#### Section: Timeouts

| Action | Duration |
|--------|----------|
| Page navigation | 30s (built-in) |
| Network idle settle | 8s (built-in) |
| Click/type action delay | 800ms (built-in) |
| Scroll settle | 8s (built-in) |
| Between downloads | 500ms (recommended) |
| Between scrolls | 2.5s (recommended) |
| Login timeout | 5 minutes |

#### Section: Troubleshooting Quick Reference

| Issue | Cause | Fix |
|-------|-------|-----|
| "Browser not connected" | Forgot to connect | Call `mobbin_connect` first |
| Redirected to login | Session expired | Call `mobbin_login` again |
| Empty extract results | Page still loading | Wait or scroll first, then extract |
| Missing screen images | Lazy loading | Scroll down to trigger image loading |
| Promotional modal blocks content | Mobbin popup | `mobbin_click({ text: "×" })` or Escape |
| Download returns HTTP 403 | CDN auth required | Download within same browser session |

---

### Step 4: Create `docs/connection.md`

**Location**: `mobbin-agent/docs/connection.md`
**Format**: Match `figma-mcp-extended/docs/connection.md` — protocol details.

**Content to include:**

#### MCP Connection
- Protocol: MCP (Model Context Protocol) over stdio
- Server: `node mobbin-agent/dist/index.js`
- Transport: stdio (stdin/stdout JSON-RPC 2.0)

#### Configuration (Claude Code)
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

#### Browser Lifecycle
1. `mobbin_connect` → launches Chromium, restores session from `data/session/storage-state.json`
2. All tools operate on the single browser instance
3. `mobbin_disconnect` → saves session cookies, closes browser

#### First-time Login (Manual)
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

#### Direct Script Usage (bypassing MCP)
Scripts can import browser.ts and mobbin.ts directly:
```javascript
const { BrowserManager } = await import('./dist/browser.js');
const { MobbinNavigator } = await import('./dist/mobbin.js');

const browser = new BrowserManager();
await browser.launch({ headless: true });
// ... use browser methods directly ...
await browser.close();
```

#### Session Persistence
- Saved to: `data/session/storage-state.json`
- Contains: cookies + localStorage from Mobbin
- Auto-restored on `mobbin_connect`
- Auto-saved on `mobbin_disconnect` and `mobbin_login`
- Expiry: Mobbin sessions last ~24-48 hours; re-login when redirected

#### Anti-Detection Measures (built-in)
- Realistic user agent (Chrome 131 on macOS)
- `--disable-blink-features=AutomationControlled`
- Device scale factor 2x (Retina)
- 800ms delay between user actions
- Locale: en-US, timezone: America/New_York

---

### Step 5: Create `docs/tools/01-lifecycle.md`

**Format**: Match `figma-mcp-extended/docs/commands/01-document-pages.md` — each tool is a `##` heading with Parameters table, Returns, Notes, Example.

**Tools to document:**

#### `mobbin_connect`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `headless` | boolean | No | `true` | Run headless. Set `false` for interactive login. |

**Returns:** Text status message.

**Notes:**
- Restores session from `data/session/storage-state.json` if exists
- If no session saved, returns message to run `mobbin_login`
- If browser already running, returns "already running"

---

#### `mobbin_login`

**Parameters:** None

**Returns:** Text — "Login successful. Session saved." or timeout message.

**Notes:**
- Browser MUST be launched non-headless (`mobbin_connect` with `headless: false`)
- Opens `https://mobbin.com/login` in browser window
- Waits up to 5 minutes for user to authenticate manually
- Detects login success by URL change to `/explore`, `/browse`, `/discover`, or `/collections`
- Saves session to `data/session/storage-state.json`

---

#### `mobbin_disconnect`

**Parameters:** None

**Returns:** Text — "Browser closed and session saved."

**Notes:**
- Saves current session before closing
- Safe to call even if browser not running

---

### Step 6: Create `docs/tools/02-navigation.md`

#### `mobbin_navigate`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Full Mobbin URL to navigate to |

**Returns:** Text — "Navigated to: {url}\nTitle: {title}"

**Notes:**
- Waits for `domcontentloaded` + network idle (8s timeout)
- See [URL Patterns](../reference/url-patterns.md) for constructing URLs
- After navigation, dismiss popups with `mobbin_click({ text: "×" })`

---

#### `mobbin_scroll`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `direction` | "down" \| "up" | No | "down" | Scroll direction |
| `amount` | number | No | 800 | Pixels to scroll |

**Returns:** Text — "Scrolled down 800px. Position: 1600/4800px."

**Notes:**
- Use 1500px amount + 2.5s delay for Mobbin infinite scroll
- Returns current scroll position and maximum scroll height
- New content loads asynchronously after scroll — wait before extracting

---

### Step 7: Create `docs/tools/03-interaction.md`

#### `mobbin_click`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | No | Click element containing this text |
| `selector` | string | No | CSS selector to click |
| `x` | number | No | X coordinate |
| `y` | number | No | Y coordinate |

Provide ONE of: `text`, `selector`, or `x`+`y`.

**Returns:** Text describing what was clicked.

---

#### `mobbin_type`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | — | Text to type |
| `selector` | string | No | — | CSS selector of target input |
| `pressEnter` | boolean | No | false | Press Enter after typing |
| `clear` | boolean | No | false | Clear field before typing |

**Returns:** Text confirming action.

---

### Step 8: Create `docs/tools/04-perception.md`

#### `mobbin_screenshot`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fullPage` | boolean | No | false | Capture full scrollable page |

**Returns:** PNG image (base64-encoded via MCP image content type).

**Notes:**
- Viewport: 1440×900 at 2x scale (2880×1800 actual pixels)
- Use for visual inspection when `mobbin_extract` isn't enough

---

#### `mobbin_extract`

**Parameters:** None

**Returns:** JSON with:
```json
{
  "url": "https://mobbin.com/...",
  "title": "Page Title",
  "pageType": "explore-screens",
  "headings": ["..."],
  "designImages": [
    { "src": "https://bytescale.mobbin.com/...", "alt": "App Name", "size": "512x900" }
  ],
  "screenLinks": [{ "href": "/screens/UUID", "text": "Screen Name" }],
  "flowLinks": [{ "href": "/flows/UUID", "text": "Flow Name" }],
  "appLinks": [{ "href": "/apps/slug/version", "text": "App Name" }],
  "categoryLinks": [{ "href": "/explore/mobile/screens/home", "text": "Home" }],
  "allLinksCount": 150,
  "allImagesCount": 45,
  "textPreview": "First 1000 chars of visible text..."
}
```

**Notes:**
- Waits up to 8s for content to load before extracting
- `designImages` filters for images >100px from CDN domains (bytescale, upcdn.io, mobbin)
- `screenLinks` matches `/screens/{UUID}` pattern
- Links are deduplicated by href
- Returns up to 50 design images, 30 screen/flow/app/category links

---

### Step 9: Create `docs/tools/05-collection.md`

#### `mobbin_download`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | string[] | Yes | Array of image URLs to download |
| `prefix` | string | No | Filename prefix (e.g., "airbnb-onboarding") |

**Returns:** Text summary — download count, file paths, any errors.

**Notes:**
- Saves to `mobbin-agent/data/downloads/`
- 500ms delay between downloads (rate limiting)
- If `prefix` provided, files named `{prefix}_1.png`, `{prefix}_2.png`, etc.
- Without prefix, filename derived from URL path
- For full resolution: modify CDN URL to `?f=png&w=1920&q=100` before passing

---

### Step 10: Create `docs/reference/url-patterns.md`

**This is critical — contains real-world validated URL patterns from guide.md.**

**Content to include:**

#### Search URL Template
```
https://mobbin.com/search/apps/ios?content_type={type}&sort={sort}&filter={filterKey}.{filterValue}
```

| Parameter | Values |
|-----------|--------|
| `content_type` | `screens`, `flows`, `ui-elements`, `apps` |
| `sort` | `trending`, `mostPopular` |
| `filter` | `screenPatterns.{name}`, `screenElements.{name}`, `flowActions.{name}`, `appCategories.{name}` |

#### Example URLs
```
# Dashboard screens, trending
https://mobbin.com/search/apps/ios?content_type=screens&sort=trending&filter=screenPatterns.Dashboard

# Onboarding flows
https://mobbin.com/search/apps/ios?content_type=flows&sort=trending&filter=flowActions.Onboarding

# Button UI elements
https://mobbin.com/search/apps/ios?content_type=ui-elements&sort=trending&filter=screenElements.Button
```

#### URL Encoding
Filter values with spaces use `+` encoding: `My+Account+%26+Profile`, `Cart+%26+Bag`.

#### Screen Detail URL
```
https://mobbin.com/screens/{UUID}
```

#### Image CDN URLs
```
# Thumbnail (listing page)
https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/{UUID}.png?f=webp&w=512&q=85

# Full resolution
https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/{UUID}.png?f=png&w=1920&q=100
```

#### DOM Selectors for Extraction
- Screen links: `a[href*="/screens/"]` filtered by regex `/\/screens\/[a-f0-9-]{20,}/`
- Screen images: `img[src*="bytescale"]` within those links

#### Complete Screen Patterns Catalog

**New User Experience:**
`Account+Setup` · `Guided+Tour+%26+Tutorial` · `Splash+Screen` · `Signup` · `Verification` · `Welcome+%26+Get+Started`

**Account Management:**
`Delete+%26+Deactivate+Account` · `Forgot+Password` · `Login` · `My+Account+%26+Profile` · `Settings+%26+Preferences`

**Communication:**
`About` · `Acknowledgement+%26+Success` · `Action+Option` · `Confirmation` · `Empty+State` · `Error` · `Feature+Info` · `Feedback` · `Help+%26+Support` · `Loading` · `Permission` · `Privacy+Policy` · `Pull+to+Refresh` · `Suggestions+%26+Similar+Items` · `Terms+%26+Conditions`

**Commerce & Finance:**
`Billing` · `Cart+%26+Bag` · `Checkout` · `Order+Confirmation` · `Order+Detail` · `Order+History` · `Payment+Method` · `Pricing` · `Promotions+%26+Rewards` · `Shop+%26+Storefront` · `Subscription+%26+Paywall` · `Wallet+%26+Balance`

**Social:**
`Achievements+%26+Awards` · `Chat+Detail` · `Comments` · `Followers+%26+Following` · `Groups+%26+Community` · `Invite+Teammates` · `Leaderboard` · `Notifications` · `Reviews+%26+Ratings` · `Social+Feed` · `User+%2F+Group+Profile`

**Content:**
`Article+Detail` · `Augmented+Reality` · `Browse+%26+Discover` · `Class+%26+Lesson+Detail` · `Emails+%26+Messages` · `Event+Detail` · `Goal+%26+Task` · `Home` · `News+Feed` · `Note+Detail` · `Other+Content` · `Post+Detail` · `Product+Detail` · `Quiz` · `Recipe+Detail` · `Song+%26+Podcast+Detail` · `Stories` · `TV+Show+%26+Movie+Detail`

**Action:**
`Add+%26+Create` · `Ban+%26+Block` · `Cancel` · `Delete` · `Draw+%26+Annotate` · `Edit` · `Favorite+%26+Pin` · `Filter+%26+Sort` · `Flag+%26+Report` · `Follow+%26+Subscribe` · `Invite+%26+Refer+Friends` · `Like+%26+Upvote` · `Move` · `Other+Action` · `Reorder` · `Save` · `Search` · `Select` · `Set` · `Schedule` · `Share` · `Transfer+%26+Send+Money` · `Upload+%26+Download`

**Data:**
`Charts` · `Dashboard` · `Progress`

**My Stuff:**
`Bookmarks+%26+Collections` · `Downloads+%26+Available+Offline` · `History` · `Map` · `Media+Player` · `Calendar`

#### Complete Flow Actions Catalog
`Browsing+Tutorial` · `Chatting+%26+Sending+Messages` · `Creating+Account` · `Editing+Profile` · `Filtering+%26+Sorting` · `Logging+In` · `Onboarding` · `Subscribing+%26+Upgrading`

#### Complete UI Elements Catalog
`Banner` · `Bottom+Sheet` · `Button` · `Dropdown+Menu` · `Progress+Indicator` · `Stacked+List` · `Text+Field`

#### Sort Options

| Value | Description |
|-------|-------------|
| `trending` | Currently trending (default) |
| `mostPopular` | All-time most popular |

---

### Step 11: Create `docs/reference/page-types.md`

**Content to include:**

Page type classification used by `mobbin_extract`:

| Page Type | URL Pattern | Example |
|-----------|-------------|---------|
| `home` | `mobbin.com` (exact) | Homepage |
| `login` | Contains `/login` or `/signup` | Auth pages |
| `explore-screens` | `/explore/{mobile\|web}/screens` | Screen category listing |
| `explore-flows` | `/explore/{mobile\|web}/flows` | Flow category listing |
| `explore-ui-elements` | `/explore/{mobile\|web}/ui-elements` | UI element listing |
| `screen-detail` | `/explore/screens/{UUID}` or `/screens/{UUID}` | Individual screen |
| `flow-detail` | `/explore/flows/{UUID}` | Individual flow |
| `app-detail` | `/apps/` | App detail page |
| `browse` | `/browse/` | Browse listing |
| `search` | `/search` or `?q=` | Search results |
| `collection` | `/collections/` | Collection page |
| `unknown` | Anything else | Unclassified |

---

### Step 12: Create `docs/troubleshooting/README.md`

**Format**: Match `figma-mcp-extended/docs/troubleshooting/README.md`.

**Content to include:**

| Issue | Summary |
|-------|---------|
| Session expired | Re-run `mobbin_login`. Sessions last ~24-48 hours. |
| Promotional modal blocks content | Press Escape or `mobbin_click({ text: "×" })` after navigation |
| Empty extract results | Page still loading — add `await new Promise(r => setTimeout(r, 2000))` or scroll first |
| Download returns HTTP 403 | CDN may require authenticated session — download within same browser |
| Infinite scroll not loading | Use 1500px scroll amount with 2.5s delay between scrolls |
| Browser not connected error | Always call `mobbin_connect` before any other tool |
| Duplicate screens in results | Deduplicate by screen URL — same app appears in multiple categories |
| Low-resolution images | Append `?f=png&w=1920&q=100` to CDN URLs. Default thumbnails are 512px webp. |

---

## Source Code Reference

For implementing docs, these are the actual source files containing the tool implementations:

| File | Contains |
|------|----------|
| `src/browser.ts` | BrowserManager class — launch, navigate, screenshot, click, type, scroll, downloadImage, saveSession, close |
| `src/mobbin.ts` | MobbinNavigator class — login, extract, classifyPage. Also exports MOBBIN_URLS, SCREEN_CATEGORIES, FLOW_CATEGORIES |
| `src/tools.ts` | getToolDefinitions() — all 10 tool schemas. handleToolCall() — all 10 tool handlers |
| `src/index.ts` | MCP server setup — Server + StdioServerTransport, tool routing, graceful shutdown |

## Formatting Conventions (from figma-mcp-extended)

1. **File naming**: `NN-category-name.md` with numeric prefix
2. **Tool headings**: `## \`tool_name\`` (backtick-wrapped, level 2)
3. **Parameter tables**: `| Parameter | Type | Required | Default | Description |`
4. **Returns section**: `**Returns:**` followed by description or JSON code block
5. **Notes section**: `**Notes:**` with bullet points for gotchas
6. **Separators**: `---` between tool sections
7. **Cross-references**: `[Link Text](relative/path.md#heading)` format
8. **Code examples**: Fenced with language identifier (```javascript, ```json)
9. **Quick reference links**: Top of INDEX.md, linked inline

## Validation Checklist

After implementing all docs, verify:
- [ ] `MOBBIN-INSTRUCTIONS.md` links to `docs/OPERATIONAL-GUIDE.md` and `docs/INDEX.md`
- [ ] `docs/INDEX.md` links to all 5 tool files via `docs/tools/NN-*.md#tool_name`
- [ ] `docs/INDEX.md` links to `connection.md`, `reference/url-patterns.md`, `reference/page-types.md`
- [ ] Each tool in `docs/tools/*.md` has: Parameters table, Returns, Notes
- [ ] `docs/OPERATIONAL-GUIDE.md` has: Rules, Collection Workflow, Script Template, Timeouts, Troubleshooting
- [ ] `docs/reference/url-patterns.md` has: Search URL template, all filter catalogs, CDN URL format, DOM selectors
- [ ] `docs/troubleshooting/README.md` has: table of all known issues
- [ ] All relative links resolve correctly
- [ ] No broken cross-references
