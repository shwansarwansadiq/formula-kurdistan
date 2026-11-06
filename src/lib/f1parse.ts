/* Parses Jolpica (Ergast-format) responses. Every position, point and win is copied from the source, never worked out. */

export type SessionKey = "FirstPractice" | "SecondPractice" | "ThirdPractice" | "SprintQualifying" | "Sprint" | "Qualifying" | "Race";
export type Session = { key: SessionKey; iso: string };

export type Race = {
  season: string;
  round: number;
  name: string;
  circuit: string;
  locality: string;
  country: string;
  lat: number | null;
  lng: number | null;
  raceIso: string;
  sessions: Session[];
};

export type DriverRef = {
  id: string;
  number: string | null;
  code: string | null;
  given: string;
  family: string;
  birth: string | null;
  nationality: string | null;
  wiki: string | null;
};
export type TeamRef = { id: string; name: string; nationality: string | null };

export type DriverStanding = { position: string; points: string; wins: string; driver: DriverRef; teams: TeamRef[] };
export type TeamStanding = { position: string; points: string; wins: string; team: TeamRef };
export type Standings<T> = { season: string; round: string; rows: T[] };

export type ResultRow = {
  position: string;
  positionText: string;
  points: string;
  laps: string | null;
  status: string | null;
  time: string | null;
  grid: string | null;
  driver: DriverRef;
  team: TeamRef;
};
export type QualiRow = { position: string; driver: DriverRef; team: TeamRef; q1: string | null; q2: string | null; q3: string | null };
export type SeasonRow = { season: string; position: string; points: string; wins: string; team: string | null };
export type DriverRaceRow = { round: number; race: string; position: string; positionText: string; points: string; team: string };

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- third-party response, read defensively

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

function iso(date: unknown, time: unknown): string | null {
  const d = str(date);
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = str(time) ?? "00:00:00Z";
  const when = new Date(`${d}T${t}`);
  return Number.isNaN(when.getTime()) ? null : when.toISOString();
}

export function driverRef(d: Json | undefined): DriverRef {
  return {
    id: String(d?.driverId ?? ""),
    number: str(d?.permanentNumber),
    code: str(d?.code),
    given: String(d?.givenName ?? ""),
    family: String(d?.familyName ?? ""),
    birth: str(d?.dateOfBirth),
    nationality: str(d?.nationality),
    wiki: str(d?.url),
  };
}

export function teamRef(c: Json | undefined): TeamRef {
  return { id: String(c?.constructorId ?? ""), name: String(c?.name ?? ""), nationality: str(c?.nationality) };
}

const SESSION_KEYS: Exclude<SessionKey, "Race">[] = ["FirstPractice", "SecondPractice", "ThirdPractice", "SprintQualifying", "Sprint", "Qualifying"];

export function parseRace(r: Json): Race | null {
  const raceIso = iso(r?.date, r?.time);
  const round = Number(r?.round);
  if (!raceIso || !Number.isInteger(round)) return null;
  const sessions: Session[] = [];
  for (const key of SESSION_KEYS) {
    const when = iso(r?.[key]?.date, r?.[key]?.time);
    if (when) sessions.push({ key, iso: when });
  }
  sessions.push({ key: "Race", iso: raceIso });
  sessions.sort((a, b) => a.iso.localeCompare(b.iso));
  return {
    season: String(r?.season ?? ""),
    round,
    name: String(r?.raceName ?? ""),
    circuit: String(r?.Circuit?.circuitName ?? ""),
    locality: String(r?.Circuit?.Location?.locality ?? ""),
    country: String(r?.Circuit?.Location?.country ?? ""),
    lat: Number.isFinite(Number(r?.Circuit?.Location?.lat)) && r?.Circuit?.Location?.lat !== undefined ? Number(r.Circuit.Location.lat) : null,
    lng: Number.isFinite(Number(r?.Circuit?.Location?.long)) && r?.Circuit?.Location?.long !== undefined ? Number(r.Circuit.Location.long) : null,
    raceIso,
    sessions,
  };
}

const races = (mr: Json): Json[] => (Array.isArray(mr?.RaceTable?.Races) ? mr.RaceTable.Races : []);

export function parseSchedule(mr: Json): Race[] {
  return races(mr).map(parseRace).filter((r): r is Race => r !== null).sort((a, b) => a.round - b.round);
}

function list(mr: Json): Json | null {
  return mr?.StandingsTable?.StandingsLists?.[0] ?? null;
}

