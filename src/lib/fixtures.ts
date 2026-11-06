/* Local preview data (FORMULAK_FIXTURES=1, never in production). Sample wording, not real stories. */
import type { AdminStory } from "./admin-data";

export const fixturesOn = () => process.env.FORMULAK_FIXTURES === "1" && process.env.NODE_ENV !== "production";

const base = {
  caption_instagram: "کەپشن 💜",
  caption_facebook: "کەپشن",
  caption_tiktok: "کەپشن",
  hashtags: ["#F1"],
  needs_second_source: false,
  status: "published",
  platforms: ["website", "instagram"],
  sticker_done: false,
  edited_at: null,
  image_source: null,
  image_license: "source",
  photo_options: [{ url: "/_dev/b.jpg", page: "https://example.com", credit: "Soompi" }, { url: "/_dev/c.jpg", page: "https://example.com", credit: "Soompi" }],
  gallery: [],
  raw_items: { score_reason: "f1_race · ok" },
};
const body =
  "نموونەی دەق بۆ پێشبینینی ناوخۆیی. Andrea Kimi Antonelli لە پێشبڕکێی ئەم هەفتەیەدا پلەی یەکەمی بەدەست هێنا و خاڵەکانی لە ڕیزبەندیدا زیاتر کرد. تیمەکەی ڕایگەیاند کە کارەکان بەردەوام دەبن و ئامانجی داهاتوویان پاراستنی ئەم پلەیەیە.\n\nبەپێی سەرچاوەکان، گۆڕانکارییەکان لە پێشبڕکێی داهاتوودا دەبینرێن و وردەکارییەکان دوای کۆبوونەوەی تیمەکان ڕوون دەبنەوە. ئەم بەشە تەنها بۆ تاقیکردنەوەی شێوەی پەڕەکەیە و هەواڵی ڕاستەقینە نییە.";

