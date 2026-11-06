/* Session result cards: when qualifying, a sprint or a race has results at the source, make a top-3 card
   (feed and story) and leave it for Shwan in /admin/results. Nothing posts until he taps "post". Positions and
   times are copied from the source, never worked out. */
import { circuitNear } from "./circuits";
import { db } from "./db";
import { driverPhoto } from "./driver-photo";
import { getQualifying, getRaceResults, getSchedule, getSprint } from "./f1data";
import type { Race, SessionKey } from "./f1parse";
import { facebookFeed, facebookStory, instagramFeed, instagramStory, metaTargets } from "./meta";
import { renderPages } from "./render-card";
import { siteUrl } from "./site";

export const RESULT_SESSIONS = ["Qualifying", "Sprint", "Race"] as const;
export type ResultSession = (typeof RESULT_SESSIONS)[number];

export const RESULT_LABEL: Record<ResultSession, string> = {
  Qualifying: "خولی هەڵبژاردن",
  Sprint: "سپرینت",
  Race: "پێشبڕکێ",
};

export type Podium = { pos: string; name: string; given: string; code: string | null; team: string; time: string; photo: string | null; credit: string | null };
export type ResultData = {
  race: { name: string; round: number; season: string; circuit: string; locality: string; country: string; circuitId: string | null };
  session: ResultSession;
  sessionIso: string;
  podium: Podium[];
};
export type ResultCard = {
  id: number;
  season: string;
  round: number;
  session: ResultSession;
  status: string;
  data: ResultData;
  feed_url: string | null;
  story_url: string | null;
  post_result: string | null;
  created_at: string;
  posted_at: string | null;
};

/** One colour per host country, used for the circuit drawing. Not a flag: one colour only. */
const ACCENT: Record<string, string> = {
  Australia: "#FFCD00", China: "#FFDE00", Japan: "#FFFFFF", Bahrain: "#FFFFFF", "Saudi Arabia": "#00A651", USA: "#3C6FD8",
  "United States": "#3C6FD8", Italy: "#00A651", Monaco: "#FFFFFF", Spain: "#FFC400", Canada: "#FFFFFF", Austria: "#FFFFFF",
  UK: "#5B8BD9", "United Kingdom": "#5B8BD9", Belgium: "#FFD90C", Hungary: "#2EA05A", Netherlands: "#FF8C1A", Azerbaijan: "#22B5E6",
  Singapore: "#FFFFFF", Mexico: "#2EA05A", Brazil: "#FFDF00", Qatar: "#B8325C", UAE: "#2EA05A", "United Arab Emirates": "#2EA05A",
};
export const accentFor = (country: string) => ACCENT[country] ?? "#8A8A8A";

const SESSION_KEY: Record<ResultSession, SessionKey> = { Qualifying: "Qualifying", Sprint: "Sprint", Race: "Race" };
/** Results are looked for from 45 minutes after a session starts, for three days. */
const FROM_MS = 45 * 60_000;
const UNTIL_MS = 3 * 86_400_000;

type Row = Omit<Podium, "photo" | "credit"> & { wiki: string | null; driverId: string };

async function podium(race: Race, session: ResultSession): Promise<Row[]> {
  if (session === "Qualifying") {
    const rows = await getQualifying(race.round);
    return rows.slice(0, 3).map((r) => ({ pos: r.position, name: r.driver.family, given: r.driver.given, code: r.driver.code, team: r.team.name, time: r.q3 ?? r.q2 ?? r.q1 ?? "", wiki: r.driver.wiki, driverId: r.driver.id }));
  }
  const rows = session === "Sprint" ? await getSprint(race.round) : await getRaceResults(race.round);
  return rows.slice(0, 3).map((r) => ({ pos: r.positionText, name: r.driver.family, given: r.driver.given, code: r.driver.code, team: r.team.name, time: r.time ?? r.status ?? "", wiki: r.driver.wiki, driverId: r.driver.id }));
}

/** Sessions of the current calendar whose results may be in now. */
export function dueSessions(schedule: Race[], now: Date): { race: Race; session: ResultSession; iso: string }[] {
  const out: { race: Race; session: ResultSession; iso: string }[] = [];
  for (const race of schedule)
    for (const session of RESULT_SESSIONS) {
      const s = race.sessions.find((x) => x.key === SESSION_KEY[session]);
      if (!s) continue;
      const age = now.getTime() - new Date(s.iso).getTime();
      if (age >= FROM_MS && age <= UNTIL_MS) out.push({ race, session, iso: s.iso });
    }
  return out;
}

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 300);

