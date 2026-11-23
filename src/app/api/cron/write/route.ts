import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { backfillPhotos, scoreNew, writeBest } from "@/lib/writer";
import { learnFromEdits } from "@/lib/lessons";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const scored = await scoreNew();
  const result = await writeBest();
  // Stories written before photos were collected get their source photo too.
  const photos = await backfillPhotos(5).catch(() => 0);
  // Shwan's latest edits become lessons waiting for his approval.
  const lessons = await learnFromEdits().catch((e) => (console.error("lessons failed", e), 0));
  return NextResponse.json({ ok: true, scored, ...result, photos, lessons });
}
