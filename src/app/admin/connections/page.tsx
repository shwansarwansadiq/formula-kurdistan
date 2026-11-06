import { AdminShell } from "@/components/admin/AdminShell";
import { metaTargets } from "@/lib/meta";
import { tiktokConfigured, tiktokStatus } from "@/lib/tiktok";

export const dynamic = "force-dynamic";

/** Read-only: which accounts the site can reach. It posts nothing and shows no keys. */
export default async function ConnectionsPage() {
  const meta = await metaTargets().then(
    (t) => ({ page: t.pageName, pageId: t.pageId, instagram: t.igUsername, error: null as string | null }),
    (e: unknown) => ({ page: null, pageId: null, instagram: null, error: e instanceof Error ? e.message : String(e) }),
  );
  const tiktok = await tiktokStatus().catch(() => ({ connected: false }));

  return (
    <AdminShell active="tiktok" title="پەیوەندییەکان">
      <p>ئەم پەڕەیە تەنها پشکنین دەکات و هیچ شتێک بڵاو ناکاتەوە.</p>
      <dl data-connections>
        <dt>Facebook</dt>
        <dd>{meta.page ? <bdi>{meta.page} ({meta.pageId})</bdi> : <bdi>{meta.error}</bdi>}</dd>
        <dt>Instagram</dt>
        <dd>{meta.instagram ? <bdi>@{meta.instagram}</bdi> : "پەیوەست نییە"}</dd>
        <dt>TikTok</dt>
        <dd>{tiktok.connected ? "پەیوەستە" : tiktokConfigured() ? "کلیلەکان هەن، هێشتا پەیوەست نەکراوە" : "کلیلەکان دانەنراون"}</dd>
      </dl>
    </AdminShell>
  );
}
