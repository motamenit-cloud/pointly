/**
 * Playwright browser pool manager.
 *
 * Maintains a small pool of browser contexts that are reused across scrape jobs.
 * This avoids the overhead of launching a new browser for every request.
 */

import { chromium, type Browser, type BrowserContext } from "playwright";
import pino from "pino";
import { getProxyConfig } from "./proxyManager.js";

const logger = pino({ level: "info" });

let browser: Browser | null = null;
const MAX_CONTEXTS = 4;
const contextPool: BrowserContext[] = [];
let initPromise: Promise<Browser> | null = null;

/** User agents to rotate through. */
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1366, height: 768 },
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Launch or get the shared browser instance. */
export async function getBrowserPool(): Promise<Browser> {
  if (browser?.isConnected()) return browser;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    const proxy = getProxyConfig();

    logger.info({ proxy: proxy ? "configured" : "none" }, "Launching browser");

    browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-sandbox",
      ],
      ...(proxy && { proxy: { server: proxy.server, username: proxy.username, password: proxy.password } }),
    });

    browser.on("disconnected", () => {
      logger.warn("Browser disconnected");
      browser = null;
      initPromise = null;
      contextPool.length = 0;
    });

    return browser;
  })();

  return initPromise;
}

/** Get a browser context with anti-detection settings. */
export async function getContext(): Promise<BrowserContext> {
  const b = await getBrowserPool();

  // Reuse an idle context if available
  if (contextPool.length > 0) {
    return contextPool.pop()!;
  }

  const ua = randomChoice(USER_AGENTS);
  const viewport = randomChoice(VIEWPORTS);

  const context = await b.newContext({
    userAgent: ua,
    viewport,
    locale: "en-US",
    timezoneId: "America/New_York",
    geolocation: { latitude: 40.7128, longitude: -74.006 },
    permissions: ["geolocation"],
    javaScriptEnabled: true,
    bypassCSP: true,
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  // Anti-detection: override navigator.webdriver
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
    // Override chrome detection
    (window as any).chrome = { runtime: {} };
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: "denied" } as PermissionStatus)
        : originalQuery(parameters);
  });

  return context;
}

/** Return a context to the pool for reuse. */
export async function releaseContext(context: BrowserContext) {
  if (contextPool.length < MAX_CONTEXTS) {
    // Clear cookies/storage for next use
    await context.clearCookies();
    contextPool.push(context);
  } else {
    await context.close();
  }
}

/** Shut down the browser pool gracefully. */
export async function closeBrowserPool() {
  for (const ctx of contextPool) {
    await ctx.close().catch(() => {});
  }
  contextPool.length = 0;
  await browser?.close().catch(() => {});
  browser = null;
  initPromise = null;
}
