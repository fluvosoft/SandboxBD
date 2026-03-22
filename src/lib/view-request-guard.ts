/**
 * Heuristics for POST /api/review/[id]/view. Browsers send User-Agent and
 * Sec-Fetch-*; scripts, scrapers, and cross-site calls often differ.
 * False positives are possible; skipped requests still return the current viewCount.
 */
export function shouldSkipViewIncrement(request: Request): boolean {
  const ua = request.headers.get("user-agent")?.trim() ?? "";
  if (!ua) return true;
  if (ua.length < 24) return true;

  const lower = ua.toLowerCase();
  const botLike = [
    /\bcurl\b/i,
    /^wget/i,
    /\bpython-requests\b/i,
    /\bpython\/\d/i,
    /\bhttpx\b/i,
    /\baxios\b/i,
    /\bgo-http-client\b/i,
    /\bjava\/\d/i,
    /\bscrapy\b/i,
    /\bheadless\b/i,
    /\bpuppeteer\b/i,
    /\bplaywright\b/i,
    /\bphantomjs\b/i,
    /\bselenium\b/i,
    /\bpostman\b/i,
    /\binsomnia\b/i,
    /\bhttpie\b/i,
    /\bsemrush\b/i,
    /\bahrefsbot\b/i,
    /\bbytespider\b/i,
    /\bpetalbot\b/i,
    /\bgooglebot\b/i,
    /\bbingbot\b/i,
    /\bddg_web\b/i,
    /\bfacebookexternalhit\b/i,
    /\bslackbot\b/i,
    /\btelegrambot\b/i,
    /\bdiscordbot\b/i,
    /\bpreview\b/i,
  ];
  if (botLike.some((re) => re.test(ua))) return true;

  const genericBot =
    /\b(bot|crawler|spider|scraper)\b/i.test(ua) &&
    !/\bchrome\b/i.test(lower);
  if (genericBot) return true;

  const secSite = request.headers.get("sec-fetch-site");
  if (secSite === "cross-site") return true;

  return false;
}
