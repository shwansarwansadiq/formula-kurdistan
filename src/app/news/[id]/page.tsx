import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bidi } from "@/components/Bidi";
import { Masthead } from "@/components/Masthead";
import { NewsGrid, Photo, SiteFooter, storyHref } from "@/components/StoryParts";
import { CATEGORY_META, ku, paragraphs, publishedStories, publishedStory, readingMinutes, siteUrl, soraniDate } from "@/lib/site";

export const revalidate = 300;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const story = await publishedStory(Number((await params).id));
  if (!story) return {};
  return {
    title: `${story.headline} · فۆڕمولا کەی`,
    description: story.key_points[0] ?? undefined,
    alternates: { canonical: `${siteUrl()}/news/${story.id}` },
    openGraph: {
      title: story.headline,
      description: story.key_points[0] ?? undefined,
      images: story.image_url ? [story.image_url] : undefined,
      type: "article",
      locale: "ckb_IQ",
    },
  };
}

export default async function StoryPage({ params }: Params) {
  const story = await publishedStory(Number((await params).id));
  if (!story) notFound();
  const meta = CATEGORY_META[story.category];
  const others = (await publishedStories({ limit: 20 })).filter((s) => s.id !== story.id);
  const next = others[0];
  const related = others.filter((s) => s.category === story.category).slice(0, 3);
  const sources = story.sources?.length ? story.sources : [{ name: story.source_name, url: story.source_url }];

  return (
    <>
      <Masthead active="news" />
      <main id="main" className="article" data-story={story.id}>
        <header className="art-head">
          <div className="art-head-in">
            <h1>
              <Bidi text={story.headline} />
            </h1>
            <p className="meta">
              <Link href={`/category/${meta.slug}`}>{meta.label}</Link>
              <span>{soraniDate(story.published_at ?? story.created_at)}</span>
              <span>{ku(readingMinutes(story.body))} خولەک خوێندنەوە</span>
            </p>
          </div>
        </header>
        <div className="art-photo slot">
          <Photo story={story} priority credit />
        </div>
        <div className="art-body">
          {paragraphs(story.body).map((p, i) => (
            <p key={i}>
              <Bidi text={p} />
            </p>
          ))}
        </div>
        {story.gallery?.length ? (
          <section className="gallery" aria-label="وێنەکان">
            {story.gallery.map((g) => (
              <figure key={g.url}>
                {/* eslint-disable-next-line @next/next/no-img-element -- stored photos at their own size */}
                <img src={g.url} alt="" loading="lazy" decoding="async" />
                {g.credit ? (
                  <figcaption>
                    وێنە: <bdi className="lat">{g.credit}</bdi>
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </section>
        ) : null}
        {story.key_points.length ? (
          <aside className="points" aria-labelledby="brief">
            <h2 id="brief">بە کورتی</h2>
            <ol>
              {story.key_points.map((k, i) => (
                <li key={i}>
                  <Bidi text={k} />
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
        <section className="credits" aria-labelledby="src">
          <h2 id="src">سەرچاوەکان</h2>
          <dl>
            <dt>هەواڵ لە</dt>
            <dd>
              {sources.map((s, i) => (
                <span key={s.url}>
                  {i ? "، " : ""}
                  <a href={s.url} rel="noopener" target="_blank">
                    {s.name}
                  </a>
                </span>
              ))}
            </dd>
            {story.image_credit ? (
              <>
                <dt>وێنە</dt>
                <dd>
                  {story.image_source ? (
                    <a href={story.image_source} rel="noopener" target="_blank">
                      {story.image_credit}
                    </a>
                  ) : (
                    <bdi className="lat">{story.image_credit}</bdi>
                  )}
                </dd>
              </>
            ) : null}
            <dt>نووسینی کوردی</dt>
            <dd>فۆڕمولا کەی</dd>
          </dl>
          <p className="rights">
            خاوەنی ئەم وێنەیە یان دەقێکی ئێرەیت و دەتەوێت لاببرێت؟ نامە بنێرە بۆ <bdi className="lat">@formulak.news</bdi> و
            بە زووترین کات لای دەبەین.
          </p>
        </section>
        {next ? (
          <Link href={storyHref(next)} className="next">
            <span>
              <small>هەواڵی داهاتوو</small>
              <b>
                <Bidi text={next.headline} />
              </b>
            </span>
          </Link>
        ) : null}
        {related.length ? (
          <section className="sec" aria-labelledby="more">
            <div className="sec-in">
              <h2 id="more">زیاتر لە {meta.label}</h2>
              <NewsGrid stories={related} />
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
