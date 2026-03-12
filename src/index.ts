import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from './browser.js';
import { MobbinNavigator } from './mobbin.js';
import { getToolDefinitions, handleToolCall } from './tools.js';

const SERVER_NAME = 'mobbin-agent';
const SERVER_VERSION = '1.0.0';

function log(message: string): void {
  process.stderr.write(`[${SERVER_NAME}] ${message}\n`);
}

async function main(): Promise<void> {
  const browser = new BrowserManager();
  const mobbin = new MobbinNavigator(browser);

  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: getToolDefinitions(),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    log(`Tool call: ${name}`);
    const result = await handleToolCall(name, (args ?? {}) as Record<string, unknown>, browser, mobbin);
    if (result.isError) {
      log(`Tool error: ${name} — ${result.content[0]?.type === 'text' ? result.content[0].text : 'unknown'}`);
    }
    return result;
  });

  // Graceful shutdown
  const cleanup = async () => {
    log('Shutting down...');
    await browser.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Server started.');
}

main().catch((err) => {
  process.stderr.write(`[${SERVER_NAME}] Fatal error: ${err}\n`);
  process.exit(1);
});
