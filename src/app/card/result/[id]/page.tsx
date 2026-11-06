import { notFound } from "next/navigation";
import { RESULT_CARD_CSS, ResultCardView } from "@/components/ResultCard";
import { sampleResultData } from "@/lib/fixtures";
import { fixturesOn } from "@/lib/fixtures";
import { resultCard } from "@/lib/result-cards";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/** A session result card at full size, for the image exporter. */
export default async function ResultCardPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ f?: string }> }) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const format = (await searchParams).f === "story" ? "story" : "feed";
  const data = fixturesOn() ? sampleResultData() : (await resultCard(Number(id)))?.data;
  if (!data) notFound();
  return (
    <main className="card-page">
      <style>{`html{direction:ltr}html,body{margin:0;background:#0A0A0A}.skip,.consent{display:none!important}.card-page{width:1080px}${RESULT_CARD_CSS}`}</style>
      <ResultCardView data={data} format={format} />
    </main>
  );
}
