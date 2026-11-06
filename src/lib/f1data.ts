/* Live F1 data from Jolpica, cached on the server so readers never hit the source directly.
   Every getter returns null or an empty list when the source can't be read; pages say so instead of guessing. */
import { unstable_cache } from "next/cache";
import { F1_FIXTURE, fixturesOn } from "./fixtures";
import {
  parseDriverSeason,
  parseDriverStandings,
  parseHistory,
  parseQualifying,
  parseResults,
  parseSchedule,
  parseSprint,
  parseTeamStandings,
  parseWinners,
  driverRef,
  teamRef,
  safeId,
} from "./f1parse";

const BASE = "https://api.jolpi.ca/ergast/f1";
const MIN = 60;
const HOUR = 3600;

async function pull(path: string): Promise<Record<string, unknown>> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}/${path}${sep}limit=100`, {
    headers: { "User-Agent": "FORMULAK/1.0 (+https://formulak.news)", Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Jolpica ${res.status} for ${path}`);
  return (await res.json()).MRData;
}

async function read(path: string, revalidate: number) {
  if (fixturesOn()) return F1_FIXTURE(path);
  try {
    return await unstable_cache(() => pull(path), ["jolpica", path], { revalidate, tags: ["f1"] })();
  } catch (e) {
    console.error("F1 data unavailable:", path, e);
    return null;
  }
}

export const getSchedule = async () => {
  const mr = await read("current.json", 6 * HOUR);
  return mr ? parseSchedule(mr) : [];
};
export const getDriverStandings = async () => {
  const mr = await read("current/driverStandings.json", 30 * MIN);
  return mr ? parseDriverStandings(mr) : null;
};
export const getTeamStandings = async () => {
  const mr = await read("current/constructorStandings.json", 30 * MIN);
  return mr ? parseTeamStandings(mr) : null;
};
export const getWinners = async () => {
  const mr = await read("current/results/1.json", 15 * MIN);
  return mr ? parseWinners(mr) : new Map();
};
export const getRaceResults = async (round: number) => {
  const mr = await read(`current/${round}/results.json`, 15 * MIN);
  return mr ? parseResults(mr) : [];
};
export const getQualifying = async (round: number) => {
  const mr = await read(`current/${round}/qualifying.json`, 15 * MIN);
  return mr ? parseQualifying(mr) : [];
};
export const getSprint = async (round: number) => {
  const mr = await read(`current/${round}/sprint.json`, 15 * MIN);
  return mr ? parseSprint(mr) : [];
};
export async function getDriver(id: string) {
  if (!safeId(id)) return null;
  const mr = await read(`drivers/${id}.json`, 24 * HOUR);
  const d = (mr as { DriverTable?: { Drivers?: Record<string, unknown>[] } } | null)?.DriverTable?.Drivers?.[0];
  return d ? driverRef(d) : null;
}
export async function getDriverSeason(id: string) {
  if (!safeId(id)) return [];
  const mr = await read(`current/drivers/${id}/results.json`, 30 * MIN);
  return mr ? parseDriverSeason(mr) : [];
}
export async function getDriverHistory(id: string) {
  if (!safeId(id)) return [];
  const mr = await read(`drivers/${id}/driverStandings.json`, 6 * HOUR);
  return mr ? parseHistory(mr, "driver") : [];
}
export async function getTeam(id: string) {
  if (!safeId(id)) return null;
  const mr = await read(`constructors/${id}.json`, 24 * HOUR);
  const c = (mr as { ConstructorTable?: { Constructors?: Record<string, unknown>[] } } | null)?.ConstructorTable?.Constructors?.[0];
  return c ? teamRef(c) : null;
}
export async function getTeamHistory(id: string) {
  if (!safeId(id)) return [];
  const mr = await read(`constructors/${id}/constructorStandings.json`, 6 * HOUR);
  return mr ? parseHistory(mr, "team") : [];
}
