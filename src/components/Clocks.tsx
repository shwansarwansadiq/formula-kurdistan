"use client";
import { useEffect, useState } from "react";

const fmt = (tz: string, d: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);

/** Hawler time. The next-session countdown joins it in the standings phase. */
export function Clocks() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="clocks">
      <div className="clock hawler">
        <small>ئێستا لە هەولێر</small>
        <b suppressHydrationWarning>{now ? fmt("Asia/Baghdad", now) : "--:--"}</b>
      </div>
    </div>
  );
}
