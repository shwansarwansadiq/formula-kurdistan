/* eslint-disable @next/next/no-img-element -- driver photos from our storage */
import { AdminShell } from "@/components/admin/AdminShell";
import { Submit } from "@/components/admin/Submit";
import { db } from "@/lib/db";
import { getDriverStandings } from "@/lib/f1data";
import { fullName } from "@/lib/f1parse";
import { removeDriverPhoto, saveDriverPhoto } from "../actions";

export const dynamic = "force-dynamic";

/** One racing-suit photo per driver for this season; result cards use these first. */
export default async function Drivers() {
  const standings = await getDriverStandings();
  const season = standings?.season ?? String(new Date().getUTCFullYear());
  const { data } = await db().from("driver_photos").select("driver_id, url, credit").eq("season", season);
  const chosen = new Map(((data ?? []) as { driver_id: string; url: string; credit: string }[]).map((p) => [p.driver_id, p]));
  return (
    <AdminShell active="drivers" title="وێنەی شۆفێران">
      <p className="adm-note">
        بۆ هەر شۆفێرێک وێنەیەکی ئەم وەرزە بە جلی پێشبڕکێوە دابنێ، لەگەڵ ناوی خاوەنەکەی. کارتی ئەنجامەکان پێش هەموو شتێک ئەم وێنانە بەکاردەهێنن. تەنها
        وێنەیەک دابنێ کە مافی بەکارهێنانیت هەیە.
      </p>
      <ul className="tt-list">
        {(standings?.rows ?? []).map((r) => {
          const p = chosen.get(r.driver.id);
          return (
            <li key={r.driver.id} className="tt">
              {p ? <img className="tt-video" src={p.url} alt="" style={{ objectFit: "cover" }} /> : <div className="tt-video tt-wait">وێنە نییە</div>}
              <div className="tt-side">
                <b><bdi>{fullName(r.driver)}</bdi></b>
                <small><bdi>{r.teams.at(-1)?.name}</bdi>{p ? <> · <bdi>{p.credit}</bdi></> : null}</small>
                <form action={saveDriverPhoto} className="tt-actions">
                  <input type="hidden" name="driver" value={r.driver.id} />
                  <input type="hidden" name="season" value={season} />
                  <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
                  <input type="text" name="credit" placeholder="Credit, e.g. Mercedes-AMG F1 Team" required dir="ltr" />
                  <Submit className="btn small" busy="…">{p ? "گۆڕین" : "دانان"}</Submit>
                </form>
                {p ? (
                  <form action={removeDriverPhoto}>
                    <input type="hidden" name="driver" value={r.driver.id} />
                    <input type="hidden" name="season" value={season} />
                    <Submit className="btn small ghost" busy="…">لابردن</Submit>
                  </form>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
