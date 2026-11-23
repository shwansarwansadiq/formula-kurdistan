/**
 * The full text of a source article, so the writer works from the whole report and not the feed's two-line teaser.
 * We read pages openly as FormulaKBot, respect robots.txt, and stop at any refusal (403, 429, bot check):
 * a blocked page is never worked around, the feed text is used instead.
 */
const UA = "FormulaKBot/1.0 (+https://formulak.news)";
const MAX_CHARS = 9000;

const robotsCache = new Map<string, Promise<string[]>>();

/** Disallow rules that apply to us (our own group, else "*"). */
export function disallowRules(robots: string, agent = "formulakbot"): string[] {
  const groups: { agents: string[]; rules: string[] }[] = [];
  let current: { agents: string[]; rules: string[] } | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (key === "disallow" && current && value) current.rules.push(value);
    }
  }
  const own = groups.filter((g) => g.agents.some((a) => a !== "*" && agent.includes(a)));
  const chosen = own.length ? own : groups.filter((g) => g.agents.includes("*"));
  return chosen.flatMap((g) => g.rules);
}

export function allowedByRules(path: string, rules: string[]): boolean {
  return !rules.some((r) => {
    const pattern = "^" + r.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
    return new RegExp(pattern).test(path);
  });
}

async function allowed(url: URL): Promise<boolean> {
  let rules = robotsCache.get(url.origin);
  if (!rules) {
    rules = fetch(`${url.origin}/robots.txt`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) })
      .then(async (r) => (r.ok ? disallowRules(await r.text()) : []))
      .catch(() => []);
    robotsCache.set(url.origin, rules);
  }
  return allowedByRules(url.pathname + url.search, await rules);
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

/** Lines that are page furniture, not reporting. */
const BOILERPLATE =
  /^(advertisement|sign up|subscribe|read more|related|share this|follow us|click here|you might also like|most read|newsletter|cookie|©|copyright|all rights reserved|photo:|image:|credit:|getty images|listen to|watch:|join us)/i;

/** The article's paragraphs as plain text: from <article> when there is one, else the whole page. */
export function articleTextFromHtml(html: string): string {
  const clean = html
    .replace(/<(script|style|noscript|svg|nav|footer|header|aside|form|figure|figcaption)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const articles = [...clean.matchAll(/<article\b[\s\S]*?<\/article>/gi)].map((m) => m[0]);
  const scope = articles.sort((a, b) => b.length - a.length)[0] ?? clean;
  const paras = [...scope.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => decode(m[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 40 && !BOILERPLATE.test(p));
  const seen = new Set<string>();
  const out: string[] = [];
  let total = 0;
  for (const p of paras) {
    if (seen.has(p)) continue;
    seen.add(p);
    if (total + p.length > MAX_CHARS) break;
    out.push(p);
    total += p.length;
  }
  return out.join("\n\n");
}

/** Full article text, or null when the page refuses us, robots.txt says no, or nothing readable is found. */
export async function fetchArticleText(pageUrl: string): Promise<string | null> {
  try {
    const url = new URL(pageUrl);
    if (!(await allowed(url))) return null;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const text = articleTextFromHtml((await res.text()).slice(0, 1_500_000));
    return text.length >= 300 ? text : null;
  } catch {
    return null;
  }
}

/** Replaces each report's feed teaser with its full article text where we can read it. */
export async function withArticleText<T extends { url: string; summary: string | null }>(reports: T[]): Promise<T[]> {
  return Promise.all(
    reports.slice(0, 5).map(async (r) => {
      const full = await fetchArticleText(r.url);
      return full && full.length > (r.summary?.length ?? 0) ? { ...r, summary: full } : r;
    }),
  ).then((first) => [...first, ...reports.slice(5)]);
}
