import { describe, expect, it } from "vitest";
import { circuitNear } from "./circuits";
import { parseSchedule } from "./f1parse";
import { dueSessions, resultCaption, type ResultData } from "./result-cards";

const schedule = parseSchedule({
  RaceTable: {
    Races: [
      {
        season: "2026", round: "20", raceName: "São Paulo Grand Prix", date: "2026-11-08", time: "17:00:00Z",
        Circuit: { circuitName: "Interlagos", Location: { lat: "-23.7036", long: "-46.6997", locality: "São Paulo", country: "Brazil" } },
        Qualifying: { date: "2026-11-07", time: "18:00:00Z" },
        Sprint: { date: "2026-11-07", time: "14:00:00Z" },
      },
    ],
  },
});

describe("result cards", () => {
  it("waits 45 minutes after a session starts, then looks for three days", () => {
    expect(dueSessions(schedule, new Date("2026-11-07T18:30:00Z")).map((d) => d.session)).toEqual(["Sprint"]);
    expect(dueSessions(schedule, new Date("2026-11-07T19:00:00Z")).map((d) => d.session)).toEqual(["Qualifying", "Sprint"]);
    expect(dueSessions(schedule, new Date("2026-11-20T00:00:00Z"))).toEqual([]);
  });
  it("finds the circuit drawing from the race location", () => {
    expect(circuitNear(schedule[0].lat!, schedule[0].lng!)?.id).toBe("br-1940");
    expect(circuitNear(0, 0)).toBeNull();
  });
  it("copies positions and times into the caption", () => {
    const d: ResultData = {
      race: { name: "São Paulo Grand Prix", round: 20, season: "2026", circuit: "", locality: "", country: "Brazil", circuitId: null },
      session: "Race",
      sessionIso: "2026-11-08T17:00:00Z",
      podium: [
        { pos: "1", name: "A", given: "X", code: null, team: "T1", time: "1:30:00.1", photo: null, credit: "P (CC BY 4.0)" },
        { pos: "2", name: "B", given: "Y", code: null, team: "T2", time: "+1.234", photo: null, credit: null },
        { pos: "3", name: "C", given: "Z", code: null, team: "T3", time: "+5.678", photo: null, credit: null },
      ],
    };
    const c = resultCaption(d);
    expect(c).toContain("+1.234");
    expect(c).toContain("formulak.news/race/20");
    expect(c).toContain("P (CC BY 4.0)");
  });
});
