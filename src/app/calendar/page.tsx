import type { Metadata } from "next";
import Link from "next/link";
import { lat, NextSession } from "@/components/F1Parts";
import { Masthead } from "@/components/Masthead";
import { DataCredit, DataGap, SiteFooter } from "@/components/StoryParts";
import { getSchedule, getWinners } from "@/lib/f1data";
import { fullName, nextSession } from "@/lib/f1parse";
import { ku, soraniDate } from "@/lib/site";

export const revalidate = 600;
export const metadata: Metadata = { title: "ڕۆژژمێر · FORMULAK", description: "هەموو پێشبڕکێکانی وەرزی ئێستای فۆڕمولا ١ بە کاتی هەولێر." };

export default async function CalendarPage() {
  const [schedule, winners] = await Promise.all([getSchedule(), getWinners()]);
  const now = new Date();
  const next = nextSession(schedule, now);
  return (
    <>
      <Masthead active="calendar" />
      {next ? <NextSession race={next.race} session={next.session} /> : null}
      <main id="main">
        <section className="sec">
          <div className="sec-in">
            <h1 className="page-title">ڕۆژژمێری وەرزی {schedule[0] ? ku(schedule[0].season) : ""}</h1>
            {schedule.length ? (
              <div className="grid2 rounds">
                {schedule.map((r) => {
                  const winner = winners.get(r.round);
                  const isNext = next?.race.round === r.round;
                  return (
                    <Link key={r.round} href={`/race/${r.round}`} className={isNext ? "slot round now" : "slot round"} aria-current={isNext ? "true" : undefined}>
                      <span className="round-n">خولی {ku(r.round)}</span>
                      <b className="lat">{r.name}</b>
                      <span className="round-at lat">{r.locality}, {r.country}</span>
                      <span className="round-date">{soraniDate(r.raceIso, false)}</span>
                      {winner ? <span className="round-win">براوە: {lat(fullName(winner.driver))}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <DataGap />
            )}
            <DataCredit />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