/** Makes and renders the card for one session. Null when its results aren't in yet or a card already exists. */
export async function makeResultCard(race: Race, session: ResultSession, iso: string): Promise<number | null> {
  const { data: existing } = await db().from("result_cards").select("id").eq("season", race.season).eq("round", race.round).eq("session", session).maybeSingle();
  if (existing) return null;
  const rows = await podium(race, session);
  if (rows.length < 3) return null;
  const top: Podium[] = [];
  for (const r of rows) {
    const photo = await driverPhoto(`${r.given} ${r.name}`, race.season, r.driverId);
    top.push({ pos: r.pos, name: r.name, given: r.given, code: r.code, team: r.team, time: r.time, photo: photo?.url ?? null, credit: photo?.credit ?? null });
  }
  const shape = race.lat !== null && race.lng !== null ? circuitNear(race.lat, race.lng) : null;
  const data: ResultData = {
    race: { name: race.name, round: race.round, season: race.season, circuit: race.circuit, locality: race.locality, country: race.country, circuitId: shape?.id ?? null },
    session,
    sessionIso: iso,
    podium: top,
  };
  // Claim the session first (unique key), so two runs never make the same card.
  const { data: row, error } = await db().from("result_cards").insert({ season: race.season, round: race.round, session, data }).select("id").single();
  if (error || !row) return null;
  await renderResultCard(row.id);
  return row.id;
}

/** The publish job's pass: makes at most one new card per run. Returns its id, or null. */
export async function makeDueResultCard(now = new Date()): Promise<number | null> {
  for (const { race, session, iso } of dueSessions(await getSchedule(), now)) {
    const id = await makeResultCard(race, session, iso);
    if (id) return id;
  }
  return null;
}

/** Shwan asked for a card of the latest race that has started (for a session the job missed). */
export async function makeLatestRaceCard(session: ResultSession, now = new Date()): Promise<number | null> {
  const schedule = await getSchedule();
  const t = now.toISOString();
  for (const race of [...schedule].reverse()) {
    const s = race.sessions.find((x) => x.key === SESSION_KEY[session]);
    if (s && s.iso <= t) return makeResultCard(race, session, s.iso);
  }
  return null;
}

export async function renderResultCard(id: number): Promise<void> {
  const base = siteUrl();
  try {
    const [feed, story] = await renderPages([
      { url: `${base}/card/result/${id}?f=feed`, width: 1080, height: 1350, name: `result-${id}-feed` },
      { url: `${base}/card/result/${id}?f=story`, width: 1080, height: 1920, name: `result-${id}-story` },
    ]);
    await db().from("result_cards").update({ status: "pending", feed_url: feed, story_url: story }).eq("id", id);
  } catch (e) {
    await db().from("result_cards").update({ status: "failed", post_result: `render: ${msg(e)}` }).eq("id", id);
  }
}

export async function resultCard(id: number): Promise<ResultCard | null> {
  const { data } = await db().from("result_cards").select("*").eq("id", id).maybeSingle();
  return (data as ResultCard | null) ?? null;
}

export async function recentResultCards(limit = 20): Promise<ResultCard[]> {
  const { data } = await db().from("result_cards").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as ResultCard[];
}

export function resultCaption(d: ResultData): string {
  const medal = ["🥇", "🥈", "🥉"];
  const lines = d.podium.map((p, i) => `${medal[i]} ${p.given} ${p.name} (${p.team})${p.time ? ` ${p.time}` : ""}`);
  const credits = [...new Set(d.podium.map((p) => p.credit).filter(Boolean))];
  return [
    `ئەنجامی ${RESULT_LABEL[d.session]}ی ${d.race.name}`,
    "",
    ...lines,
    "",
    `هەموو ئەنجامەکان: formulak.news/race/${d.race.round}`,
    credits.length ? `📷 ${credits.join("، ")} · Wikimedia Commons` : "",
    "داتا: Jolpica F1",
    "",
    `#فۆڕمولا_١ #F1 #${d.race.name.replace(/[^A-Za-z]/g, "")} #فۆڕمولاکەی`,
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");
}

/** Shwan tapped "post": the feed card on Facebook and Instagram, the story card as a story on both. */
export async function postResultCard(id: number): Promise<string> {
  const card = await resultCard(id);
  if (!card || card.status !== "pending" || !card.feed_url || !card.story_url) return "not ready";
  // Claim it, so a double tap never posts twice.
  const { data: claimed } = await db().from("result_cards").update({ status: "posting" }).eq("id", id).eq("status", "pending").select("id");
  if (!claimed?.length) return "already posting";
  const out: string[] = [];
  try {
    const t = await metaTargets();
    const caption = resultCaption(card.data);
    for (const [name, post] of [
      ["facebook", () => facebookFeed(t, card.feed_url!, caption)],
      ["instagram", () => instagramFeed(t, card.feed_url!, caption)],
      ["facebook story", () => facebookStory(t, card.story_url!)],
      ["instagram story", () => instagramStory(t, card.story_url!)],
    ] as const) {
      try {
        await post();
        out.push(`${name}: ok`);
      } catch (e) {
        out.push(`${name}: ${msg(e)}`);
      }
    }
  } catch (e) {
    out.push(msg(e));
  }
  const ok = out.some((r) => r.endsWith(": ok"));
  await db()
    .from("result_cards")
    .update({ status: ok ? "posted" : "failed", post_result: out.join(" · "), posted_at: new Date().toISOString() })
    .eq("id", id);
  return out.join(" · ");
}
