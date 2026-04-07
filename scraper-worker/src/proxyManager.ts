/**
 * Proxy rotation manager.
 *
 * Reads proxy configuration from environment variables.
 * Supports single proxy (PROXY_URL) or rotation list (PROXY_URLS).
 * Falls back to direct connection when no proxy is configured.
 */

import pino from "pino";

const logger = pino({ level: "info" });

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

let proxyList: ProxyConfig[] = [];
let currentIndex = 0;
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  // Check for rotation list first
  const proxyUrls = process.env.PROXY_URLS;
  if (proxyUrls) {
    proxyList = proxyUrls
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .map(parseProxyUrl)
      .filter((p): p is ProxyConfig => p !== null);

    logger.info({ count: proxyList.length }, "Loaded proxy rotation list");
    return;
  }

  // Single proxy
  const proxyUrl = process.env.PROXY_URL;
  if (proxyUrl) {
    const parsed = parseProxyUrl(proxyUrl);
    if (parsed) {
      proxyList = [parsed];
      logger.info("Loaded single proxy");
    }
    return;
  }

  logger.info("No proxy configured — using direct connection");
}

function parseProxyUrl(url: string): ProxyConfig | null {
  try {
    const parsed = new URL(url);
    return {
      server: `${parsed.protocol}//${parsed.hostname}:${parsed.port}`,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
    };
  } catch {
    logger.warn({ url }, "Failed to parse proxy URL");
    return null;
  }
}

/** Get proxy config for the next request (round-robin). */
export function getProxyConfig(): ProxyConfig | null {
  init();

  if (proxyList.length === 0) return null;

  const proxy = proxyList[currentIndex % proxyList.length];
  currentIndex++;
  return proxy;
}

/** Get a sticky proxy for a session (same proxy throughout). */
export function getStickyProxy(sessionKey: string): ProxyConfig | null {
  init();

  if (proxyList.length === 0) return null;

  // Simple hash to pick a consistent proxy for a session
  let hash = 0;
  for (let i = 0; i < sessionKey.length; i++) {
    hash = (hash << 5) - hash + sessionKey.charCodeAt(i);
    hash |= 0;
  }

  return proxyList[Math.abs(hash) % proxyList.length];
}
