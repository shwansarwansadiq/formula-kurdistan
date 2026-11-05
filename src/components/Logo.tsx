/** Temporary placeholder until the Formula K logo is approved: a wheel inside the 21 rays. */
export const HAND = [
  "M250 90 A190 190 0 1 1 249 90",
  "M250 200 A80 80 0 1 1 249 200",
];
export const RAYS = Array.from({ length: 21 }, (_, i) => i);

/** The temporary mark with the 21-ray sun. `animated` draws it in once. */
export function Mark({ size = 34, animated = false, ink = "var(--plum)" }: { size?: number; animated?: boolean; ink?: string }) {
  return (
    <svg className={animated ? "mark mark-anim" : "mark"} viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true">
      <g transform="translate(-30.7 -11) scale(0.105)" fill="none" stroke={ink} strokeWidth="23" strokeLinecap="round" strokeLinejoin="round">
        {HAND.map((d, i) => (
          <path key={i} d={d} pathLength={1} className="mk-hand" style={{ ["--i" as string]: i }} />
        ))}
      </g>
      <g stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round">
        {RAYS.map((i) => (
          <g key={i} transform={`rotate(${((i * 360) / 21).toFixed(3)} -2.5 -30.5)`}>
            <line x1="-2.5" y1="-40" x2="-2.5" y2="-45.5" className="mk-ray" style={{ ["--i" as string]: i }} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Logo({ animated = false, size = 34 }: { animated?: boolean; size?: number }) {
  return (
    <span className="logo" dir="ltr">
      <Mark size={size} animated={animated} />
      <span className="wordmark">
        formula<span>k</span>
      </span>
    </span>
  );
}

/** The Kurdish sun: 21 rays around a disc, drawn large and cropped behind lead stories. */
export function Sun({ className = "", ray = "var(--gold)", core = "var(--gold)" }: { className?: string; ray?: string; core?: string }) {
  return (
    <svg className={`sun ${className}`} viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r="44" fill={core} className="sun-core" />
      <g stroke={ray} strokeWidth="9" strokeLinecap="round">
        {RAYS.map((i) => {
          const a = (i * 2 * Math.PI) / 21;
          return (
            <line
              key={i}
              className="sun-ray"
              style={{ ["--i" as string]: i }}
              x1={(Math.sin(a) * 58).toFixed(1)}
              y1={(-Math.cos(a) * 58).toFixed(1)}
              x2={(Math.sin(a) * 96).toFixed(1)}
              y2={(-Math.cos(a) * 96).toFixed(1)}
            />
          );
        })}
      </g>
    </svg>
  );
}
