import { AdminShell } from "@/components/admin/AdminShell";
import { Submit } from "@/components/admin/Submit";
import { db } from "@/lib/db";
import { ku } from "@/lib/site";
import { approveLesson, learnNow, rejectLesson } from "../actions";

type Lesson = { id: number; kind: "rule" | "term"; rule: string; english: string | null; sorani: string | null; example: string | null; status: string };

export default async function Lessons() {
  const [{ data }, { count }] = await Promise.all([
    db().from("writer_lessons").select("id, kind, rule, english, sorani, example, status").neq("status", "rejected").order("id", { ascending: false }),
    db().from("story_edits").select("id", { count: "exact", head: true }).is("learned_at", null),
  ]);
  const lessons = (data ?? []) as Lesson[];
  const pending = lessons.filter((l) => l.status === "pending");
  const approved = lessons.filter((l) => l.status === "approved" && l.kind === "rule");
  const waiting = count ?? 0;
  return (
    <AdminShell active="lessons" title="وانەکان">
      <p className="adm-note">
        کاتێک هەواڵێک دەستکاری دەکەیت، نووسەر لە گۆڕانکارییەکانت وانە وەردەگرێت. هەر وانەیەک تەنها دوای پەسەندکردنی تۆ بەکاردێت. وانەی ڕێنووسی
        وشەیەک دەچێتە فەرهەنگ.
      </p>
      <div className="lesson-bar">
        <span>{waiting ? `${ku(waiting)} دەستکاری چاوەڕێی شیکردنەوەن` : "هەموو دەستکارییەکان شیکراونەتەوە"}</span>
        {waiting ? (
          <form action={learnNow}>
            <Submit className="btn small" busy="شی دەکرێتەوە…">ئێستا وانە دەربهێنە</Submit>
          </form>
        ) : null}
      </div>

      <h2 className="adm-h2">چاوەڕێی بڕیاری تۆ ({ku(pending.length)})</h2>
      {pending.length ? (
        <ul className="lesson-list">
          {pending.map((l) => (
            <li key={l.id}>
              <form action={approveLesson} className="lesson">
                <input type="hidden" name="id" value={l.id} />
                {l.kind === "term" ? (
                  <div className="lesson-term">
                    <span className="lesson-kind">ڕێنووس</span>
                    <input name="english" defaultValue={l.english ?? ""} dir="ltr" aria-label="English" />
                    <input name="sorani" defaultValue={l.sorani ?? ""} aria-label="سۆرانی" />
                  </div>
                ) : (
                  <span className="lesson-kind">ڕێسا</span>
                )}
                <textarea name="rule" defaultValue={l.rule} rows={2} dir="ltr" aria-label="وانە" />
                {l.example ? (
                  <p className="lesson-ex">
                    نموونە: <bdi>{l.example}</bdi>
                  </p>
                ) : null}
                <div className="term-acts">
                  <Submit className="btn pub small" busy="…">پەسەندکردن</Submit>
                  <Submit className="btn ghost small" busy="…" formAction={rejectLesson}>
                    ڕەتکردنەوە
                  </Submit>
                </div>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-note">هیچ وانەیەکی نوێ نییە. دوای دەستکاریکردنی هەواڵەکان لێرە دەردەکەون.</p>
      )}

      <h2 className="adm-h2">وانە پەسەندکراوەکان ({ku(approved.length)})</h2>
      {approved.length ? (
        <ul className="lesson-list">
          {approved.map((l) => (
            <li key={l.id}>
              <form action={rejectLesson} className="lesson done">
                <input type="hidden" name="id" value={l.id} />
                <p dir="ltr" className="lesson-rule">{l.rule}</p>
                {l.example ? (
                  <p className="lesson-ex">
                    نموونە: <bdi>{l.example}</bdi>
                  </p>
                ) : null}
                <div className="term-acts">
                  <Submit className="btn ghost small" busy="…">لابردن</Submit>
                </div>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-note">هێشتا هیچ وانەیەک پەسەند نەکراوە.</p>
      )}
    </AdminShell>
  );
}
