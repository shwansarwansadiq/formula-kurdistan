import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/StoryParts";

export const metadata = { title: "تایبەتمەندی · فۆڕمولا کەی" };

export default function Privacy() {
  return (
    <>
      <Masthead />
      <main id="main" className="article">
        <header className="art-head">
          <h1>سیاسەتی تایبەتمەندی</h1>
        </header>
        <div className="art-body">
          <p>فۆڕمولا کەی ماڵپەڕێکی هەواڵە. هەژمار دروست ناکەین و داتای خوێنەران نافرۆشین. ژمارەی خوێنەران بە ئامرازێکی خۆمان دەژمێرین، بێ کوکی و بێ هەڵگرتنی ناونیشانی IP؛ بە ڕازیبوونی خۆت ناسنامەیەکی هەڕەمەکی لە وێبگەڕەکەت هەڵدەگرین. <a href="/measure">چۆن دەپێوین</a>.</p>
          <p>ئەپی FORMULAK لە Meta تەنها بۆ بڵاوکردنەوەی هەواڵەکانمان لە پەڕەی فەیسبووک و ئینستاگرامی خۆمان (@formulak.news) بەکاردێت. هیچ داتایەکی بەکارهێنەران لە فەیسبووک یان ئینستاگرام وەرناگرێت.</p>
          <p>ئەپی FORMULAK لە تیکتۆک تەنها ڤیدیۆکانی خۆمان وەک ڕەشنووس دەنێرێتە ئینبۆکسی هەژماری تیکتۆکی خۆمان (@formulak.news). تەنها ناسنامەی ئەو هەژمارە و کلیلەکانی پەیوەستبوون هەڵدەگرین و هیچ داتایەکی بەکارهێنەرانی تیکتۆک وەرناگرین.</p>
          <p>بۆ هەر پرسیارێک یان داوای لابردنی ناوەڕۆک، نامە بنێرە بۆ <bdi className="lat">@formulak.news</bdi>.</p>
        </div>
        <div className="art-body" dir="ltr" lang="en" style={{ fontFamily: "var(--latin)", fontSize: 15, lineHeight: 1.7 }}>
          <p>
            <strong>Privacy policy (English).</strong> FORMULAK is a news website. We do not create reader accounts or sell data. We count readers with
            our own first-party tool: no cookies, no stored IP addresses, and a random ID in your browser only if you agree (see /measure). The FORMULAK Meta app is used only to publish our own stories to our own
            Facebook Page and Instagram account (@formulak.news); it does not collect data about Facebook or Instagram users. The FORMULAK TikTok app is used only to send our own videos as drafts
            to our own TikTok account&apos;s inbox (@formulak.news); we store only that account&apos;s ID and its access tokens, and collect
            no data about TikTok users.
            For
            questions or removal requests, message @formulak.news.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