export const FIXTURES: AdminStory[] = [
  { ...base, id: 4, category: "f1_race", headline: "Andrea Kimi Antonelli بۆ یەکەم جار لە ژیانیدا دەبێتە پاڵەوانی جیهان", card_headline: "Mercedes پاڵەوانێتی تیمەکانی وەرزی ٢٠٢٦ بەدەست هێنا", body, key_points: ["ئاهەنگی ئەمساڵ فراوانتر دەکرێت.", "ڕێکەوت و شوێن دواتر ڕادەگەیەندرێت.", "سەرچاوە: Korea Herald"], source_name: "Korea Herald", source_url: "https://koreaherald.com/x", sources: [{ name: "Korea Herald", url: "https://koreaherald.com/x", trust: 3 }], image_url: "/_dev/a.jpg", image_credit: "Korea Herald", published_at: "2026-10-30T07:00:00Z", created_at: "2026-10-30T06:00:00Z" },
  { ...base, id: 7, category: "f1_teams", headline: "گۆڕانکاری لە یاسای تایەکان بۆ پێشبڕکێی داهاتوو ڕاگەیەنرا", card_headline: "Ferrari باس لە بەرنامەی گەشەپێدانی ئۆتۆمبێلی نوێ دەکات", body, key_points: ["تیزەری یەکەم بڵاوکرایەوە.", "پەخشی یەکەم: چوارشەممە ٢٥ی تشرینی دووەم.", "٩ی شەو لە کۆریا، ٣ی پاشنیوەڕۆ لە هەولێر."], source_name: "SBS Star", source_url: "https://sbsstar.net/x", sources: [{ name: "SBS Star", url: "https://sbsstar.net/x", trust: 3 }, { name: "Soompi", url: "https://soompi.com/x", trust: 2 }], image_url: "/_dev/b.jpg", image_credit: "SBS Star", published_at: "2026-10-30T06:00:00Z", created_at: "2026-10-30T05:00:00Z" },
  { ...base, id: 6, category: "f1_teams", headline: "Audi گرێبەستێکی نوێی بازرگانی لەگەڵ کۆمپانیایەکی تەکنەلۆژیا واژوو کرد", card_headline: "Formula 2 خولی کۆتایی وەرزەکەی لە Abu Dhabi دەبێت", body, key_points: ["ڕۆڵێکی سەرەکی وەردەگرێت."], source_name: "Soompi", source_url: "https://soompi.com/y", sources: [{ name: "Soompi", url: "https://soompi.com/y", trust: 2 }], image_url: null, image_credit: null, published_at: "2026-10-30T05:00:00Z", created_at: "2026-10-30T04:00:00Z" },
  { ...base, id: 5, category: "f1_tech", headline: "Andrea Kimi Antonelli بۆ یەکەم جار لە ژیانیدا دەبێتە پاڵەوانی جیهان", card_headline: "Mercedes پاڵەوانێتی تیمەکانی وەرزی ٢٠٢٦ بەدەست هێنا", body, key_points: ["هەواڵەکە لەلایەن بنەماڵەکەیەوە پشتڕاستکرایەوە."], source_name: "Yonhap News", source_url: "https://yna.co.kr/x", sources: [{ name: "Korea Herald", url: "https://koreaherald.com/y", trust: 3 }, { name: "Yonhap News", url: "https://yna.co.kr/x", trust: 3 }, { name: "Soompi", url: "https://soompi.com/z", trust: 2 }], image_url: "/_dev/c.jpg", image_credit: "Yonhap News", published_at: "2026-10-30T04:00:00Z", created_at: "2026-10-30T03:00:00Z", raw_items: { score_reason: "f1_tech · sensitive · death" } },
  {
    ...base, id: 9, category: "f1_race", kind: "chart", chart_week: "circle-digital-2026-43",
    headline: "گۆڕانکاری لە یاسای تایەکان بۆ پێشبڕکێی داهاتوو ڕاگەیەنرا", card_headline: "Ferrari باس لە بەرنامەی گەشەپێدانی ئۆتۆمبێلی نوێ دەکات", body,
    key_points: ["«NEON» بۆ هەفتەی دووەم یەکەمە.", "SOYEON بەرز بووەوە بۆ پلەی دووەم.", "IVE بە گۆرانییەکی نوێ هاتە ناو ١٠ی سەرەوە."],
    source_name: "Circle Chart", source_url: "https://circlechart.kr", sources: [{ name: "Circle Chart", url: "https://circlechart.kr", trust: 3 }],
    image_url: null, image_credit: null, published_at: "2026-10-30T08:00:00Z", created_at: "2026-10-30T08:00:00Z",
    chart_top: [
      { rank: 1, title: "NEON", artist: "A2O, A2O LITE", artist_ckb: "ئەی تو ئۆ", move: "same", change: 0 },
      { rank: 2, title: "Toesahalgeyeo (Narr. Gian84)", artist: "SOYEON", artist_ckb: "سۆیۆن", move: "up", change: 1 },
      { rank: 3, title: "Kkumkkudeon Eorireun Doeeotnayo?", artist: "Meomureu", artist_ckb: "مەمورو", move: "down", change: 1 },
      { rank: 4, title: "LOVE ATTACK", artist: "RESCENE", artist_ckb: "ڕیسین", move: "same", change: 0 },
      { rank: 5, title: "Deja Vu", artist: "RESCENE", artist_ckb: "ڕیسین", move: "up", change: 2 },
      { rank: 6, title: "REDRED", artist: "CORTIS", artist_ckb: "کۆرتیس", move: "down", change: 1 },
      { rank: 7, title: "Gapjagi", artist: "I.O.I", artist_ckb: "ئای ئۆ ئای", move: "down", change: 1 },
      { rank: 8, title: "BAD", artist: "ATEEZ", artist_ckb: "ئەیتیز", move: "up", change: 1 },
      { rank: 9, title: "Pretty Girl", artist: "RESCENE", artist_ckb: "ڕیسین", move: "down", change: 1 },
      { rank: 10, title: "Looks Can Kill", artist: "IVE", artist_ckb: "ئایڤ", move: "new", change: 0 },
    ],
  },
];

