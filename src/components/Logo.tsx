import { BRAND_RED, FORMULA_PATH, K_IN_WORD_PATH, K_PATH, LOGO_HEIGHT, LOGO_WIDTH } from "./logo-paths";

/** The custom K on its own.  is its width. */
export function Mark({ size = 34, ink = BRAND_RED }: { size?: number; animated?: boolean; ink?: string }) {
  return (
    <svg className="mark" viewBox="0 -700 1000 700" width={size} height={Math.round(size * 0.7)} aria-hidden="true">
      <path fillRule="evenodd" d={K_PATH} fill={ink} />
    </svg>
  );
}

/** The FORMULAK wordmark.  is its height; the word takes the current text colour, the K is red unless `k` says otherwise. */
export function Logo({ size = 24, k = BRAND_RED }: { animated?: boolean; size?: number; k?: string }) {
  return (
    <svg
      className="logo"
      viewBox={`0 -700 ${LOGO_WIDTH} ${LOGO_HEIGHT}`}
      height={size}
      width={Math.round((size * LOGO_WIDTH) / LOGO_HEIGHT)}
      role="img"
      aria-label="FORMULAK"
    >
      <path fillRule="evenodd" d={FORMULA_PATH} fill="currentColor" />
      <path fillRule="evenodd" d={K_IN_WORD_PATH} fill={k} />
    </svg>
  );
}
