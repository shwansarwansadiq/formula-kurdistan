import Link from "next/link";
import { fullName, type DriverStanding, type Race, type ResultRow, type Session, type SessionKey, type TeamStanding } from "@/lib/f1parse";
import { ku, soraniDate, soraniTime } from "@/lib/site";
import { Countdown } from "./Countdown";

export const SESSION_LABEL: Record<SessionKey, string> = {
  FirstPractice: "مەشقی یەکەم",
  SecondPractice: "مەشقی دووەم",
  ThirdPractice: "مەشقی سێیەم",
  SprintQualifying: "خولی هەڵبژاردنی سپرینت",
  Sprint: "سپرینت",
  Qualifying: "خولی هەڵبژاردن",
  Race: "پێشبڕکێ",
};

export const lat = (text: string) => <bdi className="lat">{text}</bdi>;

/** The live thing: what runs next and how long until it does. */
export function NextSession({ race, session, big = false }: { race: Race; session: Session; big?: boolean }) {
  return (
    <section className={big ? "next big" : "next"} aria-label="داهاتوو">
      <div className="next-in">
        <Link href={`/race/${race.round}`} className="next-what">
          <b className="lat">{race.name}</b>
          <span>
            {SESSION_LABEL[session.key]}، {soraniDate(session.iso)}، {soraniTime(session.iso)}
          </span>
        </Link>
        <Countdown iso={session.iso} />
      </div>
    </section>
  );
}

/** Top of the drivers' table, parked in staggered pairs as the grid would hold them. */
export function DriverGrid({ rows }: { rows: DriverStanding[] }) {
  return (
    <div className="grid2 onblack">
      {rows.map((r, i) => (
        <Link key={r.driver.id} href={`/drivers/${r.driver.id}`} className={i === 0 ? "slot car pole" : "slot car"}>
          <span className="car-pos">{ku(r.position)}</span>
          <span className="car-name lat">{r.driver.code ?? r.driver.family}</span>
          <span className="car-full lat">{fullName(r.driver)}</span>
          <span className="car-team lat">{r.teams.at(-1)?.name}</span>
          <span className="car-pts">
            {ku(r.points)} <small>خاڵ</small>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function DriverTable({ rows }: { rows: DriverStanding[] }) {
  return (
    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr>
            <th scope="col">پلە</th>
            <th scope="col" className="wide">شۆفێر</th>
            <th scope="col" className="num">بردنەوە</th>
            <th scope="col" className="num">خاڵ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.driver.id}>
              <td className="pos">{ku(r.position)}</td>
              <td>
                <Link href={`/drivers/${r.driver.id}`} className="tname lat">{fullName(r.driver)}</Link>
                <span className="tsub lat">{r.teams.at(-1)?.name}</span>
              </td>
              <td className="num">{ku(r.wins)}</td>
              <td className="num strong">{ku(r.points)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TeamTable({ rows }: { rows: TeamStanding[] }) {
  return (
    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr>
            <th scope="col">پلە</th>
            <th scope="col" className="wide">تیم</th>
            <th scope="col" className="num">بردنەوە</th>
            <th scope="col" className="num">خاڵ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team.id}>
              <td className="pos">{ku(r.position)}</td>
              <td>
                <Link href={`/teams/${r.team.id}`} className="tname lat">{r.team.name}</Link>
              </td>
              <td className="num">{ku(r.wins)}</td>
              <td className="num strong">{ku(r.points)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultTable({ rows, limit }: { rows: ResultRow[]; limit?: number }) {
  return (
    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr>
            <th scope="col">پلە</th>
            <th scope="col" className="wide">شۆفێر</th>
            <th scope="col" className="num">کات</th>
            <th scope="col" className="num">خاڵ</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, limit ?? rows.length).map((r) => (
            <tr key={r.driver.id}>
              <td className="pos">{ku(r.positionText)}</td>
              <td>
                <Link href={`/drivers/${r.driver.id}`} className="tname lat">{fullName(r.driver)}</Link>
                <span className="tsub lat">{r.team.name}</span>
              </td>
              <td className="num"><bdi className="lat">{r.time ?? r.status ?? ""}</bdi></td>
              <td className="num strong">{ku(r.points)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
