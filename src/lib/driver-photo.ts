/* A driver's photo for result cards (Shwan, 6 Nov): from the current season only, the driver alone in a racing
   suit, free licence only (Wikimedia Commons), credited. Official F1 profile photos are not free to use, so they
   are never taken. A small vision check confirms the racing suit; with no match the card shows the K instead. */
import { unstable_cache } from "next/cache";
import { ai, SCORE_MODEL } from "./writer";

export type DriverPhoto = { url: string; credit: string };

const UA = { "User-Agent": "FORMULAK/1.0 (https://formulak.news)" };
const FREE = /^(cc[ -]?by|cc0|public domain|pd\b|ogl)/i; // OGL: UK Open Government Licence, free with credit
const strip = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

type Candidate = { title: string; url: string; credit: string };

export async function candidates(name: string, season: string): Promise<Candidate[]> {
  const q = `"${name}" ${season} filetype:bitmap`;
  const j = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=40&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=900`,
    { headers: UA, signal: AbortSignal.timeout(12_000) },
  ).then((r) => r.json());
  type Info = { thumburl?: string; width?: number; height?: number; extmetadata?: Record<string, { value?: string }> };
  const pages = Object.values(j?.query?.pages ?? {}) as { title: string; index?: number; imageinfo?: Info[] }[];
  const family = name.split(" ").at(-1)!.toLowerCase();
  return pages
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .flatMap((p) => {
      const ii = p.imageinfo?.[0];
      const m = ii?.extmetadata ?? {};
      const licence = strip(m.LicenseShortName?.value ?? "");
      const taken = strip(m.DateTimeOriginal?.value ?? "");
      // This season's photos only, free, big enough, and named after this driver.
      if (!ii?.thumburl || !FREE.test(licence) || m.NonFree?.value) return [];
      if (!taken.startsWith(season) || (ii.width ?? 0) < 900 || !p.title.toLowerCase().includes(family)) return [];
      const artist = strip(m.Artist?.value ?? "").slice(0, 60) || "Wikimedia Commons";
      return [{ title: p.title, url: ii.thumburl, credit: `${artist} (${licence})` }];
    });
}

/** Asks the vision model whether the photo shows this driver alone, face visible, in a racing suit. */
/** The model's raw answer, for the admin debug view. */
export async function suitAnswer(url: string): Promise<string> {
  // Sent as bytes: Wikimedia refuses some automated fetchers, so we download it ourselves with our user agent.
  const img = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15_000) });
  if (!img.ok) throw new Error(`photo ${img.status}`);
  const type = img.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) return false;
  const data = Buffer.from(await img.arrayBuffer()).toString("base64");
  const res = await ai().messages.create({
    model: SCORE_MODEL,
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: type as "image/jpeg", data } },
          { type: "text", text: "Is this one person (not a group, not only a car), face clearly visible, wearing a motor racing suit (fireproof overalls)? Answer only yes or no." },
        ],
      },
    ],
  });
  return res.content.map((c) => (c.type === "text" ? c.text : "")).join("").toLowerCase().trim();
}

const inRacingSuit = async (url: string) => (await suitAnswer(url)).startsWith("yes");

/** Titles that usually mean a person, not a car on track, are checked first. */
const PERSON = /award|celebrat|podium|walk|parade|portrait|driver|press|interview|paddock|garage|helmet|grid|fans/i;

async function lookup(name: string, season: string): Promise<DriverPhoto | null> {
  const list = await candidates(name, season);
  const ordered = [...list.filter((c) => PERSON.test(c.title)), ...list.filter((c) => !PERSON.test(c.title))];
  for (const c of ordered.slice(0, 12)) {
    try {
      if (await inRacingSuit(c.url)) return { url: c.url, credit: c.credit };
    } catch (e) {
      console.error("driver photo check failed", c.title, e);
    }
  }
  return null;
}

/** Cached for a week per driver and season; null when no photo meets the rule. */
export async function driverPhoto(name: string, season: string): Promise<DriverPhoto | null> {
  if (!name.trim() || !/^\d{4}$/.test(season)) return null;
  try {
    return await unstable_cache(() => lookup(name, season), ["driver-photo-v4", name, season], { revalidate: 7 * 86400 })();
  } catch {
    return null;
  }
}
