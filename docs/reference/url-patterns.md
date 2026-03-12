# URL Patterns

Mobbin URL structure, search templates, filter catalogs, and CDN image URLs.

---

## Search URL Template

```
https://mobbin.com/search/apps/ios?content_type={type}&sort={sort}&filter={filterKey}.{filterValue}
```

| Parameter | Values |
|-----------|--------|
| `content_type` | `screens`, `flows`, `ui-elements`, `apps` |
| `sort` | `trending`, `mostPopular` |
| `filter` | `screenPatterns.{name}`, `screenElements.{name}`, `flowActions.{name}`, `appCategories.{name}` |

### Sort Options

| Value | Description |
|-------|-------------|
| `trending` | Currently trending (default) |
| `mostPopular` | All-time most popular |

### Example URLs

```
# Dashboard screens, trending
https://mobbin.com/search/apps/ios?content_type=screens&sort=trending&filter=screenPatterns.Dashboard

# Onboarding flows
https://mobbin.com/search/apps/ios?content_type=flows&sort=trending&filter=flowActions.Onboarding

# Button UI elements
https://mobbin.com/search/apps/ios?content_type=ui-elements&sort=trending&filter=screenElements.Button
```

---

## Explore URLs

Direct category browsing via the Mobbin explore section.

| Content | Pattern |
|---------|---------|
| Screen category | `/explore/{mobile\|web}/screens/{category}` |
| Flow category | `/explore/{mobile\|web}/flows/{category}` |
| UI element | `/explore/{mobile\|web}/ui-elements/{component}` |

### Static URLs

| Key | URL |
|-----|-----|
| `home` | `https://mobbin.com` |
| `login` | `https://mobbin.com/login` |
| `exploreWeb` | `https://mobbin.com/explore/web` |
| `exploreMobile` | `https://mobbin.com/explore/mobile` |
| `browseWebScreens` | `https://mobbin.com/browse/web/screens` |
| `browseMobileScreens` | `https://mobbin.com/browse/mobile/screens` |
| `browseWebFlows` | `https://mobbin.com/browse/web/flows` |
| `browseMobileFlows` | `https://mobbin.com/browse/mobile/flows` |

---

## Detail URLs

| Content | Pattern | Example |
|---------|---------|---------|
| Screen detail | `/explore/screens/{UUID}` | `/explore/screens/a1b2c3d4-e5f6-...` |
| Flow detail | `/explore/flows/{UUID}` | `/explore/flows/a1b2c3d4-e5f6-...` |
| App detail | `/apps/{slug}/{versionId}/screens` | `/apps/airbnb/v123/screens` |

---

## URL Encoding

Filter values with spaces use `+` encoding. Ampersands use `%26`.

| Display Name | Encoded Value |
|-------------|---------------|
| My Account & Profile | `My+Account+%26+Profile` |
| Cart & Bag | `Cart+%26+Bag` |
| Browse & Discover | `Browse+%26+Discover` |

---

## Image CDN URLs

Mobbin uses Bytescale CDN for screen images.

```
# Thumbnail (listing page — default from extract)
https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/{UUID}.png?f=webp&w=512&q=85

# Full resolution (for downloading)
https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/{UUID}.png?f=png&w=1920&q=100
```

| Parameter | Thumbnail | Full Resolution |
|-----------|-----------|-----------------|
| `f` (format) | `webp` | `png` |
| `w` (width) | `512` | `1920` |
| `q` (quality) | `85` | `100` |

**To convert thumbnail to full resolution:**

```javascript
const fullRes = thumbnailUrl.split('?')[0] + '?f=png&w=1920&q=100';
```

---

## DOM Selectors for Extraction

Selectors used by `mobbin_extract` and collection scripts:

| Target | Selector | Filter |
|--------|----------|--------|
| Screen links | `a[href*="/screens/"]` | Regex: `/\/screens\/[a-f0-9-]{36}/` (UUID v4). Scripts may use `{20,}` for lenient matching. |
| Screen images | `img[src*="bytescale"]` | Within screen link elements |
| Design images | `img[src]` | Width >100px, from CDN domains (`bytescale`, `upcdn.io`, `mobbin`, `cdn`) |

---

## Complete Screen Patterns Catalog

Use with `filter=screenPatterns.{value}` in search URLs.

### New User Experience

`Account+Setup` · `Guided+Tour+%26+Tutorial` · `Splash+Screen` · `Signup` · `Verification` · `Welcome+%26+Get+Started`

### Account Management

`Delete+%26+Deactivate+Account` · `Forgot+Password` · `Login` · `My+Account+%26+Profile` · `Settings+%26+Preferences`

### Communication

`About` · `Acknowledgement+%26+Success` · `Action+Option` · `Confirmation` · `Empty+State` · `Error` · `Feature+Info` · `Feedback` · `Help+%26+Support` · `Loading` · `Permission` · `Privacy+Policy` · `Pull+to+Refresh` · `Suggestions+%26+Similar+Items` · `Terms+%26+Conditions`

### Commerce & Finance

`Billing` · `Cart+%26+Bag` · `Checkout` · `Order+Confirmation` · `Order+Detail` · `Order+History` · `Payment+Method` · `Pricing` · `Promotions+%26+Rewards` · `Shop+%26+Storefront` · `Subscription+%26+Paywall` · `Wallet+%26+Balance`

### Social

`Achievements+%26+Awards` · `Chat+Detail` · `Comments` · `Followers+%26+Following` · `Groups+%26+Community` · `Invite+Teammates` · `Leaderboard` · `Notifications` · `Reviews+%26+Ratings` · `Social+Feed` · `User+%2F+Group+Profile`

### Content

`Article+Detail` · `Augmented+Reality` · `Browse+%26+Discover` · `Class+%26+Lesson+Detail` · `Emails+%26+Messages` · `Event+Detail` · `Goal+%26+Task` · `Home` · `News+Feed` · `Note+Detail` · `Other+Content` · `Post+Detail` · `Product+Detail` · `Quiz` · `Recipe+Detail` · `Song+%26+Podcast+Detail` · `Stories` · `TV+Show+%26+Movie+Detail`

### Action

`Add+%26+Create` · `Ban+%26+Block` · `Cancel` · `Delete` · `Draw+%26+Annotate` · `Edit` · `Favorite+%26+Pin` · `Filter+%26+Sort` · `Flag+%26+Report` · `Follow+%26+Subscribe` · `Invite+%26+Refer+Friends` · `Like+%26+Upvote` · `Move` · `Other+Action` · `Reorder` · `Save` · `Search` · `Select` · `Set` · `Schedule` · `Share` · `Transfer+%26+Send+Money` · `Upload+%26+Download`

### Data

`Charts` · `Dashboard` · `Progress`

### My Stuff

`Bookmarks+%26+Collections` · `Downloads+%26+Available+Offline` · `History` · `Map` · `Media+Player` · `Calendar`

---

## Complete Flow Actions Catalog

Use with `filter=flowActions.{value}` in search URLs.

`Browsing+Tutorial` · `Chatting+%26+Sending+Messages` · `Creating+Account` · `Editing+Profile` · `Filtering+%26+Sorting` · `Logging+In` · `Onboarding` · `Subscribing+%26+Upgrading`

---

## Complete UI Elements Catalog

Use with `filter=screenElements.{value}` in search URLs.

`Banner` · `Bottom+Sheet` · `Button` · `Dropdown+Menu` · `Progress+Indicator` · `Stacked+List` · `Text+Field`
