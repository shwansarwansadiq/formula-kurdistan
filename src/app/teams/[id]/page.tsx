import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DriverGrid } from "@/components/F1Parts";
import { Masthead } from "@/components/Masthead";
import { DataCredit, SiteFooter } from "@/components/StoryParts";
import { getDriverStandings, getTeam, getTeamHistory, getTeamStandings } from "@/lib/f1data";
import { ku } from "@/lib/site";

export const revalidate = 600;
type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = await getTeam((await params).id);
  return t ? { title: `${t.name} · FORMULAK` } : {};
}

export default async function TeamPage({ params }: Params) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();
  const [history, standings, drivers] = await Promise.all([getTeamHistory(id), getTeamStandings(), getDriverStandings()]);
  const now = standings?.rows.find((r) => r.team.id === id);
  const lineup = drivers?.rows.filter((d) => d.teams.at(-1)?.id === id) ?? [];

  return (
    <>
      <Masthead active="teams" />
      <main id="main">
        <section className="sec black profile">
          <div className="sec-in">
            <h1 className="page-title huge lat" dir="ltr">{team.name}</h1>
            <dl className="facts">
              {now ? (
                <>
                  <div><dt>پلە</dt><dd>{ku(now.position)}</dd></div>
                  <div><dt>خاڵ</dt><dd>{ku(now.points)}</dd></div>
                  <div><dt>بردنەوە</dt><dd>{ku(now.wins)}</dd></div>
                </>
              ) : null}
              {team.nationality ? <div><dt>ڕەگەزنامە</dt><dd className="lat small">{team.nationality}</dd></div> : null}
            </dl>
            {lineup.length ? (
              <>
                <h2 className="after">شۆفێرانی تیم</h2>
                <DriverGrid rows={lineup} />
              </>
            ) : null}
          </div>
        </section>
        <section className="sec">
          <div className="sec-in">
            <h2>وەرز بە وەرز</h2>
            {history.length ? (
              <div className="tblwrap">
                <table className="tbl">
                  <thead>
                    <tr><th scope="col">وەرز</th><th scope="col" className="num wide">پلە</th><th scope="col" className="num">بردنەوە</th><th scope="col" className="num">خاڵ</th></tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.season}>
                        <td className="pos">{ku(r.season)}</td>
                        <td className="num">{ku(r.position)}</td>
                        <td className="num">{ku(r.wins)}</td>
                        <td className="num strong">{ku(r.points)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="gap">مێژووی وەرزەکان نییە.</p>}
            <p><Link href="/teams" className="more">هەموو تیمەکان</Link></p>
            <DataCredit />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
