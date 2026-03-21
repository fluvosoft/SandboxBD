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
  let path = u.pathname.replace(/\/+$/, "") || "/";
  u.pathname = path;
  return u.toString();
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
