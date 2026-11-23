import { describe, expect, it } from "vitest";
import { allowedByRules, articleTextFromHtml, disallowRules } from "./article";

describe("articleTextFromHtml", () => {
  it("keeps the article's paragraphs and drops page furniture", () => {
    const html = `<html><nav><p>Home News Results Standings and more links here</p></nav>
      <article><h1>Wolff explains</h1>
      <p>Toto Wolff has explained how Mercedes' push for victory in Las Vegas unravelled in the closing laps.</p>
      <figure><figcaption><p>Photo caption that should not appear in the text at all</p></figcaption></figure>
      <p>Advertisement - scroll to continue reading this article please</p>
      <p>&ldquo;We had both cars in the fight,&rdquo; Wolff said, adding that tyre wear decided the race.</p>
      <script>var x = "<p>nope nope nope nope nope nope nope nope nope</p>";</script>
      </article><footer><p>Copyright Formula One World Championship Limited 2026</p></footer></html>`;
    const text = articleTextFromHtml(html);
    expect(text.split("\n\n")).toEqual([
      "Toto Wolff has explained how Mercedes' push for victory in Las Vegas unravelled in the closing laps.",
      "\"We had both cars in the fight,\" Wolff said, adding that tyre wear decided the race.",
    ]);
  });
});

describe("robots.txt", () => {
  const robots = `User-agent: *\nDisallow: /private/\n\nUser-agent: GPTBot\nDisallow: /\n`;
  it("applies the * group to us", () => {
    const rules = disallowRules(robots);
    expect(allowedByRules("/en/latest/article/wolff", rules)).toBe(true);
    expect(allowedByRules("/private/x", rules)).toBe(false);
  });
  it("obeys a group that names us", () => {
    const rules = disallowRules(`User-agent: FormulaKBot\nDisallow: /\n\nUser-agent: *\nDisallow:\n`);
    expect(allowedByRules("/anything", rules)).toBe(false);
  });
});

import { glossaryNamesIn } from "./photo";

describe("glossaryNamesIn", () => {
  it("finds English names for Sorani names in a headline, in order", () => {
    const terms = [
      { english: "Mercedes", sorani: "مێرسێدس" },
      { english: "Toto Wolff", sorani: "تۆتۆ وۆڵف" },
      { english: "McLaren", sorani: "مەکلارن" },
    ];
    expect(glossaryNamesIn("تۆتۆ وۆڵف ڕوونی دەکاتەوە چۆن مێرسێدس بردنەوەی لەدەستدا", terms)).toEqual(["Toto Wolff", "Mercedes"]);
  });
});

import { dropStrayLatin } from "./prompts";

describe("dropStrayLatin", () => {
  it("removes a lone Latin letter glued to a Sorani word and keeps real abbreviations", () => {
    expect(dropStrayLatin("بەهۆی lتێکەڵبوونەکەی")).toBe("بەهۆی تێکەڵبوونەکەی");
    expect(dropStrayLatin("بزوێنەری V8ـی ٢.١ لیتری و FIA")).toBe("بزوێنەری V8ـی ٢.١ لیتری و FIA");
  });
});
