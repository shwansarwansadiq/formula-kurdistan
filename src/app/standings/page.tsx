import type { Metadata } from "next";
import { DriverGrid, DriverTable, TeamTable } from "@/components/F1Parts";
import { Masthead } from "@/components/Masthead";
import { DataCredit, DataGap, SiteFooter } from "@/components/StoryParts";
import { getDriverStandings, getTeamStandings } from "@/lib/f1data";
import { ku } from "@/lib/site";

export const revalidate = 600;
export const metadata: Metadata = { title: "ڕیزبەندی · FORMULAK", description: "ڕیزبەندیی شۆفێران و تیمەکان لە وەرزی ئێستای فۆڕمولا ١." };

export default async function StandingsPage() {
  const [drivers, teams] = await Promise.all([getDriverStandings(), getTeamStandings()]);
  return (
    <>
      <Masthead active="standings" />
      <main id="main">
        <section className="sec black">
          <div className="sec-in">
            <h1 className="page-title">ڕیزبەندیی وەرزی {drivers ? ku(drivers.season) : ""}</h1>
            {drivers ? <p className="lede">لە دوای خولی {ku(drivers.round)}</p> : null}
            {drivers ? <DriverGrid rows={drivers.rows.slice(0, 2)} /> : <DataGap />}
          </div>
        </section>
        <section className="sec">
          <div className="sec-in two">
            <div id="drivers">
              <h2>پاڵەوانێتی شۆفێران</h2>
              {drivers ? <DriverTable rows={drivers.rows} /> : <DataGap />}
            </div>
            <div id="teams">
              <h2>پاڵەوانێتی تیمەکان</h2>
              {teams ? <TeamTable rows={teams.rows} /> : <DataGap />}
            </div>
          </div>
          <div className="sec-in"><DataCredit /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