/* Local preview of the footer chart: names as Circle Chart writes them (week 43, 2026), Kurdish names sample wording. */
const chartRows: [string, string, number | null, string?, string?, string?, string?][] = [
  ["NEON", "A2O, A2O LITE", 1, "NEON", "", "A2O, A2O LITE", "ئەی تو ئۆ، ئەی تو ئۆ لایت"],
  ["퇴사할게여 (Narr. 기안84)", "소연 (SOYEON)", 3, "Toesahalgeyeo (Narr. Kian84)", "دەستلەکار دەکێشمەوە", "SOYEON", "سۆیۆن"],
  ["꿈꾸던 어른이 되었나요?", "머무르", 2, "Kkumkkudeon Eoreuni Doeeonnayo?", "ئەو گەورەیە بوویت کە خەونت پێوە دەبینی؟", "Meomureu", "مەمورو"],
  ["LOVE ATTACK", "RESCENE (리센느)", 4, "LOVE ATTACK", "", "RESCENE", "ڕیسین"],
  ["Deja Vu", "RESCENE (리센느)", 7, "Deja Vu", "", "RESCENE", "ڕیسین"],
  ["REDRED", "CORTIS (코르티스)", 5, "REDRED", "", "CORTIS", "کۆرتیس"],
  ["갑자기", "아이오아이 (I.O.I)", 6, "Gapjagi", "لەناکاو", "I.O.I", "ئای ئۆ ئای"],
  ["BAD", "ATEEZ (에이티즈)", 9, "BAD", "", "ATEEZ", "ئەیتیز"],
  ["Pretty Girl", "RESCENE (리센느)", 8, "Pretty Girl", "", "RESCENE", "ڕیسین"],
  ["Looks Can Kill", "IVE (아이브)", null, "Looks Can Kill", "", "IVE", "ئایڤ"],
  ["LEMONADE", "aespa", 10, "LEMONADE", "", "aespa", "ئێسپا"],
  ["노스탈지아", "BIG Naughty (서동현)", 13, "Noseutalji-a", "نۆستالجیا", "BIG Naughty", "بیگ نۆتی"],
  ["Drowning", "WOODZ (조승연)", 12, "Drowning", "", "WOODZ", "وودز"],
  ["사랑하게 될 거야", "한로로", 16, "Saranghage Doel Geoya", "خۆشت دەوێم", "Hanroro", "هانرۆرۆ"],
  ["CRASH", "ALLDAY PROJECT", 11, "CRASH", "", "ALLDAY PROJECT", "ئۆڵدەی پرۆجێکت"],
];
export const FIXTURE_CHART = {
  id: "circle-digital-2026-43",
  year: 2026,
  week: 43,
  period: "2026.10.18~2026.10.24",
  fetched_at: "2026-10-30T06:00:00Z",
  entries: Array.from({ length: 100 }, (_, i) => {
    const [title, artist, prev, title_latin, title_ckb, artist_latin, artist_ckb] = chartRows[i % chartRows.length];
    const rank = i + 1;
    const p = i < chartRows.length ? prev : i % 7 === 0 ? null : rank + ((i % 5) - 2);
    return {
      rank,
      prev: p,
      move: (!p ? "new" : p > rank ? "up" : p < rank ? "down" : "same") as "up" | "down" | "same" | "new",
      change: p ? Math.abs(p - rank) : 0,
      id: String(1000 + i),
      title,
      artist,
      cover: i % 4 === 3 ? null : `/_dev/${"abc"[i % 3]}.jpg`,
      title_latin,
      title_ckb: title_ckb || null,
      artist_latin,
      artist_ckb,
      youtube_id: i % 5 === 4 ? null : "M7lc1UVf-VE",
      spotify_id: i % 3 === 2 ? null : "4uLU6hMCjMI75M1A2tKUQC",
    };
  }),
};


/* Sample F1 data for local preview only. Shape matches Jolpica; apart from the leader the figures are not real. */
const SAMPLE_DRIVERS = [
  ["antonelli", "12", "ANT", "Andrea Kimi", "Antonelli", "Italian", "mercedes", "Mercedes", "380", "9"],
  ["russell", "63", "RUS", "George", "Russell", "British", "mercedes", "Mercedes", "311", "4"],
  ["norris", "1", "NOR", "Lando", "Norris", "British", "mclaren", "McLaren", "288", "3"],
  ["leclerc", "16", "LEC", "Charles", "Leclerc", "Monegasque", "ferrari", "Ferrari", "241", "2"],
  ["piastri", "81", "PIA", "Oscar", "Piastri", "Australian", "mclaren", "McLaren", "230", "1"],
  ["hamilton", "44", "HAM", "Lewis", "Hamilton", "British", "ferrari", "Ferrari", "199", "0"],
  ["max_verstappen", "3", "VER", "Max", "Verstappen", "Dutch", "red_bull", "Red Bull", "190", "0"],
  ["hulkenberg", "27", "HUL", "Nico", "Hülkenberg", "German", "audi", "Audi", "52", "0"],
] as const;
const sampleDriver = (d: (typeof SAMPLE_DRIVERS)[number]) => ({ driverId: d[0], permanentNumber: d[1], code: d[2], givenName: d[3], familyName: d[4], nationality: d[5], dateOfBirth: "2000-01-01" });
const sampleTeam = (d: (typeof SAMPLE_DRIVERS)[number]) => ({ constructorId: d[6], name: d[7], nationality: "German" });
const sampleResults = SAMPLE_DRIVERS.map((d, i) => ({ position: String(i + 1), positionText: String(i + 1), points: String([25, 18, 15, 12, 10, 8, 6, 4][i]), laps: "71", grid: String(i + 2), status: "Finished", Time: { time: i ? `+${i * 3}.214` : "1:32:04.112" }, Driver: sampleDriver(d), Constructor: sampleTeam(d) }));
const sampleRace = (round: number, raceName: string, country: string, locality: string, date: string, extra: object = {}) => ({
  season: "2026", round: String(round), raceName, date, time: "17:00:00Z",
  Circuit: { circuitName: `${locality} Circuit`, Location: { locality, country } },
  FirstPractice: { date, time: "11:30:00Z" }, Qualifying: { date, time: "15:00:00Z" }, ...extra,
});
const SAMPLE_RACES = [
  sampleRace(18, "United States Grand Prix", "USA", "Austin", "2026-10-25"),
  sampleRace(19, "Mexico City Grand Prix", "Mexico", "Mexico City", "2026-11-01"),
  sampleRace(20, "São Paulo Grand Prix", "Brazil", "São Paulo", "2026-12-08", { Sprint: { date: "2026-12-07", time: "14:00:00Z" } }),
  sampleRace(21, "Las Vegas Grand Prix", "USA", "Las Vegas", "2026-12-20"),
  sampleRace(22, "Qatar Grand Prix", "Qatar", "Lusail", "2026-12-27"),
  sampleRace(23, "Abu Dhabi Grand Prix", "UAE", "Abu Dhabi", "2027-01-03"),
];

