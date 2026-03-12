import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DATA_DIR = path.join(import.meta.dirname, '..', 'data');
const SESSION_DIR = path.join(DATA_DIR, 'session');
const STORAGE_STATE_PATH = path.join(SESSION_DIR, 'storage-state.json');
const DOWNLOADS_DIR = path.join(DATA_DIR, 'downloads');

const REALISTIC_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

const NAV_TIMEOUT = 30_000;
const ACTION_DELAY_MS = 800;

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  get isConnected(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }

  async launch(options?: { headless?: boolean }): Promise<string> {
    if (this.isConnected) {
      return 'Browser already running.';
    }

    const headless = options?.headless ?? true;
    const hasSession = fs.existsSync(STORAGE_STATE_PATH);

    this.browser = await chromium.launch({
      headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });

    this.context = await this.browser.newContext({
      ...(hasSession ? { storageState: STORAGE_STATE_PATH } : {}),
      viewport: DEFAULT_VIEWPORT,
      userAgent: REALISTIC_USER_AGENT,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      deviceScaleFactor: 2,
      ignoreHTTPSErrors: true,
    });

    this.context.setDefaultTimeout(NAV_TIMEOUT);
    this.page = await this.context.newPage();

    const status = hasSession
      ? 'Browser launched with restored session.'
      : 'Browser launched (no saved session — run mobbin_login to authenticate).';

    return status;
  }

  async getPage(): Promise<Page> {
    if (!this.page || !this.isConnected) {
      throw new Error('Browser not connected. Call mobbin_connect first.');
    }
    return this.page;
  }

  async navigate(url: string): Promise<{ url: string; title: string }> {
    const page = await this.getPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.settleAfterNavigation(page);
    return { url: page.url(), title: await page.title() };
  }

  async screenshot(fullPage?: boolean): Promise<Buffer> {
    const page = await this.getPage();
    return page.screenshot({
      type: 'png',
      fullPage: fullPage ?? false,
    });
  }

  async click(options: { text?: string; selector?: string; x?: number; y?: number }): Promise<string> {
    const page = await this.getPage();

    if (options.text) {
      const locator = page.getByText(options.text, { exact: false }).first();
      await locator.click({ timeout: 10_000 });
      await this.actionDelay();
      return `Clicked element with text "${options.text}".`;
    }

    if (options.selector) {
      await page.click(options.selector, { timeout: 10_000 });
      await this.actionDelay();
      return `Clicked element matching "${options.selector}".`;
    }

    if (options.x !== undefined && options.y !== undefined) {
      await page.mouse.click(options.x, options.y);
      await this.actionDelay();
      return `Clicked at coordinates (${options.x}, ${options.y}).`;
    }

    throw new Error('Provide at least one of: text, selector, or x+y coordinates.');
  }

  async type(text: string, options?: { selector?: string; pressEnter?: boolean; clear?: boolean }): Promise<string> {
    const page = await this.getPage();

    if (options?.selector) {
      if (options.clear) {
        await page.fill(options.selector, '', { timeout: 10_000 });
      }
      await page.fill(options.selector, text, { timeout: 10_000 });
    } else {
      if (options?.clear) {
        await page.keyboard.press('Meta+a');
        await page.keyboard.press('Backspace');
      }
      await page.keyboard.type(text, { delay: 50 });
    }

    if (options?.pressEnter) {
      await page.keyboard.press('Enter');
    }

    await this.actionDelay();
    return `Typed "${text}"${options?.pressEnter ? ' and pressed Enter' : ''}.`;
  }

  async scroll(options?: { direction?: 'down' | 'up'; amount?: number }): Promise<string> {
    const page = await this.getPage();
    const direction = options?.direction ?? 'down';
    const pixels = options?.amount ?? 800;
    const delta = direction === 'down' ? pixels : -pixels;

    await page.mouse.wheel(0, delta);
    await this.settleAfterNavigation(page);

    const scrollPos = await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      maxY: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    }));

    return `Scrolled ${direction} ${pixels}px. Position: ${scrollPos.y}/${scrollPos.maxY}px.`;
  }

  async downloadImage(imageUrl: string, filename?: string): Promise<string> {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

    const resolvedName = filename ?? this.filenameFromUrl(imageUrl);
    const outputPath = path.join(DOWNLOADS_DIR, resolvedName);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: HTTP ${response.status} for ${imageUrl}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  }

  async saveSession(): Promise<void> {
    if (!this.context) return;
    fs.mkdirSync(SESSION_DIR, { recursive: true });
    await this.context.storageState({ path: STORAGE_STATE_PATH });
  }

  async close(): Promise<string> {
    try {
      await this.saveSession();
    } catch {
      // Session save may fail if context is already closed
    }

    await this.page?.close().catch(() => {});
    await this.context?.close().catch(() => {});
    await this.browser?.close().catch(() => {});

    this.page = null;
    this.context = null;
    this.browser = null;

    return 'Browser closed and session saved.';
  }

  get downloadsDir(): string {
    return DOWNLOADS_DIR;
  }

  private async settleAfterNavigation(page: Page): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout: 8_000 });
    } catch {
      // networkidle may not fire on SPAs — that's OK
    }
  }

  private async actionDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ACTION_DELAY_MS));
  }

  private filenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1] || '';
      const clean = last.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80);

      if (clean.length > 3 && /\.(png|jpg|jpeg|webp|svg)$/i.test(clean)) {
        return clean;
      }
      if (clean.length > 3) {
        return `${clean}.png`;
      }
    } catch {
      // URL parse failed — fall through to timestamp
    }
    // Fallback: timestamp-based name
    return `mobbin_${Date.now()}.png`;
  }
}
