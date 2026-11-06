import { describe, expect, it } from "vitest";
import { fullName, lastRace, matches, nextSession, parseDriverStandings, parseHistory, parseResults, parseSchedule, parseWinners, safeId } from "./f1parse";

const race = (round: number, date: string, extra: object = {}) => ({
  season: "2026",
  round: String(round),
  raceName: `Race ${round}`,
  date,
  time: "13:00:00Z",
  Circuit: { circuitName: "Circuit", Location: { locality: "Town", country: "Land" } },
  ...extra,
});

describe("schedule", () => {
  const schedule = parseSchedule({
    RaceTable: {
      Races: [
        race(2, "2026-11-08", { Qualifying: { date: "2026-11-07", time: "18:00:00Z" }, FirstPractice: { date: "2026-11-06", time: "14:30:00Z" } }),
        race(1, "2026-11-01"),
        { round: "x" },
      ],
    },
  });
  it("sorts rounds, drops broken entries, orders sessions by time", () => {
    expect(schedule.map((r) => r.round)).toEqual([1, 2]);
    expect(schedule[1].sessions.map((s) => s.key)).toEqual(["FirstPractice", "Qualifying", "Race"]);
  });
  it("finds the next session and last race", () => {
    const now = new Date("2026-11-06T20:00:00Z");
    expect(nextSession(schedule, now)?.session.key).toBe("Qualifying");
    expect(lastRace(schedule, now)?.round).toBe(1);
    expect(nextSession(schedule, new Date("2027-01-01T00:00:00Z"))).toBeNull();
  });
});

describe("copied figures", () => {
  it("keeps standings as the source gives them", () => {
    const s = parseDriverStandings({
      StandingsTable: {
        StandingsLists: [
          {
            season: "2026",
            round: "19",
            DriverStandings: [
              {
                position: "1",
                points: "380",
                wins: "9",
                Driver: { driverId: "antonelli", permanentNumber: "12", code: "ANT", givenName: "Andrea Kimi", familyName: "Antonelli" },
                Constructors: [{ constructorId: "mercedes", name: "Mercedes" }],
              },
            ],
          },
        ],
      },
    });
    expect(s?.rows[0]).toMatchObject({ position: "1", points: "380", wins: "9" });
    expect(fullName(s!.rows[0].driver)).toBe("Andrea Kimi Antonelli");
  });
  it("returns nothing rather than guessing when lists are empty", () => {
    expect(parseDriverStandings({ StandingsTable: { StandingsLists: [] } })).toBeNull();
    expect(parseResults({ RaceTable: { Races: [] } })).toEqual([]);
    expect(parseWinners({}).size).toBe(0);
  });
  it("orders history newest first", () => {
    const h = parseHistory(
      { StandingsTable: { StandingsLists: [{ season: "2025", DriverStandings: [{ position: "2", points: "9", wins: "0", Constructors: [{ name: "A" }, { name: "B" }] }] }, { season: "2026", DriverStandings: [{ position: "1", points: "10", wins: "1" }] }] } },
      "driver",
    );
    expect(h.map((r) => r.season)).toEqual(["2026", "2025"]);
    expect(h[1].team).toBe("B");
  });
});

describe("input safety", () => {
  it("only accepts plain ids", () => {
    expect(safeId("max_verstappen")).toBe(true);
    expect(safeId("../drivers")).toBe(false);
    expect(safeId("a?limit=1")).toBe(false);
  });
  it("search folds accents and case", () => {
    expect(matches("perez", "Sergio Pérez")).toBe(true);
    expect(matches("  ", "x")).toBe(false);
  });
});
