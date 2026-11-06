import { AdminShell } from "@/components/admin/AdminShell";
import { metaTargets } from "@/lib/meta";
import { db } from "@/lib/db";
import { connectedAccount, draftStatus, tiktokConfigured, tiktokStatus } from "@/lib/tiktok";

export const dynamic = "force-dynamic";

/** Read-only: which accounts the site can reach. It posts nothing and shows no keys. */
export default async function ConnectionsPage() {
  const meta = await metaTargets().then(
    (t) => ({ page: t.pageName, pageId: t.pageId, instagram: t.igUsername, error: null as string | null }),
    (e: unknown) => ({ page: null, pageId: null, instagram: null, error: e instanceof Error ? e.message : String(e) }),
  );
  const tiktok = await tiktokStatus().catch(() => ({ connected: false }));

  const account = tiktok.connected ? await connectedAccount().catch((e: unknown) => (e instanceof Error ? e.message : String(e))) : null;
  const { data: sent } = await db()
    .from("stories")
    .select("id, tiktok_publish_id")
    .eq("tiktok_result", "sent")
    .not("tiktok_publish_id", "is", null)
    .order("tiktok_sent_at", { ascending: false })
    .limit(5);
  const drafts = await Promise.all(
    ((sent ?? []) as { id: number; tiktok_publish_id: string }[]).map(async (d) => ({
      id: d.id,
      status: await draftStatus(d.tiktok_publish_id).catch((e: unknown) => (e instanceof Error ? e.message : String(e))),
    })),
  );

  return (
    <AdminShell active="tiktok" title="پەیوەندییەکان">
      <p>ئەم پەڕەیە تەنها پشکنین دەکات و هیچ شتێک بڵاو ناکاتەوە.</p>
      <dl data-connections>
        <dt>Facebook</dt>
        <dd>{meta.page ? <bdi>{meta.page} ({meta.pageId})</bdi> : <bdi>{meta.error}</bdi>}</dd>
        <dt>Instagram</dt>
        <dd>{meta.instagram ? <bdi>@{meta.instagram}</bdi> : "پەیوەست نییە"}</dd>
        <dt>TikTok</dt>
        <dd>{tiktok.connected ? "پەیوەستە" : tiktokConfigured() ? "کلیلەکان هەن، هێشتا پەیوەست نەکراوە" : "کلیلەکان دانەنراون"}{account ? <> <bdi>({account})</bdi></> : null}</dd>
        {drafts.map((d) => (
          <div key={d.id} data-draft={d.id}>
            <dt>TikTok draft #{d.id}</dt>
            <dd><bdi>{d.status}</bdi></dd>
          </div>
        ))}
      </dl>
    </AdminShell>
  );
}
