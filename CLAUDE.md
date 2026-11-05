# Formula K · فۆرمولا کەی — project guide for Claude

Formula K is an automated Sorani Kurdish news site about Formula 1 first, then the wider formula racing world and
its industry. Owner: Shwan. The system finds news, writes it in Sorani, designs the posts, and waits; Shwan's only
job is to approve. **Nothing is ever published without his approval.**

It starts as a copy of the Kurean code (github.com/shwansarwansadiq/kurean, a separate site). **Never post to,
change or share keys with Kurean's repo, database, Meta app or TikTok app.** Kurean's CLAUDE.md explains the shared
machinery in depth: pipeline, social publishing, Meta limits, videos.

- Plan: https://claude.ai/artifact/DUMNUXYcp8YivV7xyUXHNE
- Domain: formulak.news (Namecheap, not pointed at Vercel yet). Repo: shwansarwansadiq/formula-kurdistan (public, for free video rendering).
- Supabase: organization FORMULA K, project `formulak`, ref `xvgfivlaohujxyggkbjo`, Europe.

## Status

| Phase | State |
| --- | --- |
| 1. Setup | Accounts in progress; logo, templates and glossary awaiting approval |
| 2. Engine (collector, scorer, writer, glossary) | Adapted for F1, not yet running |
| 3. Website and /admin | Copied with temporary look; needs the approved design |
| 4. Standings, calendar, next-session countdown, race result card, race-weekend mode | Not built |
| 5. Social + video | Copied, inactive until META_TOKEN, META_PAGE_ID and the TikTok keys are set |

## Differences from Kurean

- Categories: `f1_race`, `f1_teams`, `f1_tech`, `f1_business`, `other_series`.
- **Source photos are never used automatically** (`attachPhoto`): free Wikimedia photo of the same subject, otherwise a
  branded card. Source photos stay as options Shwan can pick by hand. `FORMULAK_AUTO_SOURCE_PHOTOS=1` reverses this.
  Recommended in the plan; Shwan has not yet confirmed.
- Never use race footage, broadcast screenshots, onboard clips, team radio or F1 audio.
- Results, positions, points and times are copied from the source, never worked out. Transfers are "reported" until confirmed.
- `META_PAGE_ID` has no default: posting is refused until it is set to Formula K's Page.
- Brand rule: no F1 logo, flying-F shape or circuit outlines; the footer carries the independent-site disclaimer.

## Temporary leftovers from Kurean

- The mark, wordmark and colours are placeholders until the logo is approved. Rabar isn't in the repo yet: Shwan must
  confirm web use is allowed and the regular and bold files must be chosen.
- Inactive and unscheduled: Korea chart (`chart.ts`, `chart-story.ts`, `listen.ts`, `KoreaChart`), scenery (`places.ts`,
  `scenery.ts`). Replace with standings and remove in phase 4. `video/src/Promo.tsx` and sample scenes still describe Korea: rewrite before rendering.
- Don't use Kurean's music names or copy in new work without checking them. /privacy and analytics text still needs a pass.

## Sources

Live: FIA press releases, Formula1.com (no dates in its feed), The Race, Autosport, RaceFans, Crash.net.
Paused until rechecked: Motorsport.com (looked stale), BBC Sport F1 and PlanetF1 (could not be read).
**Never work around a site's bot blocking.** If a feed blocks automated readers, pause it, ask the publisher, or replace it.

## Editorial rules (non-negotiable)

Write a new Sorani article from the facts; never translate sentence by sentence or copy paragraphs; at most one short
attributed quote; invent nothing; credit every source with a link; no rumours as facts; sensitive stories state only what
is confirmed and who confirmed it; glossary spellings are mandatory; names stay in Latin letters with Sorani in brackets
the first time; takedown requests are honoured immediately.

## Working conventions

- Run `npm test`, `npm run typecheck` and `npx next build` before pushing. Pushing to `main` deploys.
- Env vars live in Vercel and never in the repo, chat or committed SQL: see `.env.example`.
- Run `supabase/schema.sql`, the `migrate-*.sql` files in number order, `seed.sql`, then `cron.sql` (with the placeholders filled in the SQL editor only).
- Commit as Claude <noreply@anthropic.com>.
