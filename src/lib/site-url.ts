import { createHash } from "crypto";

const MAX_URL_LENGTH = 2048;

/** Hostnames that should not be analyzed (SSRF / internal abuse). */
function isBlockedHostname(hostname: string, allowLocalhost: boolean): boolean {
  const h = hostname.toLowerCase();
  if (allowLocalhost && (h === "localhost" || h === "127.0.0.1" || h === "::1")) {
    return false;
  }
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "0.0.0.0") return true;
  // IPv4 private / loopback / link-local
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = h.match(ipv4);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  if (h.startsWith("172.16.") || h.startsWith("172.17.") || h.startsWith("172.18.") || h.startsWith("172.19.")) return true;
  if (/^172\.(2[0-9]|3[0-1])\./.test(h)) return true;
  return false;
}

/** Google Play app details: stable id for one app listing. */
function normalizeGooglePlayAppUrl(u: URL): string | null {
  const host = u.hostname.toLowerCase();
  if (host !== "play.google.com") return null;
  const path = (u.pathname || "/").replace(/\/+$/, "") || "/";
  if (!path.startsWith("/store/apps/details")) return null;
  const id = u.searchParams.get("id")?.trim();
  if (!id || id.length > 256 || !/^[\w.]+$/.test(id)) return null;
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(id)}`;
}

/** Apple App Store: canonicalize using numeric app id when present. */
function normalizeAppleAppStoreUrl(u: URL): string | null {
  const host = u.hostname.toLowerCase();
  if (host !== "apps.apple.com" && host !== "itunes.apple.com") return null;
  const path = u.pathname || "/";
  const idMatch = path.match(/\/id(\d{6,})/);
  if (idMatch) {
    return `https://apps.apple.com/app/id${idMatch[1]}`;
  }
  return null;
}

export function normalizeWebsiteUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) {
    throw new Error("Invalid URL");
  }
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let u: URL;
  try {
    u = new URL(withProto);
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Invalid URL");
  }
  u.username = "";
  u.password = "";
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();

  const play = normalizeGooglePlayAppUrl(u);
  if (play) return play;

  const apple = normalizeAppleAppStoreUrl(u);
  if (apple) return apple;

  if (u.hostname === "play.google.com" && u.pathname.includes("/store/apps")) {
    throw new Error(
      "Use a full Google Play app page URL with id= in the address bar (open the app in Play Store and copy the link)."
    );
  }
  if (u.hostname === "apps.apple.com" || u.hostname === "itunes.apple.com") {
    throw new Error(
      "Use a full App Store link that includes the app id (…/id123456789 in the URL)."
    );
  }

  let path = u.pathname.replace(/\/+$/, "") || "/";
  u.pathname = path;
  return u.toString();
}

const PLAY_SHORT_LINK_HOSTS = new Set(["play.app.goo.gl"]);

/**
 * Expands known Play Store short links to the final store URL before normalization.
 */
export async function resolveReviewUrlInput(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Invalid URL");
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let u: URL;
  try {
    u = new URL(withProto);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!PLAY_SHORT_LINK_HOSTS.has(u.hostname.toLowerCase())) {
    return trimmed;
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 10_000);
  try {
    const res = await fetch(u.toString(), {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (res.url && res.url !== u.toString()) return res.url;
  } catch {
    // keep original; normalize may still fail with a clear error
  } finally {
    clearTimeout(t);
  }
  return trimmed;
}

export function assertPublicWebsiteUrl(canonicalUrl: string): void {
  const allowLocal = process.env.NODE_ENV !== "production";
  let host: string;
  try {
    host = new URL(canonicalUrl).hostname;
  } catch {
    throw new Error("Invalid URL");
  }
  if (isBlockedHostname(host, allowLocal)) {
    throw new Error("That URL cannot be analyzed");
  }
}

/** Stable document id for Firestore (one doc per normalized site). */
export function siteKeyFromCanonicalUrl(canonicalUrl: string): string {
  return createHash("sha256").update(canonicalUrl, "utf8").digest("hex").slice(0, 32);
}

export function utcCalendarDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Canonical site origin for metadata, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (no trailing slash), e.g. https://sandboxbd.com
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || "3000";
    return `http://localhost:${port}`;
  }
  return "https://sandboxbd.com";
}
