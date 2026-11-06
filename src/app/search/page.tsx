import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { DataGap, NewsGrid, SiteFooter } from "@/components/StoryParts";
import { getDriverStandings, getSchedule, getTeamStandings } from "@/lib/f1data";
import { fullName, matches } from "@/lib/f1parse";
import { searchStories } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "گەڕان · FORMULAK", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 80);
  const ready = q.length >= 2;
  const [stories, drivers, teams, schedule] = ready
    ? await Promise.all([searchStories(q), getDriverStandings(), getTeamStandings(), getSchedule()])
    : [[], null, null, []];
  const hitDrivers = drivers?.rows.filter((r) => matches(q, fullName(r.driver), r.driver.code, r.driver.id)) ?? [];
  const hitTeams = teams?.rows.filter((r) => matches(q, r.team.name, r.team.id)) ?? [];
  const hitRaces = schedule.filter((r) => matches(q, r.name, r.circuit, r.locality, r.country));
  const none = ready && !stories.length && !hitDrivers.length && !hitTeams.length && !hitRaces.length;
  const dataMissing = ready && !drivers && !teams && !schedule.length;

  return (
    <>
      <Masthead active="search" />
      <main id="main">
        <section className="sec black">
          <div className="sec-in">
            <h1 className="page-title">گەڕان</h1>
            <form action="/search" role="search" className="searchbox">
              <label htmlFor="q">ناوی شۆفێر، تیم، پێشبڕکێ یان هەر وشەیەک لە هەواڵەکان</label>
              <div>
                <input id="q" name="q" type="search" defaultValue={q} enterKeyHint="search" autoComplete="off" />
                <button type="submit">بگەڕێ</button>
              </div>
            </form>
          </div>
        </section>
        {ready ? (
          <section className="sec">
            <div className="sec-in">
              {none ? <p className="gap">هیچ ئەنجامێک بۆ «<bdi>{q}</bdi>» نەدۆزرایەوە. بە ئینگلیزی ناوەکە تاقی بکەرەوە.</p> : null}
              {dataMissing ? <DataGap /> : null}
              {hitDrivers.length || hitTeams.length || hitRaces.length ? (
                <ul className="hits">
                  {hitDrivers.map((r) => (
                    <li key={r.driver.id}><Link href={`/drivers/${r.driver.id}`}><b className="lat">{fullName(r.driver)}</b><span>شۆفێر</span></Link></li>
                  ))}
                  {hitTeams.map((r) => (
                    <li key={r.team.id}><Link href={`/teams/${r.team.id}`}><b className="lat">{r.team.name}</b><span>تیم</span></Link></li>
                  ))}
                  {hitRaces.map((r) => (
                    <li key={r.round}><Link href={`/race/${r.round}`}><b className="lat">{r.name}</b><span>پێشبڕکێ</span></Link></li>
                  ))}
                </ul>
              ) : null}
              {stories.length ? (
                <>
                  <h2>هەواڵەکان</h2>
                  <NewsGrid stories={stories} />
                </>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
