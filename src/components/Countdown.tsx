"use client";
import { useEffect, useState } from "react";
import { ku } from "@/lib/site";

const pad = (n: number) => String(n).padStart(2, "0");

/** Time left to a session. Rendered only on the client, because the server's clock would be stale in a cached page. */
export function Countdown({ iso }: { iso: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(iso).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [iso]);

  const s = Math.floor((left ?? 0) / 1000);
  const parts: [string, string][] = [
    [ku(Math.floor(s / 86400)), "ڕۆژ"],
    [ku(pad(Math.floor((s % 86400) / 3600))), "کاتژمێر"],
    [ku(pad(Math.floor((s % 3600) / 60))), "خولەک"],
    [ku(pad(s % 60)), "چرکە"],
  ];
  return (
    <div className="count" role="timer" aria-label="کاتی ماوە بۆ دەستپێکردن">
      {parts.map(([value, label]) => (
        <span key={label}>
          <b>{left === null ? "–" : value}</b>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}
