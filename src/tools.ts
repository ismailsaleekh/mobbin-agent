import type { BrowserManager } from './browser.js';
import { MobbinNavigator, MOBBIN_URLS, SCREEN_CATEGORIES, FLOW_CATEGORIES } from './mobbin.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

type ToolResult = {
  content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string }>;
  isError?: boolean;
};

export function getToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: 'mobbin_connect',
      description: [
        'Launch a browser and connect to Mobbin. Restores saved session if available.',
        'Use headless=false for first-time login (so you can see the browser window).',
        'After connecting, use mobbin_login if not authenticated.',
      ].join(' '),
      inputSchema: {
        type: 'object',
        properties: {
          headless: {
            type: 'boolean',
            description: 'Run browser in headless mode (default: true). Set false for interactive login.',
            default: true,
          },
        },
      },
    },
    {
      name: 'mobbin_login',
      description: [
        'Navigate to Mobbin login page and wait for the user to authenticate manually.',
        'The browser must be launched in non-headless mode (mobbin_connect with headless=false).',
        'Waits up to 5 minutes for login completion, then saves session cookies.',
      ].join(' '),
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'mobbin_navigate',
      description: [
        'Navigate to a Mobbin URL and wait for the page to load.',
        'Returns page title and final URL.',
        `Known URL patterns: ${JSON.stringify(Object.fromEntries(Object.entries(MOBBIN_URLS).filter(([, v]) => typeof v === 'string')), null, 0)}`,
        `Screen categories: ${SCREEN_CATEGORIES.join(', ')}`,
        `Flow categories: ${FLOW_CATEGORIES.join(', ')}`,
        'Screen category URL: /explore/{mobile|web}/screens/{category}',
        'Flow category URL: /explore/{mobile|web}/flows/{category}',
        'Screen detail URL: /explore/screens/{UUID}',
      ].join(' '),
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'Full Mobbin URL to navigate to.',
          },
        },
        required: ['url'],
      },
    },
    {
      name: 'mobbin_screenshot',
      description:
        'Take a screenshot of the current browser viewport. Returns a PNG image. Use this to see what is currently displayed on the Mobbin page.',
      inputSchema: {
        type: 'object',
        properties: {
          fullPage: {
            type: 'boolean',
            description: 'Capture the full scrollable page instead of just the viewport (default: false).',
            default: false,
          },
        },
      },
    },
    {
      name: 'mobbin_extract',
      description: [
        'Extract structured data from the current Mobbin page.',
        'Returns: page type, headings, all links (with Mobbin-specific filtering for screens/flows/apps/categories),',
        'all images (with design-relevant image filtering), and a text preview.',
        'Use this to understand page content without taking a screenshot.',
      ].join(' '),
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'mobbin_click',
      description:
        'Click on an element in the current page. Provide one of: text (click element containing text), selector (CSS selector), or x+y coordinates.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Click element containing this text.',
          },
          selector: {
            type: 'string',
            description: 'CSS selector of the element to click.',
          },
          x: {
            type: 'number',
            description: 'X coordinate to click at.',
          },
          y: {
            type: 'number',
            description: 'Y coordinate to click at.',
          },
        },
      },
    },
    {
      name: 'mobbin_type',
      description:
        'Type text into an input field. Optionally specify a CSS selector for the target input. Can press Enter after typing.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to type.',
          },
          selector: {
            type: 'string',
            description: 'CSS selector of the input field (optional — types into focused element if omitted).',
          },
          pressEnter: {
            type: 'boolean',
            description: 'Press Enter after typing (default: false).',
            default: false,
          },
          clear: {
            type: 'boolean',
            description: 'Clear the field before typing (default: false).',
            default: false,
          },
        },
        required: ['text'],
      },
    },
    {
      name: 'mobbin_scroll',
      description:
        'Scroll the current page up or down. Useful for loading more content (Mobbin uses infinite scroll). Returns scroll position.',
      inputSchema: {
        type: 'object',
        properties: {
          direction: {
            type: 'string',
            enum: ['down', 'up'],
            description: 'Scroll direction (default: down).',
            default: 'down',
          },
          amount: {
            type: 'number',
            description: 'Pixels to scroll (default: 800).',
            default: 800,
          },
        },
      },
    },
    {
      name: 'mobbin_download',
      description: [
        'Download one or more images by URL to the local filesystem.',
        `Images are saved to the downloads directory: mobbin-agent/data/downloads/`,
        'Returns the list of saved file paths.',
      ].join(' '),
      inputSchema: {
        type: 'object',
        properties: {
          urls: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of image URLs to download.',
          },
          prefix: {
            type: 'string',
            description: 'Optional prefix for filenames (e.g., "airbnb-onboarding").',
          },
        },
        required: ['urls'],
      },
    },
    {
      name: 'mobbin_disconnect',
      description: 'Close the browser and save the current session. The session can be restored on the next mobbin_connect call.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  browser: BrowserManager,
  mobbin: MobbinNavigator
): Promise<ToolResult> {
  try {
    switch (name) {
      case 'mobbin_connect':
        return text(await browser.launch({ headless: (args.headless as boolean) ?? true }));

      case 'mobbin_login':
        return text(await mobbin.login());

      case 'mobbin_navigate': {
        const url = args.url as string;
        if (!url) return error('Missing required parameter: url');
        const result = await browser.navigate(url);
        return text(`Navigated to: ${result.url}\nTitle: ${result.title}`);
      }

      case 'mobbin_screenshot': {
        const fullPage = (args.fullPage as boolean) ?? false;
        const buffer = await browser.screenshot(fullPage);
        return {
          content: [
            {
              type: 'image',
              data: buffer.toString('base64'),
              mimeType: 'image/png',
            },
          ],
        };
      }

      case 'mobbin_extract': {
        const data = await mobbin.extract();
        // Build a concise summary to fit in context
        const summary = {
          url: data.url,
          title: data.title,
          pageType: data.pageType,
          headings: data.headings,
          designImages: data.designImages.slice(0, 50).map((img) => ({
            src: img.src,
            alt: img.alt,
            size: `${img.width}x${img.height}`,
          })),
          screenLinks: data.screenLinks.slice(0, 30),
          flowLinks: data.flowLinks.slice(0, 30),
          appLinks: data.appLinks.slice(0, 30),
          categoryLinks: data.categoryLinks.slice(0, 30),
          allLinksCount: data.links.length,
          allImagesCount: data.images.length,
          textPreview: data.textPreview.substring(0, 1000),
        };
        return text(JSON.stringify(summary, null, 2));
      }

      case 'mobbin_click': {
        const clickArgs = args as { text?: string; selector?: string; x?: number; y?: number };
        return text(await browser.click(clickArgs));
      }

      case 'mobbin_type': {
        const typeText = args.text as string;
        if (!typeText) return error('Missing required parameter: text');
        return text(
          await browser.type(typeText, {
            selector: args.selector as string | undefined,
            pressEnter: (args.pressEnter as boolean) ?? false,
            clear: (args.clear as boolean) ?? false,
          })
        );
      }

      case 'mobbin_scroll': {
        return text(
          await browser.scroll({
            direction: (args.direction as 'down' | 'up') ?? 'down',
            amount: (args.amount as number) ?? 800,
          })
        );
      }

      case 'mobbin_download': {
        const urls = args.urls as string[];
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
          return error('Missing or empty required parameter: urls');
        }
        const prefix = (args.prefix as string) || '';
        const results: string[] = [];
        const errors: string[] = [];

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          try {
            const filename = prefix ? `${prefix}_${i + 1}.png` : undefined;
            const savedPath = await browser.downloadImage(url, filename);
            results.push(savedPath);
            // Rate limit: small delay between downloads
            if (i < urls.length - 1) {
              await new Promise((r) => setTimeout(r, 500));
            }
          } catch (e) {
            errors.push(`Failed to download ${url}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }

        const summary = [
          `Downloaded ${results.length}/${urls.length} images.`,
          results.length > 0 ? `\nSaved to:\n${results.map((p) => `  ${p}`).join('\n')}` : '',
          errors.length > 0 ? `\nErrors:\n${errors.map((e) => `  ${e}`).join('\n')}` : '',
        ].join('');

        return text(summary);
      }

      case 'mobbin_disconnect':
        return text(await browser.close());

      default:
        return error(`Unknown tool: ${name}`);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return error(message);
  }
}

function text(content: string): ToolResult {
  return { content: [{ type: 'text', text: content }] };
}

function error(message: string): ToolResult {
  return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}
