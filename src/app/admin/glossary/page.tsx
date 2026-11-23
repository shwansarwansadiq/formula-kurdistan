import { AdminShell } from "@/components/admin/AdminShell";
import { Submit } from "@/components/admin/Submit";
import { db } from "@/lib/db";
import { ku } from "@/lib/site";
import { deleteTerm, saveTerm } from "../actions";

type Term = { english: string; sorani: string; note: string | null };

export default async function Glossary() {
  const { data } = await db().from("glossary").select("english, sorani, note").order("english");
  const terms = (data ?? []) as Term[];
  return (
    <AdminShell active="glossary" title="فەرهەنگ">
      <p className="adm-note">نووسەر هەمیشە ئەم ڕێنووسانە بەکاردەهێنێت. وشەیەکی نوێ زیاد بکە، یان لە خوارەوە وشەیەک بگۆڕە و پاشەکەوتی بکە، یان لاببە.</p>
      <form action={saveTerm} className="term-form">
        <input name="english" placeholder="English" dir="ltr" required aria-label="English" />
        <input name="sorani" placeholder="سۆرانی" required aria-label="سۆرانی" />
        <input name="note" placeholder="تێبینی" aria-label="تێبینی" />
        <Submit className="btn pub small" busy="…">زیادکردن</Submit>
      </form>
      <h2 className="adm-h2">{ku(terms.length)} وشە</h2>
      <ul className="term-list">
        {terms.map((t) => (
          <li key={t.english}>
            <form action={saveTerm} className="term-row">
              <input type="hidden" name="original" value={t.english} />
              <input name="english" defaultValue={t.english} dir="ltr" required aria-label="English" />
              <input name="sorani" defaultValue={t.sorani} required aria-label="سۆرانی" />
              <input name="note" defaultValue={t.note ?? ""} placeholder="تێبینی" aria-label="تێبینی" />
              <div className="term-acts">
                <Submit className="btn small" busy="…">پاشەکەوت</Submit>
                <Submit className="btn ghost small" busy="…" formAction={deleteTerm}>
                  لابردن
                </Submit>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
