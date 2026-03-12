import type { BrowserManager } from './browser.js';

const MOBBIN_BASE = 'https://mobbin.com';
const LOGIN_URL = `${MOBBIN_BASE}/login`;

const LOGIN_SUCCESS_INDICATORS = [
  '/explore',
  '/browse',
  '/discover',
  '/collections',
];

const SETTLE_AFTER_LOGIN_MS = 3_000;
const LOGIN_POLL_INTERVAL_MS = 2_000;
const LOGIN_TIMEOUT_MS = 300_000; // 5 minutes for manual login

export interface ExtractedPageData {
  url: string;
  title: string;
  pageType: MobbinPageType;
  headings: string[];
  images: ExtractedImage[];
  links: ExtractedLink[];
  screenLinks: ExtractedLink[];
  flowLinks: ExtractedLink[];
  appLinks: ExtractedLink[];
  categoryLinks: ExtractedLink[];
  designImages: ExtractedImage[];
  textPreview: string;
}

export interface ExtractedImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ExtractedLink {
  href: string;
  text: string;
}

export type MobbinPageType =
  | 'home'
  | 'explore-screens'
  | 'explore-flows'
  | 'explore-ui-elements'
  | 'screen-detail'
  | 'flow-detail'
  | 'app-detail'
  | 'browse'
  | 'search'
  | 'collection'
  | 'login'
  | 'unknown';

export class MobbinNavigator {
  constructor(private browser: BrowserManager) {}

  async login(): Promise<string> {
    const page = await this.browser.getPage();
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

    // Wait for user to complete login manually
    const startTime = Date.now();

    while (Date.now() - startTime < LOGIN_TIMEOUT_MS) {
      const currentUrl = page.url();
      const isLoggedIn = LOGIN_SUCCESS_INDICATORS.some((path) => currentUrl.includes(path));

      if (isLoggedIn) {
        await new Promise((resolve) => setTimeout(resolve, SETTLE_AFTER_LOGIN_MS));
        await this.browser.saveSession();
        return `Login successful. Session saved. Current URL: ${page.url()}`;
      }

      await new Promise((resolve) => setTimeout(resolve, LOGIN_POLL_INTERVAL_MS));
    }

    return 'Login timed out after 5 minutes. Please try again.';
  }

