import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { DataCredit, SiteFooter } from "@/components/StoryParts";
import { getDriver, getDriverHistory, getDriverSeason, getDriverStandings } from "@/lib/f1data";
import { fullName } from "@/lib/f1parse";
import { ku, soraniDate } from "@/lib/site";

export const revalidate = 600;
type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = await getDriver((await params).id);
  return d ? { title: `${fullName(d)} · FORMULAK` } : {};
}

export default async function DriverPage({ params }: Params) {
  const { id } = await params;
  const driver = await getDriver(id);
  if (!driver) notFound();
  const [season, history, standings] = await Promise.all([getDriverSeason(id), getDriverHistory(id), getDriverStandings()]);
  const now = standings?.rows.find((r) => r.driver.id === id);
  const team = now?.teams.at(-1);

  return (
    <>
      <Masthead active="drivers" />
      <main id="main">
        <section className="sec black profile">
          <div className="sec-in">
            {driver.number ? <span className="bignum lat" aria-hidden="true">{driver.number}</span> : null}
            <h1 className="page-title lat" dir="ltr">{fullName(driver)}</h1>
            {team ? <p className="lede"><Link href={`/teams/${team.id}`} className="lat under">{team.name}</Link></p> : null}
            <dl className="facts">
              {now ? (
                <>
                  <div><dt>پلە</dt><dd>{ku(now.position)}</dd></div>
                  <div><dt>خاڵ</dt><dd>{ku(now.points)}</dd></div>
                  <div><dt>بردنەوە</dt><dd>{ku(now.wins)}</dd></div>
                </>
              ) : null}
              {driver.number ? <div><dt>ژمارە</dt><dd>{ku(driver.number)}</dd></div> : null}
              {driver.nationality ? <div><dt>ڕەگەزنامە</dt><dd className="lat small">{driver.nationality}</dd></div> : null}
              {driver.birth ? <div><dt>لەدایکبوون</dt><dd className="small">{soraniDate(driver.birth, false)} {ku(driver.birth.slice(0, 4))}</dd></div> : null}
            </dl>
          </div>
        </section>
        <section className="sec">
          <div className="sec-in two">
            <div>
              <h2>ئەنجامەکانی ئەم وەرزە</h2>
              {season.length ? (
                <div className="tblwrap">
                  <table className="tbl">
                    <thead>
                      <tr><th scope="col">خول</th><th scope="col" className="wide">پێشبڕکێ</th><th scope="col" className="num">پلە</th><th scope="col" className="num">خاڵ</th></tr>
                    </thead>
                    <tbody>
                      {season.map((r) => (
                        <tr key={r.round}>
                          <td className="pos">{ku(r.round)}</td>
                          <td><Link href={`/race/${r.round}`} className="tname lat">{r.race}</Link></td>
                          <td className="num">{ku(r.positionText)}</td>
                          <td className="num strong">{ku(r.points)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="gap">ئەنجامی ئەم وەرزە نییە.</p>}
            </div>
            <div>
              <h2>وەرز بە وەرز</h2>
              {history.length ? (
                <div className="tblwrap">
                  <table className="tbl">
                    <thead>
                      <tr><th scope="col">وەرز</th><th scope="col" className="wide">تیم</th><th scope="col" className="num">پلە</th><th scope="col" className="num">خاڵ</th></tr>
                    </thead>
                    <tbody>
                      {history.map((r) => (
                        <tr key={r.season}>
                          <td className="pos">{ku(r.season)}</td>
                          <td><span className="tname lat">{r.team}</span></td>
                          <td className="num">{ku(r.position)}</td>
                          <td className="num strong">{ku(r.points)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="gap">مێژووی وەرزەکان نییە.</p>}
            </div>
          </div>
          <div className="sec-in"><DataCredit /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
