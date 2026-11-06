/* A driver's photo for result cards: the lead image of their English Wikipedia article, used only when Wikimedia
   Commons lists it under a free licence, with the author and licence for the credit line (the photo rule). */
import { unstable_cache } from "next/cache";

export type DriverPhoto = { url: string; credit: string };

const UA = { "User-Agent": "FORMULAK/1.0 (https://formulak.news)" };
const FREE = /^(cc[ -]?by|cc0|public domain|pd\b|ogl)/i; // OGL: UK Open Government Licence, free with credit

const strip = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function lookup(wiki: string): Promise<DriverPhoto | null> {
  const m = wiki.match(/^https?:\/\/en\.wikipedia\.org\/wiki\/(.+)$/);
  if (!m) return null;
  const title = decodeURIComponent(m[1]);
  const page = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=name&titles=${encodeURIComponent(title)}`,
    { headers: UA, signal: AbortSignal.timeout(10_000) },
  ).then((r) => r.json());
  const name = (Object.values(page?.query?.pages ?? {})[0] as { pageimage?: string } | undefined)?.pageimage;
  if (!name) return null;
  const info = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&titles=${encodeURIComponent(`File:${name}`)}`,
    { headers: UA, signal: AbortSignal.timeout(10_000) },
  ).then((r) => r.json());
  const ii = (Object.values(info?.query?.pages ?? {})[0] as { imageinfo?: { thumburl?: string; extmetadata?: Record<string, { value?: string }> }[] } | undefined)
    ?.imageinfo?.[0];
  const meta = ii?.extmetadata ?? {};
  const licence = strip(meta.LicenseShortName?.value ?? "");
  // Not on Commons (a local, non-free file) or not a free licence: no photo.
  if (!ii?.thumburl || !FREE.test(licence) || meta.NonFree?.value) return null;
  const artist = strip(meta.Artist?.value ?? "").slice(0, 60) || "Wikimedia Commons";
  return { url: ii.thumburl, credit: `${artist} (${licence})` };
}

/** Cached for a week; null when there is no free photo. */
export async function driverPhoto(wiki: string | null): Promise<DriverPhoto | null> {
  if (!wiki) return null;
  try {
    return await unstable_cache(() => lookup(wiki), ["driver-photo-v2", wiki], { revalidate: 7 * 86400 })();
  } catch {
    return null;
  }
}
