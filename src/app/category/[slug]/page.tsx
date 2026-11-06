import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { CategoryNav, NewsGrid, SiteFooter } from "@/components/StoryParts";
import { categoryFromSlug, CATEGORY_META, publishedStories } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const key = categoryFromSlug((await params).slug);
  return key ? { title: `${CATEGORY_META[key].label} · FORMULAK` } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const key = categoryFromSlug((await params).slug);
  if (!key) notFound();
  const stories = await publishedStories({ category: key, limit: 40 });

  return (
    <>
      <Masthead active="news" />
      <main id="main" data-category={key}>
        <header className="pagehead">
          <div className="sec-in">
            <h1>{CATEGORY_META[key].label}</h1>
            <CategoryNav active={key} />
          </div>
        </header>
        <section className="sec">
          <div className="sec-in">
            {stories.length ? <NewsGrid stories={stories} /> : <p className="gap">هێشتا هەواڵ لەم بەشەدا بڵاو نەکراوەتەوە.</p>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
