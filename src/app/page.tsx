import Link from "next/link";
import { DriverGrid, lat, NextSession, ResultTable, TeamTable } from "@/components/F1Parts";
import { Masthead } from "@/components/Masthead";
import { CategoryNav, DataCredit, DataGap, NewsGrid, SiteFooter, StorySlot } from "@/components/StoryParts";
import { getDriverStandings, getRaceResults, getSchedule, getTeamStandings } from "@/lib/f1data";
import { lastRace, nextSession } from "@/lib/f1parse";
import { ku, publishedStories } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stories, schedule, drivers, teams] = await Promise.all([publishedStories({ limit: 21 }), getSchedule(), getDriverStandings(), getTeamStandings()]);
  const now = new Date();
  const next = nextSession(schedule, now);
  const last = lastRace(schedule, now);
  const results = last ? await getRaceResults(last.round) : [];
  const [lead, second, ...rest] = stories;

  return (
    <>
      <Masthead active="news" />
      {next ? <NextSession race={next.race} session={next.session} big={!lead} /> : null}
      <main id="main">
        {lead ? (
          <section className="front">
            <div className="front-grid">
              <StorySlot story={lead} lead />
              {second ? <StorySlot story={second} /> : null}
            </div>
          </section>
        ) : (
          <p className="soon">یەکەم هەواڵەکان بەم زووانە بڵاو دەکرێنەوە. تا ئەو کاتە، ڕیزبەندی و ئەنجامەکان لێرەن.</p>
        )}

        {rest.length ? (
          <section className="sec" aria-labelledby="latest">
            <div className="sec-in">
              <h2 id="latest">نوێترین هەواڵ</h2>
              <CategoryNav />
              <NewsGrid stories={rest} />
            </div>
          </section>
        ) : null}

        <section className="sec black" aria-labelledby="table">
          <div className="sec-in">
            <h2 id="table">{drivers ? <>ڕیزبەندیی شۆفێران لە دوای خولی {ku(drivers.round)}</> : "ڕیزبەندیی شۆفێران"}</h2>
            {drivers ? <DriverGrid rows={drivers.rows.slice(0, 8)} /> : <DataGap />}
            <Link href="/standings" className="more">هەموو ڕیزبەندییەکە ببینە</Link>
          </div>
        </section>

        <section className="sec" aria-label="ئەنجام و تیمەکان">
          <div className="sec-in two">
            <div>
              <h2>ئەنجامی {last ? lat(last.name) : "دوایین پێشبڕکێ"}</h2>
              {results.length ? <ResultTable rows={results} limit={5} /> : <DataGap />}
              {last ? <Link href={`/race/${last.round}`} className="more">هەموو ئەنجامەکان</Link> : null}
            </div>
            <div>
              <h2>پاڵەوانێتی تیمەکان</h2>
              {teams ? <TeamTable rows={teams.rows.slice(0, 5)} /> : <DataGap />}
              <Link href="/standings#teams" className="more">هەموو تیمەکان</Link>
            </div>
          </div>
          <div className="sec-in"><DataCredit /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