  async extract(): Promise<ExtractedPageData> {
    const page = await this.browser.getPage();

    // Wait for meaningful content to load before extracting
    try {
      await page.waitForSelector('img[src], a[href]', { timeout: 8_000 });
    } catch {
      // Page may be minimal or empty — proceed anyway
    }

    const url = page.url();
    const title = await page.title();
    const pageType = this.classifyPage(url);

    const rawData = await page.evaluate(() => {
      const getVisibleImages = (): Array<{ src: string; alt: string; width: number; height: number }> => {
        return Array.from(document.querySelectorAll('img[src]'))
          .map((img) => {
            const el = img as HTMLImageElement;
            const rect = el.getBoundingClientRect();
            return {
              src: el.src,
              alt: el.alt || '',
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          })
          .filter((img) => img.width > 30 && img.height > 30);
      };

      const getLinks = (): Array<{ href: string; text: string }> => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => {
            const el = a as HTMLAnchorElement;
            return {
              href: el.href,
              text: (el.textContent || '').trim().substring(0, 120),
            };
          })
          .filter((l) => l.href.startsWith('http') && l.text.length > 0);
      };

      const getHeadings = (): string[] => {
        return Array.from(document.querySelectorAll('h1, h2, h3'))
          .map((h) => (h.textContent || '').trim())
          .filter((t) => t.length > 0)
          .slice(0, 20);
      };

      const getTextPreview = (): string => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const chunks: string[] = [];
        let total = 0;
        while (walker.nextNode() && total < 2000) {
          const text = (walker.currentNode.textContent || '').trim();
          if (text.length > 2) {
            chunks.push(text);
            total += text.length;
          }
        }
        return chunks.join(' ').substring(0, 2000);
      };

      return {
        images: getVisibleImages(),
        links: getLinks(),
        headings: getHeadings(),
        textPreview: getTextPreview(),
      };
    });

    // Deduplicate links by href
    const uniqueLinks = this.deduplicateLinks(rawData.links);

    // Classify links into Mobbin categories
    const screenLinks = uniqueLinks.filter(
      (l) => l.href.includes('/explore/screens/') || l.href.match(/\/screens\/[a-f0-9-]{36}/)
    );

    const flowLinks = uniqueLinks.filter(
      (l) => l.href.includes('/explore/flows/') || l.href.match(/\/flows\/[a-f0-9-]{36}/)
    );

    const appLinks = uniqueLinks.filter((l) => l.href.includes('/apps/'));

    const categoryLinks = uniqueLinks.filter(
      (l) =>
        l.href.match(/\/explore\/(mobile|web)\/(screens|flows|ui-elements)\/[a-z]/) !== null
    );

    // Identify design-relevant images (large images from CDN)
    const designImages = rawData.images.filter(
      (img) =>
        img.width > 100 &&
        img.height > 100 &&
        (img.src.includes('upcdn.io') ||
          img.src.includes('bytescale') ||
          img.src.includes('mobbin') ||
          img.src.includes('cdn'))
    );

    return {
      url,
      title,
      pageType,
      headings: rawData.headings,
      images: rawData.images,
      links: uniqueLinks,
      screenLinks,
      flowLinks,
      appLinks,
      categoryLinks,
      designImages,
      textPreview: rawData.textPreview,
    };
  }

  classifyPage(url: string): MobbinPageType {
    if (url.includes('/login') || url.includes('/signup')) return 'login';
    if (url.match(/\/explore\/screens\/[a-f0-9-]{36}/)) return 'screen-detail';
    if (url.match(/\/explore\/flows\/[a-f0-9-]{36}/)) return 'flow-detail';
    if (url.includes('/apps/')) return 'app-detail';
    if (url.match(/\/explore\/(mobile|web)\/screens/)) return 'explore-screens';
    if (url.match(/\/explore\/(mobile|web)\/flows/)) return 'explore-flows';
    if (url.match(/\/explore\/(mobile|web)\/ui-elements/)) return 'explore-ui-elements';
    if (url.includes('/browse/')) return 'browse';
    if (url.includes('/search') || url.includes('?q=')) return 'search';
    if (url.includes('/collections/')) return 'collection';
    if (url === MOBBIN_BASE || url === `${MOBBIN_BASE}/`) return 'home';
    return 'unknown';
  }

  private deduplicateLinks(links: ExtractedLink[]): ExtractedLink[] {
    const seen = new Set<string>();
    return links.filter((l) => {
      if (seen.has(l.href)) return false;
      seen.add(l.href);
      return true;
    });
  }
}

/**
 * Known Mobbin URL patterns for reference by AI agents.
 */
export const MOBBIN_URLS = {
  home: MOBBIN_BASE,
  login: LOGIN_URL,
  exploreWeb: `${MOBBIN_BASE}/explore/web`,
  exploreMobile: `${MOBBIN_BASE}/explore/mobile`,
  browseWebScreens: `${MOBBIN_BASE}/browse/web/screens`,
  browseMobileScreens: `${MOBBIN_BASE}/browse/mobile/screens`,
  browseWebFlows: `${MOBBIN_BASE}/browse/web/flows`,
  browseMobileFlows: `${MOBBIN_BASE}/browse/mobile/flows`,

  screenCategory: (platform: 'mobile' | 'web', category: string) =>
    `${MOBBIN_BASE}/explore/${platform}/screens/${category}`,
  flowCategory: (platform: 'mobile' | 'web', category: string) =>
    `${MOBBIN_BASE}/explore/${platform}/flows/${category}`,
  uiElementCategory: (platform: 'mobile' | 'web', component: string) =>
    `${MOBBIN_BASE}/explore/${platform}/ui-elements/${component}`,
  screenDetail: (uuid: string) => `${MOBBIN_BASE}/explore/screens/${uuid}`,
  flowDetail: (uuid: string) => `${MOBBIN_BASE}/explore/flows/${uuid}`,
} as const;

/**
 * Known screen categories on Mobbin.
 */
export const SCREEN_CATEGORIES = [
  'home', 'dashboard', 'login', 'signup', 'onboarding', 'checkout',
  'product-detail', 'browse-discover', 'search', 'settings-preferences',
  'profile', 'chat-detail', 'notifications', 'loading', 'success',
  'error', 'empty-state', 'pricing', 'payments', 'orders',
] as const;

/**
 * Known flow categories on Mobbin.
 */
export const FLOW_CATEGORIES = [
  'logging-in', 'signing-up', 'onboarding', 'adding-to-cart-bag',
  'editing-profile', 'searching', 'filtering-sorting', 'subscribing-upgrading',
  'chatting-sending-messages', 'sharing', 'uploading', 'booking',
] as const;
