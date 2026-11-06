import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lat, ResultTable, SESSION_LABEL } from "@/components/F1Parts";
import { Masthead } from "@/components/Masthead";
import { DataCredit, SiteFooter } from "@/components/StoryParts";
import { Countdown } from "@/components/Countdown";
import { getQualifying, getRaceResults, getSchedule, getSprint } from "@/lib/f1data";
import { fullName, nextSession } from "@/lib/f1parse";
import { ku, soraniDate, soraniTime } from "@/lib/site";
import Link from "next/link";

export const revalidate = 600;

type Params = { params: Promise<{ round: string }> };

async function find(round: string) {
  if (!/^\d{1,2}$/.test(round)) return null;
  return (await getSchedule()).find((r) => r.round === Number(round)) ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const race = await find((await params).round);
  return race ? { title: `${race.name} · FORMULAK` } : {};
}

export default async function RacePage({ params }: Params) {
  const race = await find((await params).round);
  if (!race) notFound();
  const [results, quali, sprint, schedule] = await Promise.all([
    getRaceResults(race.round),
    getQualifying(race.round),
    race.sessions.some((s) => s.key === "Sprint") ? getSprint(race.round) : Promise.resolve([]),
    getSchedule(),
  ]);
  const next = nextSession(schedule, new Date());
  const live = next?.race.round === race.round ? next.session : null;

  return (
    <>
      <Masthead active="calendar" />
      <main id="main">
        <section className="sec black racehead">
          <div className="sec-in">
            <h1 className="page-title lat" dir="ltr">{race.name}</h1>
            <p className="lede">
              خولی {ku(race.round)}، {lat(race.circuit)}، {lat(`${race.locality}, ${race.country}`)}
            </p>
            {live ? (
              <div className="racecount">
                <p>{SESSION_LABEL[live.key]} دەست پێ دەکات لە</p>
                <Countdown iso={live.iso} />
              </div>
            ) : null}
          </div>
        </section>
        <section className="sec">
          <div className="sec-in two">
            <div>
              <h2>کاتەکان</h2>
              <ol className="sessions">
                {race.sessions.map((s) => (
                  <li key={s.key} className={live?.key === s.key ? "now" : undefined}>
                    <b>{SESSION_LABEL[s.key]}</b>
                    <span>{soraniDate(s.iso)}</span>
                    <span className="at">{soraniTime(s.iso)}</span>
                  </li>
                ))}
              </ol>
            </div>
            {quali.length ? (
              <div>
                <h2>خولی هەڵبژاردن</h2>
                <div className="tblwrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">پلە</th>
                        <th scope="col" className="wide">شۆفێر</th>
                        <th scope="col" className="num">باشترین کات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quali.map((q) => (
                        <tr key={q.driver.id}>
                          <td className="pos">{ku(q.position)}</td>
                          <td>
                            <Link href={`/drivers/${q.driver.id}`} className="tname lat">{fullName(q.driver)}</Link>
                            <span className="tsub lat">{q.team.name}</span>
                          </td>
                          <td className="num"><bdi className="lat">{q.q3 ?? q.q2 ?? q.q1 ?? ""}</bdi></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
          {results.length ? (
            <div className="sec-in result-block">
              <h2>ئەنجامی پێشبڕکێ</h2>
              <ResultTable rows={results} />
            </div>
          ) : (
            <div className="sec-in"><p className="gap">ئەنجامی ئەم پێشبڕکێیە هێشتا نییە.</p></div>
          )}
          {sprint.length ? (
            <div className="sec-in result-block">
              <h2>ئەنجامی سپرینت</h2>
              <ResultTable rows={sprint} />
            </div>
          ) : null}
          <div className="sec-in"><DataCredit /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
