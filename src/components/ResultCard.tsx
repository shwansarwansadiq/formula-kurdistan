/* eslint-disable @next/next/no-img-element -- free driver photos load straight from Wikimedia at their posted size */
import { CIRCUITS } from "@/lib/circuits";
import { accentFor, RESULT_LABEL, type ResultData } from "@/lib/result-cards";
import { ku, soraniDate } from "@/lib/site";
import { Logo, Mark } from "./Logo";

/** The session result card in the starting-grid world: three drivers parked in staggered slots, pole on the right. */
export function ResultCardView({ data, format }: { data: ResultData; format: "feed" | "story" }) {
  const story = format === "story";
  const shape = CIRCUITS.find((c) => c.id === data.race.circuitId) ?? null;
  const accent = accentFor(data.race.country);
  const credits = [...new Set(data.podium.map((p) => p.credit).filter(Boolean))];
  return (
    <div id="card" className={story ? "rc story" : "rc"} style={{ ["--accent" as string]: accent }}>
      <div className="rc-top">
        <span className="rc-round">خولی {ku(data.race.round)} · {ku(data.race.season)}</span>
        <span dir="ltr" className="rc-logo"><Logo size={story ? 46 : 40} /></span>
      </div>

      <div className="rc-head">
        {shape ? (
          <svg className="rc-track" viewBox={`-40 -40 ${shape.w + 80} ${shape.h + 80}`} aria-hidden="true">
            <path d={shape.d} fill="none" stroke="var(--accent)" strokeWidth="26" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        ) : null}
        <div className="rc-title">
          <span className="rc-label">ئەنجامی {RESULT_LABEL[data.session]}</span>
          <h1 dir="ltr">{data.race.name}</h1>
          <p dir="ltr">{data.race.circuit}</p>
        </div>
      </div>

      <div className="rc-grid">
        {data.podium.map((p, i) => (
          <div key={i} className={i === 0 ? "rc-slot rc-p1" : "rc-slot"}>
            <div className="rc-photo">
              {p.photo ? <img src={p.photo} alt="" /> : <span className="rc-k"><Mark size={110} ink="#fff" /></span>}
              <b className="rc-pos">{ku(p.pos)}</b>
            </div>
            <span className="rc-given" dir="ltr">{p.given}</span>
            <span className="rc-name" dir="ltr">{p.name}</span>
            <span className="rc-team" dir="ltr">{p.team}</span>
            {p.time ? <span className="rc-time" dir="ltr">{p.time}</span> : null}
          </div>
        ))}
      </div>

      <div className="rc-foot">
        <p className="rc-date">{soraniDate(data.sessionIso)} · <span dir="ltr">formulak.news</span></p>
        <p className="rc-credit" dir="ltr">
          {credits.length ? <>Photos: {credits.join(", ")}, Wikimedia Commons. </> : null}Data: Jolpica F1. Circuit: bacinger/f1-circuits.
        </p>
      </div>
    </div>
  );
}

export const RESULT_CARD_CSS = `
.rc{position:relative;width:1080px;height:1350px;background:#0A0A0A;color:#fff;font-family:"Rabar",sans-serif;direction:rtl;overflow:hidden;padding:56px 60px 44px;display:flex;flex-direction:column;box-sizing:border-box}
.rc.story{height:1920px;padding:150px 60px 230px}
.rc *{box-sizing:border-box}
.rc-top{display:flex;justify-content:space-between;align-items:center}
.rc-round{font-size:30px;font-weight:700;color:#d4d4d4}
.rc-logo{line-height:0;color:#fff}
.rc-head{position:relative;margin-top:44px;min-height:300px;display:flex;align-items:flex-end}
.rc.story .rc-head{min-height:440px;margin-top:70px}
.rc-track{position:absolute;left:0;top:0;width:44%;height:100%}
.rc-title{position:relative;width:100%}
.rc-label{display:inline-block;background:#E10600;color:#fff;font-weight:700;font-size:40px;line-height:1;padding:16px 26px 20px}
.rc-title h1{margin:22px 0 0;font:800 84px/1.0 "Archivo",sans-serif;font-stretch:118%;letter-spacing:-0.02em;text-align:right}
.rc-title p{margin:12px 0 0;font:600 30px/1.3 "Archivo",sans-serif;color:#bdbdbd;text-align:right}
.rc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:56px;align-items:start}
.rc.story .rc-grid{margin-top:90px;gap:20px}
.rc-slot{position:relative;border-top:8px solid #fff;padding:20px 0 0;display:flex;flex-direction:column}
.rc-slot::before,.rc-slot::after{content:"";position:absolute;top:-8px;width:8px;height:44px;background:#fff}
.rc-slot::before{right:0}.rc-slot::after{left:0}
.rc-slot.rc-p1{border-color:#E10600}.rc-slot.rc-p1::before,.rc-slot.rc-p1::after{background:#E10600}
.rc-slot:nth-child(2){margin-top:60px}.rc-slot:nth-child(3){margin-top:120px}
.rc-photo{position:relative;aspect-ratio:4/5;background:#171717;overflow:hidden}
.rc.story .rc-photo{aspect-ratio:2/3}
.rc-photo img{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block}
.rc-k{position:absolute;inset:0;display:grid;place-items:center}
.rc-pos{position:absolute;right:0;bottom:0;background:#0A0A0A;color:#fff;font:700 64px/1 "Rabar",sans-serif;padding:10px 18px 14px}
.rc-p1 .rc-pos{background:#E10600}
.rc-given{margin-top:16px;font:600 24px/1.2 "Archivo",sans-serif;color:#d4d4d4;text-align:right}
.rc-name{font:800 40px/1.1 "Archivo",sans-serif;font-stretch:112%;text-align:right;overflow-wrap:anywhere}
.rc-team{margin-top:6px;font:600 24px/1.3 "Archivo",sans-serif;color:#bdbdbd;text-align:right}
.rc-time{margin-top:10px;font:700 30px/1.2 "Archivo",sans-serif;font-variant-numeric:tabular-nums;text-align:right}
.rc-foot{margin-top:auto}
.rc-date{margin:0;font-size:30px;font-weight:700}
.rc-date span{font-family:"Archivo",sans-serif}
.rc-credit{margin:10px 0 0;font:500 17px/1.4 "Archivo",sans-serif;color:#8A8A8A;text-align:left}
`;
