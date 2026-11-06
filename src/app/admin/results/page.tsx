/* eslint-disable @next/next/no-img-element -- rendered cards from our storage */
import { AdminShell } from "@/components/admin/AdminShell";
import { Submit } from "@/components/admin/Submit";
import { recentResultCards, RESULT_LABEL, RESULT_SESSIONS, resultCaption } from "@/lib/result-cards";
import { ku, soraniDate } from "@/lib/site";
import { makeResult, postResult, skipResult } from "../actions";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const STATUS: Record<string, string> = {
  rendering: "دروست دەکرێت…",
  pending: "چاوەڕێی تۆیە",
  posting: "بڵاو دەکرێتەوە…",
  posted: "بڵاوکرایەوە",
  skipped: "وازی لێ هێنرا",
  failed: "کێشەی هەبوو",
};

/** Session result cards: made automatically when results are in; nothing posts until Shwan taps "post". */
export default async function Results() {
  const cards = await recentResultCards(20);
  return (
    <AdminShell active="results" title="ئەنجامی خولەکان">
      <p className="adm-note">
        کاتێک ئەنجامی خولی هەڵبژاردن، سپرینت یان پێشبڕکێ دەردەچێت، کارتێکی سێ شۆفێری یەکەم خۆی دروست دەکرێت و لێرە چاوەڕێت دەکات. بە یەک
        کرتە لە Facebook و Instagram بڵاو دەبێتەوە (پۆست و ستۆری).
      </p>
      <form action={makeResult} className="tt-actions">
        {RESULT_SESSIONS.map((s) => (
          <Submit key={s} className="btn small ghost" busy="…" name="session" value={s}>
            کارتی {RESULT_LABEL[s]}ی دوایین هەفتە
          </Submit>
        ))}
      </form>
      {cards.length ? null : <p className="adm-note">هێشتا هیچ کارتێک نییە.</p>}
      <ul className="tt-list">
        {cards.map((c) => (
          <li key={c.id} className={c.status === "pending" ? "tt" : "tt done"}>
            {c.feed_url ? <img className="tt-video" src={c.feed_url} alt="" /> : <div className="tt-video tt-wait">{STATUS[c.status]}</div>}
            <div className="tt-side">
              <b>
                {RESULT_LABEL[c.session]} · <bdi>{c.data.race.name}</bdi>
              </b>
              <small>
                #{ku(c.id)} · {soraniDate(c.created_at)} · {STATUS[c.status] ?? c.status}
              </small>
              {c.post_result ? <p className="tt-draft"><bdi>{c.post_result}</bdi></p> : null}
              <pre className="tt-cap">{resultCaption(c.data)}</pre>
              <div className="tt-actions">
                {c.story_url ? <a className="btn small" href={c.story_url} target="_blank">ستۆری</a> : null}
                {c.status === "pending" ? (
                  <>
                    <form action={postResult}>
                      <input type="hidden" name="id" value={c.id} />
                      <Submit className="btn small pub" busy="بڵاو دەکرێتەوە…">بڵاوکردنەوە</Submit>
                    </form>
                    <form action={skipResult}>
                      <input type="hidden" name="id" value={c.id} />
                      <Submit className="btn small ghost" busy="…">واز بهێنە</Submit>
                    </form>
                  </>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
