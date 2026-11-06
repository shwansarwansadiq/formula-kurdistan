/* eslint-disable @next/next/no-img-element -- photos come from our storage bucket at their posted size */
import Link from "next/link";
import { CATEGORY_KEYS, CATEGORY_META, soraniDate, type CategoryKey, type Story } from "@/lib/site";
import { Bidi } from "./Bidi";
import { Clocks } from "./Clocks";
import { Logo, Mark } from "./Logo";

export const storyHref = (s: Pick<Story, "id">) => `/news/${s.id}`;

/** The story's photo, or the K on charcoal when it has none. Photos with credit follow the photo rule. */
export function Photo({ story, priority = false, credit = false }: { story: Story; priority?: boolean; credit?: boolean }) {
  if (story.image_url) {
    return (
      <figure className="photo">
        <img src={story.image_url} alt="" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
        {credit && story.image_credit ? (
          <figcaption>
            وێنە: <bdi className="lat">{story.image_credit}</bdi>
          </figcaption>
        ) : null}
      </figure>
    );
  }
  return (
    <div className="photo blank" aria-hidden="true">
      <Mark size={56} ink="#fff" />
    </div>
  );
}

function Meta({ story }: { story: Story }) {
  return (
    <p className="meta">
      <span>{CATEGORY_META[story.category].label}</span>
      <span>{soraniDate(story.published_at ?? story.created_at, false)}</span>
    </p>
  );
}

/** One story parked in a grid slot. */
export function StorySlot({ story, lead = false }: { story: Story; lead?: boolean }) {
  const Heading = lead ? "h1" : "h3";
  return (
    <article className={lead ? "slot story lead" : "slot story"}>
      <Link href={storyHref(story)}>
        <Photo story={story} priority={lead} credit={lead} />
        <Heading>
          <Bidi text={story.headline} />
        </Heading>
        {lead && story.key_points[0] ? (
          <p className="dek">
            <Bidi text={story.key_points[0]} />
          </p>
        ) : null}
        <Meta story={story} />
      </Link>
    </article>
  );
}

export function NewsGrid({ stories }: { stories: Story[] }) {
  return (
    <div className="grid2">
      {stories.map((s) => (
        <StorySlot key={s.id} story={s} />
      ))}
    </div>
  );
}

export function CategoryNav({ active }: { active?: CategoryKey }) {
  return (
    <nav className="catnav" aria-label="بەشەکانی هەواڵ">
      {CATEGORY_KEYS.map((k) => (
        <Link key={k} href={`/category/${CATEGORY_META[k].slug}`} className={active === k ? "on" : undefined} aria-current={active === k ? "page" : undefined}>
          {CATEGORY_META[k].label}
        </Link>
      ))}
    </nav>
  );
}

export function DataGap() {
  return <p className="gap">داتای پێشبڕکێکان لە ئێستادا ناخوێنرێتەوە. دواتر سەردانمان بکەرەوە.</p>;
}

export function DataCredit() {
  return (
    <p className="datacredit">
      داتا لە <a href="https://github.com/jolpica/jolpica-f1" rel="noopener" target="_blank" className="lat">Jolpica F1</a>. کاتەکان بە کاتی هەولێرن.
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <nav className="foot-nav" aria-label="بەستەرەکان">
          <Link href="/standings">ڕیزبەندی</Link>
          <Link href="/calendar">ڕۆژژمێر</Link>
          <Link href="/drivers">شۆفێران</Link>
          <Link href="/teams">تیمەکان</Link>
          <Link href="/search">گەڕان</Link>
          <Link href="/privacy">تایبەتمەندی</Link>
          <Link href="/terms">مەرجەکان</Link>
        </nav>
        <div className="foot-follow">
          <Clocks />
          <div className="handles" dir="ltr">
            <a href="https://www.instagram.com/formulak.news" rel="noopener">Instagram</a>
            <a href="https://www.tiktok.com/@formulak.news" rel="noopener">TikTok</a>
            <a href="https://www.facebook.com/share/1A1vyzak8K/" rel="noopener">Facebook</a>
          </div>
        </div>
        <p className="disclaimer">
          فۆڕمولا کەی ماڵپەڕێکی سەربەخۆیە و پەیوەندی بە کۆمپانیاکانی فۆڕمولا ١ـەوە نییە. <bdi className="lat">FORMULAK is an independent news site and is not associated with the Formula 1 companies.</bdi>
        </p>
      </div>
      <div className="foot-mark" dir="ltr" aria-hidden="true">
        <Logo size={200} />
      </div>
    </footer>
  );
}
