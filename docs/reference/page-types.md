# Page Types

Page type classification used by [`mobbin_extract`](../tools/04-perception.md#mobbin_extract). The `pageType` field in extract results identifies what kind of Mobbin page is currently loaded.

---

## Classification Table

| Page Type | URL Pattern | Example |
|-----------|-------------|---------|
| `home` | `mobbin.com` (exact match) | Homepage |
| `login` | Contains `/login` or `/signup` | Auth pages |
| `screen-detail` | `/explore/screens/{UUID}` | Individual screen view |
| `flow-detail` | `/explore/flows/{UUID}` | Individual flow view |
| `app-detail` | Contains `/apps/` | App screens/flows listing |
| `explore-screens` | `/explore/{mobile\|web}/screens` | Screen category listing |
| `explore-flows` | `/explore/{mobile\|web}/flows` | Flow category listing |
| `explore-ui-elements` | `/explore/{mobile\|web}/ui-elements` | UI element listing |
| `browse` | Contains `/browse/` | Browse listing |
| `search` | Contains `/search` or `?q=` | Search results |
| `collection` | Contains `/collections/` | User collection page |
| `unknown` | Anything else | Unclassified |

---

## Classification Order

Page type is determined by **first match** in this order (important for URLs matching multiple patterns):

1. `/login` or `/signup` → `login`
2. `/explore/screens/{UUID-36}` → `screen-detail`
3. `/explore/flows/{UUID-36}` → `flow-detail`
4. `/apps/` → `app-detail`
5. `/explore/{mobile|web}/screens` → `explore-screens`
6. `/explore/{mobile|web}/flows` → `explore-flows`
7. `/explore/{mobile|web}/ui-elements` → `explore-ui-elements`
8. `/browse/` → `browse`
9. `/search` or `?q=` → `search`
10. `/collections/` → `collection`
11. Exact `https://mobbin.com` or `https://mobbin.com/` → `home`
12. Default → `unknown`

**Note:** UUID pattern matches exactly 36 characters: `[a-f0-9-]{36}` (standard UUID v4 format).

---

## Expected Content by Page Type

| Page Type | `designImages` | `screenLinks` | `flowLinks` | `appLinks` |
|-----------|---------------|---------------|-------------|------------|
| `explore-screens` | Many | Many | Few | Some |
| `explore-flows` | Some | Few | Many | Some |
| `explore-ui-elements` | Many | Some | Few | Few |
| `screen-detail` | 1-3 | Few | Few | 1 |
| `flow-detail` | Several | Few | Few | 1 |
| `app-detail` | Many | Many | Some | 0 |
| `search` | Varies | Varies | Varies | Varies |
| `browse` | Many | Many | Few | Some |
| `home` | Some | Few | Few | Few |
| `login` | 0 | 0 | 0 | 0 |
| `collection` | Some | Some | Some | Some |
