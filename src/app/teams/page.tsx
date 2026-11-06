import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { DataCredit, DataGap, SiteFooter } from "@/components/StoryParts";
import { getDriverStandings, getTeamStandings } from "@/lib/f1data";
import { ku } from "@/lib/site";

export const revalidate = 600;
export const metadata: Metadata = { title: "تیمەکان · FORMULAK", description: "تیمەکانی وەرزی ئێستای فۆڕمولا ١." };

export default async function TeamsPage() {
  const [teams, drivers] = await Promise.all([getTeamStandings(), getDriverStandings()]);
  return (
    <>
      <Masthead active="teams" />
      <main id="main">
        <section className="sec black">
          <div className="sec-in">
            <h1 className="page-title">تیمەکانی وەرزی {teams ? ku(teams.season) : ""}</h1>
            {teams ? (
              <div className="grid2 onblack">
                {teams.rows.map((t) => (
                  <Link key={t.team.id} href={`/teams/${t.team.id}`} className="slot car">
                    <span className="car-pos">{ku(t.position)}</span>
                    <span className="car-name lat">{t.team.name}</span>
                    <span className="car-team lat">
                      {drivers?.rows.filter((d) => d.teams.at(-1)?.id === t.team.id).map((d) => d.driver.family).join(", ")}
                    </span>
                    <span className="car-pts">{ku(t.points)} <small>خاڵ</small></span>
                  </Link>
                ))}
              </div>
            ) : <DataGap />}
            <DataCredit />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
