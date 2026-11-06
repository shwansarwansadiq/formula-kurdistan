import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminToken } from "@/lib/admin-auth";
import { candidates, suitAnswer } from "@/lib/driver-photo";

export const maxDuration = 120;

/** Admin only: which photos a driver search finds and what the racing-suit check says about each. */
export async function GET(req: Request) {
  if (!(await isAdminToken((await cookies()).get(ADMIN_COOKIE)?.value))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const name = u.searchParams.get("name") ?? "";
  const season = u.searchParams.get("season") ?? "";
  const list = await candidates(name, season).catch((e: unknown) => String(e));
  if (typeof list === "string") return NextResponse.json({ error: list });
  const checked = [];
  for (const c of list.slice(0, 4)) checked.push({ title: c.title, answer: await suitAnswer(c.url).catch((e: unknown) => `error: ${e instanceof Error ? e.message : e}`) });
  return NextResponse.json({ found: list.length, checked });
}
