/* FORMULAK's brand for video: colours, fonts (self-hosted, so renders never depend on a font server), the mark and the sun. */
import "@fontsource/noto-kufi-arabic/500.css";
import "@fontsource/noto-kufi-arabic/700.css";
import "@fontsource/noto-kufi-arabic/800.css";
import "@fontsource/noto-kufi-arabic/900.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FORMULA_PATH, K_IN_WORD_PATH, K_PATH, LOGO_HEIGHT, LOGO_WIDTH } from "../../src/components/logo-paths";

export const C = {
  berry: "#E10600",
  berryDeep: "#B00500",
  plum: "#0A0A0A",
  blush: "#FFFFFF",
  gold: "#8A8A8A",
  lilac: "#171717",
  mist: "#F2F2F2",
  mint: "#3FA88E",
  blue: "#3A5BD9",
};
export const SORANI = '"Rabar", "Noto Kufi Arabic", sans-serif';
export const LATIN = '"Inter", sans-serif';
export const WORD = '"Baloo 2", "Inter", sans-serif';

export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

/** TikTok/Reels safe area on 1080×1920: the top bar, the right-hand buttons (like, comment, share)
    and the caption + username at the bottom cover these margins, so text and logos stay inside. */
export const SAFE = { top: 230, right: 180, bottom: 470, left: 64 };
export const safePad = `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`;

/** 0→1 over [from, from+len] with the brand's ease-out. */
export function useT(from: number, len: number) {
  const f = useCurrentFrame();
  return interpolate(f, [from, from + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
}

export function useSpring(from: number, damping = 14) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - from, fps, config: { damping, stiffness: 140, mass: 0.8 } });
}

const DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const ku = (n: number | string) => String(n).replace(/\d/g, (d) => DIGITS[Number(d)]);

/** Sorani text with Latin names kept whole and set in Inter (so "Park Bo Gum" never reverses). */
export function tokens(text: string): { t: string; latin: boolean }[] {
  const re = /«?[A-Za-z0-9][A-Za-z0-9.'’&:!?\-]*(?:\s+[A-Za-z0-9][A-Za-z0-9.'’&:!?\-]*)*»?/g;
  const out: { t: string; latin: boolean }[] = [];
  let last = 0;
  const push = (s: string) => s.split(/\s+/).filter(Boolean).forEach((w) => out.push({ t: w, latin: false }));
  for (const m of text.matchAll(re)) {
    if (!/[A-Za-z]/.test(m[0])) continue;
    push(text.slice(last, m.index));
    out.push({ t: m[0], latin: true });
    last = (m.index ?? 0) + m[0].length;
  }
  push(text.slice(last));
  return out;
}

/** The custom K, sliding in from `start`. `size` is its width. */
export function Mark({ size, start, ink = C.berry }: { size: number; start: number; ink?: string }) {
  const t = useT(start, 14);
  return (
    <svg viewBox="0 -700 1000 700" width={size} height={size * 0.7} style={{ opacity: t, transform: `translateX(${(t - 1) * 40}px)` }}>
      <path fillRule="evenodd" d={K_PATH} fill={ink} />
    </svg>
  );
}

/** Kept so existing compositions compile: FORMULAK uses no sun graphic. */
export function Sun(_: { size: number; grow?: number; turn?: number; ray?: string; core?: string; coreOpacity?: number }) {
  return null;
}

/** The FORMULAK wordmark. `size` is roughly the old type size; its height is 0.7 of that. */
export function Wordmark({ size }: { size: number }) {
  const h = size * 0.7;
  return (
    <svg viewBox={`0 -700 ${LOGO_WIDTH} ${LOGO_HEIGHT}`} height={h} width={(h * LOGO_WIDTH) / LOGO_HEIGHT} aria-label="FORMULAK">
      <path fillRule="evenodd" d={FORMULA_PATH} fill="#fff" />
      <path fillRule="evenodd" d={K_IN_WORD_PATH} fill={C.berry} />
    </svg>
  );
}

/** The closing card shared by every video: plum field opening from the centre, the mark drawing itself, the address. */
export function EndCard({ start }: { start: number }) {
  const f = useCurrentFrame();
  const open = interpolate(f, [start, start + 16], [0, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  const txt = useT(start + 34, 14);
  const pill = useSpring(start + 42);
  const sunGrow = useT(start + 6, 30);
  const word = useT(start + 26, 12);
  if (f < start) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.plum, clipPath: `circle(${open}% at 50% 50%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, padding: safePad }}>
      <div style={{ position: "absolute", width: 1600, height: 1600, left: -260, top: 160, opacity: 0.12 }}>
        <Sun size={1600} grow={sunGrow} turn={(f - start) * 0.25} core={C.berry} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} dir="ltr">
                <span style={{ opacity: word }}>
          <Wordmark size={140} />
        </span>
      </div>
      <div dir="rtl" style={{ opacity: txt, transform: `translateY(${(1 - txt) * 30}px)`, font: `800 58px/1.5 ${SORANI}`, color: "#fff", textAlign: "center" }}>
        هەواڵی کۆری بە کوردی
      </div>
      <div dir="ltr" style={{ transform: `scale(${pill})`, font: `800 64px/1 ${LATIN}`, background: "#fff", color: C.berryDeep, padding: "30px 54px", borderRadius: 999 }}>
        formulak.news
      </div>
    </div>
  );
}
