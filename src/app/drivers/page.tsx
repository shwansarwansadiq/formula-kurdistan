import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { DataCredit, DataGap, SiteFooter } from "@/components/StoryParts";
import { getDriverStandings } from "@/lib/f1data";
import { ku } from "@/lib/site";

export const revalidate = 600;
export const metadata: Metadata = { title: "شۆفێران · FORMULAK", description: "شۆفێرانی وەرزی ئێستای فۆڕمولا ١." };

export default async function DriversPage() {
  const standings = await getDriverStandings();
  return (
    <>
      <Masthead active="drivers" />
      <main id="main">
        <section className="sec black">
          <div className="sec-in">
            <h1 className="page-title">شۆفێرانی وەرزی {standings ? ku(standings.season) : ""}</h1>
            {standings ? (
              <div className="grid2 onblack">
                {standings.rows.map((r) => (
                  <Link key={r.driver.id} href={`/drivers/${r.driver.id}`} className="slot car">
                    <span className="car-pos">{r.driver.number ? ku(r.driver.number) : ""}</span>
                    <span className="car-name lat">{r.driver.family}</span>
                    <span className="car-full lat">{r.driver.given}</span>
                    <span className="car-team lat">{r.teams.at(-1)?.name}</span>
                  </Link>
                ))}
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
