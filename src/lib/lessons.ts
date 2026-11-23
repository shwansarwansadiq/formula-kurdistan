import { z } from "zod";
import { db } from "./db";
import { callTool, WRITE_MODEL } from "./writer";

/**
 * Learning from Shwan's edits (23 Nov). saveStory records what he changed; learnFromEdits turns a batch of changes
 * into short, general lessons; a lesson reaches the writer only after he approves it in /admin/lessons.
 * An approved spelling lesson ("term") goes into the glossary instead of the lesson list.
 */

export const EDIT_FIELDS = ["headline", "card_headline", "body", "key_points", "caption_instagram", "caption_facebook", "caption_tiktok"] as const;
type Field = (typeof EDIT_FIELDS)[number];

export type EditRow = { story_id: number; field: Field; before: string; after: string };

const asText = (v: unknown) => (Array.isArray(v) ? v.join("\n") : String(v ?? "")).trim();

/** The fields Shwan actually changed, comparing the stored story with what he saved. */
export function changedFields(id: number, old: Record<string, unknown>, next: Record<string, unknown>): EditRow[] {
  return EDIT_FIELDS.filter((f) => f in next && asText(old[f]) !== asText(next[f])).map((f) => ({
    story_id: id,
    field: f,
    before: asText(old[f]),
    after: asText(next[f]),
  }));
}

export async function recordEdits(rows: EditRow[]): Promise<void> {
  if (!rows.length) return;
  const { error } = await db().from("story_edits").insert(rows);
  if (error) console.error("recording edits failed", error);
}

export const LessonSchema = z.object({
  lessons: z
    .array(
      z.object({
        kind: z.enum(["rule", "term"]),
        rule: z.string().min(5).max(400),
        english: z.string().optional(),
        sorani: z.string().optional(),
        example: z.string().max(400).optional(),
      }),
    )
    .max(12),
});

const LESSON_TOOL = {
  name: "record_lessons",
  description: "Record the general lessons the writer should learn from the editor's changes.",
  input_schema: {
    type: "object" as const,
    properties: {
      lessons: {
        type: "array",
        items: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["rule", "term"], description: "term = how one word or name is spelled; rule = anything else" },
            rule: { type: "string", description: "The lesson in one or two short English sentences, as an instruction to the writer" },
            english: { type: "string", description: "term only: the English word or name" },
            sorani: { type: "string", description: "term only: the editor's Sorani spelling" },
            example: { type: "string", description: "A short before → after from the edit, in Sorani" },
          },
          required: ["kind", "rule"],
        },
      },
    },
    required: ["lessons"],
  },
};

const LESSON_SYSTEM = `You help the AI writer of FORMULAK, a Sorani Kurdish Formula 1 news site, learn from its human editor.
You get pairs of text the writer produced (BEFORE) and the editor's corrected version (AFTER).
Find what the editor changed that the writer should do differently in EVERY future story: spelling, word choice, grammar,
names, tone, length, structure, what to leave out. Ignore one-off factual fixes that only concern that story
(a wrong number, a typo in a single word that is otherwise spelled right), and ignore changes already covered by the
existing glossary or lessons given. Give each lesson once, generally, as a short instruction in English with a Sorani example.
A change to how one word or name is spelled is kind "term" with its English form and the editor's Sorani spelling.
If nothing general can be learned, return an empty list. Never invent a lesson the edits do not show.`;

const clip = (s: string, n = 2500) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** Turns unprocessed edits into pending lessons. Returns how many lessons were proposed. */
export async function learnFromEdits(limit = 15): Promise<number> {
  const { data, error } = await db()
    .from("story_edits")
    .select("id, field, before, after")
    .is("learned_at", null)
    .order("created_at")
    .limit(limit);
  if (error) throw error;
  const edits = (data ?? []) as { id: number; field: string; before: string; after: string }[];
  if (!edits.length) return 0;

  const [{ data: known }, { data: terms }] = await Promise.all([
    db().from("writer_lessons").select("rule").neq("status", "rejected"),
    db().from("glossary").select("english, sorani"),
  ]);
  const user = `Existing lessons (do not repeat):
${((known ?? []) as { rule: string }[]).map((l) => `- ${l.rule}`).join("\n") || "(none)"}

Glossary (already enforced):
${((terms ?? []) as { english: string; sorani: string }[]).map((t) => `- ${t.english} → ${t.sorani}`).join("\n")}

Edits:
${edits.map((e, i) => `#${i + 1} (${e.field})\nBEFORE:\n${clip(e.before)}\nAFTER:\n${clip(e.after)}`).join("\n\n")}`;

  const out = await callTool({
    model: WRITE_MODEL,
    system: LESSON_SYSTEM,
    user,
    tool: LESSON_TOOL,
    maxTokens: 3000,
    parse: (x) => LessonSchema.parse(x),
  });
  const rows = out.lessons
    .filter((l) => l.kind === "rule" || (l.english && l.sorani))
    .map((l) => ({ kind: l.kind, rule: l.rule, english: l.english ?? null, sorani: l.sorani ?? null, example: l.example ?? null }));
  if (rows.length) {
    const { error: insertError } = await db().from("writer_lessons").insert(rows);
    if (insertError) throw insertError;
  }
  await db().from("story_edits").update({ learned_at: new Date().toISOString() }).in("id", edits.map((e) => e.id));
  return rows.length;
}

/** Approved rule lessons, for the writer prompt. */
export async function approvedLessons(): Promise<string[]> {
  const { data } = await db().from("writer_lessons").select("rule, example").eq("kind", "rule").eq("status", "approved").order("id");
  return ((data ?? []) as { rule: string; example: string | null }[]).map((l) => (l.example ? `${l.rule} (e.g. ${l.example})` : l.rule));
}
