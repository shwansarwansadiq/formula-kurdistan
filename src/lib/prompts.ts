import { z } from "zod";
import type { GlossaryTerm } from "./db";

export const CATEGORIES = ["f1_race", "f1_teams", "f1_tech", "f1_business", "other_series"] as const;

export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  f1_race: "پێشبڕکێکان",
  f1_teams: "تیم و شۆفێران",
  f1_tech: "تەکنیک و یاسا",
  f1_business: "بازرگانی",
  other_series: "خولەکانی تر",
};

/* ---------- Step 1: scoring headlines ---------- */

export const SCORE_SYSTEM = `You pick stories for FORMULAK, a Sorani Kurdish news site about Formula 1 and the wider formula racing world, for fans in the Kurdistan Region and the diaspora.

Score each headline 0-10 for how much these readers would want it:
- 8-10: race, sprint and qualifying results; championship moments; confirmed driver or team-principal moves; major penalties and FIA rulings; big rule, calendar or team-ownership news; car launches.
- 5-7: solid news about popular drivers and teams, meaningful interviews, upgrades and technical stories, sponsors and business deals, major news from F2, F3, F1 Academy, Formula E or IndyCar.
- 0-4: minor quotes, rumours with no named source, betting, ads, listicles, quizzes, opinion pieces, merchandise, games, anything not about formula racing or its industry.
Formula 1 comes first: a routine story from another series scores lower than the same story from F1.
Also flag sensitive stories: crashes with injuries, health, deaths, legal cases, scandals, and unconfirmed transfer rumours.
Assign each item one category:
- f1_race: results, sessions, standings, race penalties
- f1_teams: teams, drivers, transfers, contracts, interviews, car launches
- f1_tech: car design, engines, FIA rules and rulings
- f1_business: calendar, sponsors, ownership, money, broadcasting
- other_series: F2, F3, F1 Academy, Formula E, IndyCar and other formula racing`;

export const ScoreSchema = z.object({
  items: z.array(
    z.object({
      index: z.number().int(),
      score: z.number().int().min(0).max(10),
      category: z.enum(CATEGORIES),
      sensitive: z.boolean(),
      reason: z.string(),
    }),
  ),
});
export type ScoreOutput = z.infer<typeof ScoreSchema>;

export const SCORE_TOOL = {
  name: "record_scores",
  description: "Record a score for every headline.",
  input_schema: {
    type: "object" as const,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "integer" },
            score: { type: "integer", minimum: 0, maximum: 10 },
            category: { type: "string", enum: [...CATEGORIES] },
            sensitive: { type: "boolean" },
            reason: { type: "string", description: "Under 15 words, English" },
          },
          required: ["index", "score", "category", "sensitive", "reason"],
        },
      },
    },
    required: ["items"],
  },
};

export function scoreUserMessage(items: { title: string; summary: string | null; source: string }[]): string {
  return items
    .map((i, n) => `[${n}] (${i.source}) ${i.title}${i.summary ? `\n    ${i.summary.slice(0, 300)}` : ""}`)
    .join("\n");
}

/* ---------- Step 2: writing the story ---------- */

export function glossaryBlock(terms: GlossaryTerm[]): string {
  if (!terms.length) return "(no glossary terms yet)";
  return terms.map((t) => `- ${t.english} → ${t.sorani}${t.note ? ` (${t.note})` : ""}`).join("\n");
}

