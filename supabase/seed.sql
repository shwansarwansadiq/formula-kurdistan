-- Starting sources (from the FORMULAK plan). Trust: 3 high, 2 medium.
insert into sources (name, feed_url, site_url, category_hint, trust) values
  ('FIA press releases', 'https://www.fia.com/rss/press-release', 'https://www.fia.com', 'mixed', 3),
  ('Formula1.com', 'https://www.formula1.com/en/latest/all.xml', 'https://www.formula1.com', 'mixed', 3),
  ('The Race', 'https://www.the-race.com/feed/', 'https://www.the-race.com', 'mixed', 3),
  ('Autosport', 'https://www.autosport.com/rss/feed/f1', 'https://www.autosport.com', 'mixed', 3),
  ('RaceFans', 'https://www.racefans.net/feed/', 'https://www.racefans.net', 'mixed', 3),
  ('Crash.net', 'https://www.crash.net/rss/f1', 'https://www.crash.net', 'mixed', 2),
  ('Motorsport.com', 'https://www.motorsport.com/rss/f1/news/', 'https://www.motorsport.com', 'mixed', 3),
  ('BBC Sport F1', 'https://feeds.bbci.co.uk/sport/formula1/rss.xml', 'https://www.bbc.com/sport/formula1', 'mixed', 3),
  ('PlanetF1', 'https://www.planetf1.com/feed', 'https://www.planetf1.com', 'mixed', 2)
on conflict (feed_url) do nothing;

-- Not confirmed working on 6 Nov 2026: paused until rechecked. Never work around a block.
update sources set active = false where name in ('Motorsport.com', 'BBC Sport F1', 'PlanetF1');

-- First 30 glossary terms: a draft for Shwan's review (from the plan)
insert into glossary (english, sorani, note) values
  ('Formula 1', 'فۆڕمولا ١', 'Latin F1 is also fine'),
  ('Grand Prix', 'گراند پری', null),
  ('race', 'پێشبڕکێ', null),
  ('driver', 'شۆفێر', null),
  ('team', 'تیم', null),
  ('team principal', 'بەڕێوەبەری تیم', null),
  ('season', 'وەرز', null),
  ('drivers'' championship', 'پاڵەوانێتی شۆفێران', null),
  ('constructors'' championship', 'پاڵەوانێتی تیمەکان', null),
  ('standings', 'ڕیزبەندی', null),
  ('practice', 'مەشق', null),
  ('qualifying', 'خولی هەڵبژاردن', null),
  ('sprint', 'سپرینت', 'Loanword'),
  ('pole position', 'پۆڵ پۆزیشن', 'Loanword; explain on first use'),
  ('grid', 'هێڵی دەستپێک', null),
  ('lap', 'خول', null),
  ('fastest lap', 'خێراترین خول', null),
  ('overtake', 'تێپەڕاندن', null),
  ('pit stop', 'پیت ستۆپ', 'Loanword'),
  ('tyre', 'تایە', null),
  ('podium', 'سەکۆی سەرکەوتن', null),
  ('safety car', 'ئۆتۆمبێلی سەلامەتی', null),
  ('red flag', 'ئاڵای سوور', null),
  ('penalty', 'سزا', null),
  ('stewards', 'لیژنەی دادوەری', null),
  ('retired from the race (DNF)', 'دەرچوون لە پێشبڕکێ', null),
  ('circuit', 'بازنەی پێشبڕکێ', null),
  ('engine', 'بزوێنەر', null),
  ('contract', 'گرێبەست', null),
  ('budget cap', 'سنووری بودجە', null)
on conflict (english) do update set sorani = excluded.sorani, note = excluded.note, updated_at = now();