export function parseDriverStandings(mr: Json): Standings<DriverStanding> | null {
  const l = list(mr);
  if (!l) return null;
  return {
    season: String(l.season ?? ""),
    round: String(l.round ?? ""),
    rows: (l.DriverStandings ?? []).map((s: Json) => ({
      position: String(s.position ?? s.positionText ?? "-"),
      points: String(s.points ?? "0"),
      wins: String(s.wins ?? "0"),
      driver: driverRef(s.Driver),
      teams: (s.Constructors ?? []).map(teamRef),
    })),
  };
}

export function parseTeamStandings(mr: Json): Standings<TeamStanding> | null {
  const l = list(mr);
  if (!l) return null;
  return {
    season: String(l.season ?? ""),
    round: String(l.round ?? ""),
    rows: (l.ConstructorStandings ?? []).map((s: Json) => ({
      position: String(s.position ?? s.positionText ?? "-"),
      points: String(s.points ?? "0"),
      wins: String(s.wins ?? "0"),
      team: teamRef(s.Constructor),
    })),
  };
}

function resultRow(r: Json): ResultRow {
  return {
    position: String(r.position ?? ""),
    positionText: String(r.positionText ?? r.position ?? ""),
    points: String(r.points ?? "0"),
    laps: str(r.laps),
    status: str(r.status),
    time: str(r.Time?.time),
    grid: str(r.grid),
    driver: driverRef(r.Driver),
    team: teamRef(r.Constructor),
  };
}

export const parseResults = (mr: Json): ResultRow[] => (races(mr)[0]?.Results ?? []).map(resultRow);
export const parseSprint = (mr: Json): ResultRow[] => (races(mr)[0]?.SprintResults ?? []).map(resultRow);

export function parseQualifying(mr: Json): QualiRow[] {
  return (races(mr)[0]?.QualifyingResults ?? []).map((r: Json) => ({
    position: String(r.position ?? ""),
    driver: driverRef(r.Driver),
    team: teamRef(r.Constructor),
    q1: str(r.Q1),
    q2: str(r.Q2),
    q3: str(r.Q3),
  }));
}

/** The winner of each round as the source lists it, keyed by round (from /current/results/1). */
export function parseWinners(mr: Json): Map<number, ResultRow> {
  const out = new Map<number, ResultRow>();
  for (const r of races(mr)) {
    const first = r.Results?.[0];
    if (first) out.set(Number(r.round), resultRow(first));
  }
  return out;
}

export function parseDriverSeason(mr: Json): DriverRaceRow[] {
  return races(mr)
    .filter((r) => r.Results?.[0])
    .map((r) => ({
      round: Number(r.round),
      race: String(r.raceName ?? ""),
      position: String(r.Results[0].position ?? ""),
      positionText: String(r.Results[0].positionText ?? ""),
      points: String(r.Results[0].points ?? "0"),
      team: String(r.Results[0].Constructor?.name ?? ""),
    }))
    .sort((a, b) => a.round - b.round);
}

/** Season-by-season record, newest first, exactly as the source lists each season's final or current table. */
export function parseHistory(mr: Json, kind: "driver" | "team"): SeasonRow[] {
  const lists: Json[] = mr?.StandingsTable?.StandingsLists ?? [];
  const rows: SeasonRow[] = [];
  for (const l of lists) {
    const s = kind === "driver" ? l.DriverStandings?.[0] : l.ConstructorStandings?.[0];
    if (!s) continue;
    rows.push({
      season: String(l.season ?? ""),
      position: String(s.position ?? s.positionText ?? "-"),
      points: String(s.points ?? "0"),
      wins: String(s.wins ?? "0"),
      team: kind === "driver" ? str(s.Constructors?.[(s.Constructors?.length ?? 1) - 1]?.name) : null,
    });
  }
  return rows.sort((a, b) => b.season.localeCompare(a.season));
}

/** The next session that has not started, across the whole calendar. */
export function nextSession(schedule: Race[], now: Date): { race: Race; session: Session } | null {
  const t = now.toISOString();
  for (const race of schedule) {
    const session = race.sessions.find((s) => s.iso > t);
    if (session) return { race, session };
  }
  return null;
}

/** The most recent race that has started. */
export function lastRace(schedule: Race[], now: Date): Race | null {
  const t = now.toISOString();
  return [...schedule].reverse().find((r) => r.raceIso <= t) ?? null;
}

export const safeId = (id: string) => /^[a-z0-9_-]{1,64}$/.test(id);

export const fullName = (d: Pick<DriverRef, "given" | "family">) => `${d.given} ${d.family}`.trim();

/** Case and accent insensitive match for global search. */
export function matches(q: string, ...fields: (string | null | undefined)[]): boolean {
  const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const needle = fold(q.trim());
  return needle.length > 0 && fields.some((f) => f && fold(f).includes(needle));
}