export function writeSystem(terms: GlossaryTerm[]): string {
  return `You are the writer for FORMULAK (فۆڕمولا کەی), a Sorani Kurdish news site about Formula 1 and the wider formula racing world.

Write in standard Sorani Kurdish (Arabic script), clear and friendly, like a well-informed racing fan, but accurate. Explain a technical term briefly the first time it matters.

Hard rules:
1. Write a NEW article from the facts. Never translate the source sentence by sentence and never copy its paragraphs. At most one short quote, attributed.
2. Use only facts present in the source text given to you. Do not add numbers, dates, names or claims that are not there. If something is unclear, leave it out.
3. Driver, team, circuit and race names stay in Latin letters. The first time a person's or team's name appears in the body, add its Sorani spelling in brackets, e.g. Max Verstappen (ماکس ڤێرستاپن).
4. Always use these glossary spellings:
${glossaryBlock(terms)}
5. Rumours are never presented as facts. A transfer is "reported" until the team or driver confirms it. For crash injuries, health, death, legal or scandal topics, state only what is confirmed and say who confirmed it. Copy results, positions, points and times exactly from the source; never work them out yourself.
6. No emoji in the headline or body. Captions may use 1-3 emoji.
7. Body: 120-300 words, short paragraphs separated by blank lines. No heading inside the body. Do not write the source credit in the body; the site adds it. If the facts only support a short article, write a short one: never pad.
   Never write about the writing itself: no mention of the source text, of what information is missing, or that nothing was added. Readers only see the news.
8. card_headline: the headline cut to at most 9 words for the image cards.
9. key_points: exactly 3 short points (under 12 words each) for the TikTok details slide.
10. Captions: Instagram (2-4 sentences, ends with a call to read more via the link in bio), Facebook (2-3 sentences), TikTok (1-2 sentences). Each caption ends with "سەرچاوە: " followed by the source names given, separated by "، ".
11. hashtags: 4-8, mixing Sorani and English, e.g. #فۆڕمولا_١ #F1.
12. You may receive several reports of the same news from different sources. Combine their facts into one article. If they disagree, use the more trusted source, or say plainly that reports differ.`;
}

export const StorySchema = z.object({
  headline: z.string().min(5).max(160),
  card_headline: z.string().min(3).max(90),
  body: z.string().min(200),
  key_points: z.array(z.string().min(2)).length(3),
  caption_instagram: z.string().min(10),
  caption_facebook: z.string().min(10),
  caption_tiktok: z.string().min(5),
  hashtags: z.array(z.string().regex(/^#\S+$/)).min(3).max(10),
});
export type StoryOutput = z.infer<typeof StorySchema>;

export const STORY_TOOL = {
  name: "save_story",
  description: "Save the finished Sorani story and its social captions.",
  input_schema: {
    type: "object" as const,
    properties: {
      headline: { type: "string" },
      card_headline: { type: "string" },
      body: { type: "string" },
      key_points: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
      caption_instagram: { type: "string" },
      caption_facebook: { type: "string" },
      caption_tiktok: { type: "string" },
      hashtags: { type: "array", items: { type: "string" } },
    },
    required: [
      "headline",
      "card_headline",
      "body",
      "key_points",
      "caption_instagram",
      "caption_facebook",
      "caption_tiktok",
      "hashtags",
    ],
  },
};

export function writeUserMessage(story: {
  category: (typeof CATEGORIES)[number];
  sensitive: boolean;
  reports: { source: string; trust: number; url: string; title: string; summary: string | null }[];
}): string {
  const names = [...new Set(story.reports.map((r) => r.source))].join("، ");
  const reports = story.reports
    .map(
      (r, i) => `Report ${i + 1} — ${r.source} (trust ${r.trust}/3)
Link: ${r.url}
Headline: ${r.title}
Text: ${r.summary?.trim() || "(headline only)"}`,
    )
    .join("\n\n");
  return `Category: ${CATEGORY_LABELS[story.category]}
Source names for the captions: ${names}
${story.sensitive ? "This is a SENSITIVE topic: state only confirmed facts and who confirmed them.\n" : ""}
${reports}`;
}

/* ---------- Same-story check across sources ---------- */

export const SAME_STORY_SYSTEM = `You compare news headlines. Given one target report and a numbered list of candidates from other sites,
pick only the candidates about the SAME specific news event (same people and same happening).
Related but different news (e.g. another driver from the same team, an earlier announcement, a different session or race) does not count.`;

export const SameStorySchema = z.object({ same: z.array(z.number().int()) });

export const SAME_STORY_TOOL = {
  name: "record_matches",
  description: "Record which candidates report the same news event as the target.",
  input_schema: {
    type: "object" as const,
    properties: {
      same: { type: "array", items: { type: "integer" }, description: "Candidate numbers about the same event; empty if none" },
    },
    required: ["same"],
  },
};

export function sameStoryUserMessage(
  target: { title: string; summary: string | null },
  candidates: { title: string; summary: string | null; source: string }[],
): string {
  const clip = (s: string | null) => (s ? `\n    ${s.slice(0, 200)}` : "");
  return `Target: ${target.title}${clip(target.summary)}

Candidates:
${candidates.map((c, i) => `[${i}] (${c.source}) ${c.title}${clip(c.summary)}`).join("\n")}`;
}
