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