export function F1_FIXTURE(path: string): Record<string, unknown> {
  if (path === "current.json") return { RaceTable: { Races: SAMPLE_RACES } };
  if (path === "current/driverStandings.json")
    return { StandingsTable: { StandingsLists: [{ season: "2026", round: "19", DriverStandings: SAMPLE_DRIVERS.map((d, i) => ({ position: String(i + 1), points: d[8], wins: d[9], Driver: sampleDriver(d), Constructors: [sampleTeam(d)] })) }] } };
  if (path === "current/constructorStandings.json")
    return { StandingsTable: { StandingsLists: [{ season: "2026", round: "19", ConstructorStandings: [["mercedes", "Mercedes", "691", "13"], ["mclaren", "McLaren", "518", "4"], ["ferrari", "Ferrari", "440", "2"], ["red_bull", "Red Bull", "230", "0"], ["audi", "Audi", "71", "0"]].map((t, i) => ({ position: String(i + 1), points: t[2], wins: t[3], Constructor: { constructorId: t[0], name: t[1] } })) }] } };
  if (path === "current/results/1.json")
    return { RaceTable: { Races: SAMPLE_RACES.slice(0, 2).map((r) => ({ ...r, Results: [sampleResults[0]] })) } };
  if (/^current\/\d+\/results/.test(path)) return { RaceTable: { Races: path.includes("/19/") || path.includes("/18/") ? [{ Results: sampleResults }] : [] } };
  if (/^current\/\d+\/qualifying/.test(path)) return { RaceTable: { Races: path.includes("/19/") ? [{ QualifyingResults: sampleResults.map((r) => ({ position: r.position, Driver: r.Driver, Constructor: r.Constructor, Q1: "1:17.402", Q2: "1:16.988", Q3: "1:16.514" })) }] : [] } };
  const driver = path.match(/drivers\/([^/.]+)/)?.[1];
  const row = SAMPLE_DRIVERS.find((d) => d[0] === driver);
  if (driver && path.endsWith("results.json")) return { RaceTable: { Races: row ? SAMPLE_RACES.slice(0, 2).map((r) => ({ ...r, Results: [sampleResults[0]] })) : [] } };
  if (driver && path.endsWith("driverStandings.json")) return { StandingsTable: { StandingsLists: row ? [{ season: "2026", DriverStandings: [{ position: "1", points: row[8], wins: row[9], Constructors: [sampleTeam(row)] }] }, { season: "2025", DriverStandings: [{ position: "7", points: "150", wins: "0", Constructors: [sampleTeam(row)] }] }] : [] } };
  if (driver) return { DriverTable: { Drivers: row ? [sampleDriver(row)] : [] } };
  const team = path.match(/constructors\/([^/.]+)/)?.[1];
  const teamRow = SAMPLE_DRIVERS.find((d) => d[6] === team);
  if (team && path.endsWith("constructorStandings.json")) return { StandingsTable: { StandingsLists: [{ season: "2026", ConstructorStandings: [{ position: "1", points: "691", wins: "13" }] }, { season: "2025", ConstructorStandings: [{ position: "2", points: "469", wins: "2" }] }] } };
  if (team) return { ConstructorTable: { Constructors: teamRow ? [sampleTeam(teamRow)] : [] } };
  return {};
}
