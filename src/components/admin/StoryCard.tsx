/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { findPhoto, publishStory, regenerateStory, saveStory, scheduleStory, skipStory } from "@/app/admin/actions";
import { Bidi } from "@/components/Bidi";
import { isSensitive, photoStatus, PLATFORM_LABEL, PLATFORMS, type AdminStory } from "@/lib/admin-data";
import { CATEGORY_KEYS, CATEGORY_META, ku, paragraphs, soraniDate } from "@/lib/site";
import { hawlerTime, toHawlerInput } from "@/lib/schedule";
import { PhotoPanel } from "./PhotoPanel";
import { Submit } from "./Submit";

/** `nextSlot`: the next free posting time, shown on the schedule button. */
export function StoryCard({ story, nextSlot }: { story: AdminStory; nextSlot: Date }) {
  const meta = CATEGORY_META[story.category];
  const sources = story.sources?.length ? story.sources : [{ name: story.source_name, url: story.source_url, trust: undefined }];
  const sensitive = isSensitive(story);
  const photo = photoStatus(story);
  const kp = [...story.key_points, "", "", ""].slice(0, 3);
  return (
    <article className="card" aria-labelledby={`h-${story.id}`}>
      <div className="card-media">
        {story.image_url ? (
          <img src={story.image_url} alt="" loading="lazy" />
        ) : (
          <div className="card-noimg" style={{ background: meta.colour }}>
            کارتی براند
          </div>
        )}
        <span className="pill glass">{meta.label}</span>
        {story.image_credit ? <span className="card-credit glass">وێنە: <bdi>{story.image_credit}</bdi></span> : null}
      </div>
      <div className="card-in">
        <div className={`photo-status ${photo.tone}`}>
          <span>{photo.label}</span>
          {photo.tone !== "ok" && story.image_license !== "removed" ? (
            <form action={findPhoto}>
              <input type="hidden" name="id" value={story.id} />
              <Submit className="btn small" busy="دەگەڕێت…">وێنەی ئازاد بدۆزەوە</Submit>
            </form>
          ) : null}
        </div>
        <div className="card-top">
          <span>
            #{ku(story.id)} · {soraniDate(story.created_at, false)}
          </span>
          <span>{ku(sources.length)} سەرچاوە</span>
        </div>
        <h2 id={`h-${story.id}`}>
          <Bidi text={story.headline} />
        </h2>
        <ul className="card-points">
          {story.key_points.map((k, i) => (
            <li key={i}>
              <Bidi text={k} />
            </li>
          ))}
        </ul>

        <details className="card-full">
          <summary>دەقی تەواو، وەک لە ماڵپەڕ دەردەکەوێت</summary>
          <div className="card-body">
            {paragraphs(story.body).map((p, i) => (
              <p key={i}>
                <Bidi text={p} />
              </p>
            ))}
          </div>
          <p className="card-meta">
            <b>سەردێڕی کارت:</b> <Bidi text={story.card_headline} />
          </p>
          {story.gallery.length ? (
            <ul className="card-gal" aria-label="وێنە زیادەکانی ناو هەواڵ">
              {story.gallery.map((g) => (
                <li key={g.url}>
                  <img src={g.url} alt="" loading="lazy" />
                </li>
              ))}
            </ul>
          ) : null}
          <details className="card-caps">
            <summary>کەپشنەکانی سۆشیاڵ میدیا</summary>
            <p><b>ئینستاگرام:</b> <Bidi text={story.caption_instagram} /></p>
            <p><b>فەیسبووک:</b> <Bidi text={story.caption_facebook} /></p>
            <p><b>تیکتۆک:</b> <Bidi text={story.caption_tiktok} /></p>
          </details>
        </details>

        <details className="card-edit">
          <summary>دەستکاریی دەق لێرە</summary>
          <form action={saveStory} className="edit">
            <input type="hidden" name="id" value={story.id} />
            <input type="hidden" name="back" value="queue" />
            <label>
              بەش
              <select name="category" defaultValue={story.category}>
                {CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_META[k].label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              سەردێڕ
              <input name="headline" defaultValue={story.headline} required />
            </label>
            <label>
              سەردێڕی کارت (لەسەر وێنەکە)
              <input name="card_headline" defaultValue={story.card_headline} required />
            </label>
            <label>
              دەق
              <textarea name="body" defaultValue={story.body} rows={14} required />
            </label>
            <fieldset>
              <legend>بە کورتی</legend>
              {kp.map((k, i) => (
                <input key={i} name={`kp${i + 1}`} defaultValue={k} aria-label={`خاڵی ${ku(i + 1)}`} />
              ))}
            </fieldset>
            <label>
              کەپشنی ئینستاگرام
              <textarea name="caption_instagram" defaultValue={story.caption_instagram} rows={4} />
            </label>
            <label>
              کەپشنی فەیسبووک
              <textarea name="caption_facebook" defaultValue={story.caption_facebook} rows={4} />
            </label>
            <label>
              کەپشنی تیکتۆک
              <textarea name="caption_tiktok" defaultValue={story.caption_tiktok} rows={3} />
            </label>
            <Submit className="btn" busy="پاشەکەوت دەکرێت…">پاشەکەوت</Submit>
          </form>
        </details>

        <details className="card-photos">
          <summary>وێنەکان: گۆڕین و زیادکردن</summary>
          <PhotoPanel story={story} inCard />
        </details>
        <div className="src" dir="ltr">
          {sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener">
              {s.name}
              {s.trust ? <i>{s.trust}</i> : null}
            </a>
          ))}
        </div>
        {sensitive ? <p className="flag">بابەتی هەستیار: تەنها ئەوەی پشتڕاستکراوەتەوە نووسراوە. پێش بڵاوکردنەوە بیخوێنەوە.</p> : null}
        {story.needs_second_source ? <p className="flag warn">تەنها یەک سەرچاوەی لاواز. باشترە چاوەڕێی سەرچاوەی دووەم بکەیت.</p> : null}

        <form action={publishStory} className="pub-form">
          <input type="hidden" name="id" value={story.id} />
          <fieldset className="plat">
            <legend>بڵاوکردنەوە لە</legend>
            {PLATFORMS.map((p) => (
              <label key={p} className={p === "website" ? "locked" : undefined}>
                <input type="checkbox" name={`p_${p}`} defaultChecked disabled={p === "website"} />
                <span>{PLATFORM_LABEL[p]}{p === "tiktok" ? " (ڕەشنووس)" : p === "instagram" ? " (ستۆری + کۆکراوەی شەو)" : ""}</span>
              </label>
            ))}
          </fieldset>
          <div className="when">
            <Submit className="btn pub" busy="بڵاودەکرێتەوە… (تا یەک خولەک)" name="mode" value="now">
              ئێستا بڵاوی بکەوە
            </Submit>
            <Submit className="btn sched" busy="دەخرێتە خشتەوە…" formAction={scheduleStory} name="mode" value="next">
              بیخە خشتەوە · <span className="lat">{ku(hawlerTime(nextSlot))}</span>
            </Submit>
          </div>
          <details className="when-at">
            <summary>کاتێکی تر هەڵبژێرە</summary>
            <div>
              <input type="datetime-local" name="at" defaultValue={toHawlerInput(nextSlot)} step={300} aria-label="کاتی بڵاوکردنەوە (کاتی هەولێر)" />
              <Submit className="btn small" busy="…" formAction={scheduleStory} name="mode" value="at">
                لەم کاتەدا
              </Submit>
            </div>
          </details>
        </form>
        <div className="acts">
          <Link href={`/admin/story/${story.id}`} className="btn">
            دیزاینەکان و ڤیدیۆ
          </Link>
          <form action={regenerateStory}>
            <input type="hidden" name="id" value={story.id} />
            <Submit busy="دەنووسرێتەوە…">نووسینەوە</Submit>
          </form>
          <form action={skipStory}>
            <input type="hidden" name="id" value={story.id} />
            <Submit className="btn ghost" busy="…">
              پەڕاندن
            </Submit>
          </form>
        </div>
      </div>
    </article>
  );
}
