# Mobbin Agent

MCP server that gives AI agents browser-based access to [Mobbin](https://mobbin.com) for design research, screen discovery, and screenshot collection.

```
Claude Code (AI reasoning + decisions)
    ↕ MCP Protocol (stdio)
Mobbin Agent (TypeScript MCP server)
    ↕ Playwright (browser automation)
Mobbin.com (authenticated session)
    ↕ Local filesystem
data/downloads/ (saved screenshots)
```

The AI agent decides what to browse, search, and download. The MCP server provides deterministic browser control tools. No extra LLM cost per browser action.

## Features

- **10 MCP tools** — lifecycle, navigation, interaction, perception, collection
- **Session persistence** — authenticate once, sessions auto-restore across runs
- **Structured extraction** — page data returned as classified JSON (screens, flows, apps, categories)
- **Full-resolution downloads** — batch download screen images at 1920px PNG quality
- **Anti-detection** — realistic user agent, disabled automation flags, human-like delays
- **Direct script access** — bypass MCP and import modules directly for batch tasks

## Requirements

- Node.js >= 18
- A [Mobbin](https://mobbin.com) account (free or paid)

## Setup

```bash
git clone git@github.com:ismailsaleekh/mobbin-agent.git
cd mobbin-agent
npm install
npx playwright install chromium
npm run build
```

### First-time authentication

Mobbin requires login. On first use, authenticate in a visible browser window — the session is saved automatically for future runs.

```bash
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

A Chromium window opens to `mobbin.com/login`. Log in manually — the server detects completion and saves cookies to `data/session/storage-state.json`. Sessions last ~24-48 hours.

## Usage with Claude Code

Add to your Claude Code MCP configuration:

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

Then ask Claude to browse Mobbin:

> "Find trending dashboard screen patterns on Mobbin and download the top 20 at full resolution"

> "Browse onboarding flows on Mobbin and extract the screen URLs for e-commerce apps"

## Tools

10 tools across 5 categories:

| Category | Tool | Description |
|----------|------|-------------|
| **Lifecycle** | `mobbin_connect` | Launch browser and restore saved session |
| | `mobbin_login` | Navigate to login page for manual authentication |
| | `mobbin_disconnect` | Save session and close browser |
| **Navigation** | `mobbin_navigate` | Go to any Mobbin URL, wait for load |
| | `mobbin_scroll` | Scroll page to load more content (infinite scroll) |
| **Interaction** | `mobbin_click` | Click element by text, CSS selector, or coordinates |
| | `mobbin_type` | Type text into input field |
| **Perception** | `mobbin_screenshot` | Take viewport screenshot (returns PNG) |
| | `mobbin_extract` | Extract structured data from current page |
| **Collection** | `mobbin_download` | Download screen images by URL to local filesystem |

See [Tool Reference](docs/INDEX.md) for parameters, return formats, and examples.

## Example: Batch collection script

`gather.mjs` collects screen images by pattern — bypasses MCP and imports modules directly:

```bash
# Collect trending dashboard screens
PATTERN=Dashboard node gather.mjs

# Collect most popular checkout screens with more scrolling
PATTERN=Checkout SORT=mostPopular MAX_SCROLLS=12 node gather.mjs
```

Images are saved to `data/downloads/{pattern}/` at full 1920px PNG resolution.

## Project structure

```
mobbin-agent/
├── src/
│   ├── index.ts          # MCP server entry point (stdio transport)
│   ├── browser.ts        # Playwright browser lifecycle and interactions
│   ├── mobbin.ts          # Mobbin domain logic (login, extract, classify)
│   └── tools.ts           # MCP tool definitions and handlers
├── docs/                  # Full documentation
│   ├── INDEX.md           # Tool reference (all 10 tools)
│   ├── OPERATIONAL-GUIDE.md  # Workflows, rules, recipes
│   ├── connection.md      # MCP setup, session, direct usage
│   ├── tools/             # Detailed tool docs (5 files)
│   ├── reference/         # URL patterns, page types
│   └── troubleshooting/   # Known issues and solutions
├── gather.mjs             # Batch collection example script
├── data/
│   ├── session/           # Saved browser session (gitignored)
│   └── downloads/         # Downloaded images (gitignored)
├── MOBBIN-INSTRUCTIONS.md # Mandatory reading for AI agents
├── package.json
└── tsconfig.json
```

## Documentation

| Document | Purpose |
|----------|---------|
| [MOBBIN-INSTRUCTIONS.md](MOBBIN-INSTRUCTIONS.md) | Entry point — key rules for AI agents |
| [Tool Reference](docs/INDEX.md) | All 10 tools with links to detailed docs |
| [Operational Guide](docs/OPERATIONAL-GUIDE.md) | Rules, collection workflows, script templates, timeouts |
| [Connection Guide](docs/connection.md) | MCP config, browser lifecycle, session persistence, direct script usage |
| [URL Patterns](docs/reference/url-patterns.md) | Search templates, filter catalogs, CDN URLs |
| [Page Types](docs/reference/page-types.md) | Page classification reference |
| [Troubleshooting](docs/troubleshooting/README.md) | Known issues and solutions |

## Tech stack

| Component | Technology |
|-----------|-----------|
| MCP server | `@modelcontextprotocol/sdk` 1.12 |
| Browser automation | `playwright` 1.52 (Chromium) |
| Language | TypeScript 5.8 (ESM, strict) |
| Transport | stdio (JSON-RPC 2.0) |
| Session storage | Playwright `storageState` (JSON cookies) |

## License

MIT
