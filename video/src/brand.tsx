/* FORMULAK's brand for video: colours, Rabar and Archivo (self-hosted, so renders never depend on a font server), the mark. */
import { continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
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
export const SORANI = '"Rabar", sans-serif';
export const LATIN = '"Archivo", sans-serif';
export const WORD = LATIN;

// Every frame waits for the fonts, so no video ever renders in a fallback face.
if (typeof document !== "undefined") {
  const wait = delayRender("Loading FORMULAK fonts");
  const faces = [
    new FontFace("Rabar", `url(${staticFile("fonts/Rabar-Regular.woff2")})`, { weight: "400" }),
    new FontFace("Rabar", `url(${staticFile("fonts/Rabar-Bold.woff2")})`, { weight: "700" }),
    new FontFace("Archivo", `url(${staticFile("fonts/Archivo-Latin.woff2")})`, { weight: "100 900", stretch: "62% 125%" }),
    new FontFace("Archivo", `url(${staticFile("fonts/Archivo-LatinExt.woff2")})`, { weight: "100 900", stretch: "62% 125%", unicodeRange: "U+0100-02BA, U+1E00-1EFF" }),
  ];
  Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l)))).then(() => continueRender(wait));
}

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

/** The painted grid slot from the site: a bar across the front and two ticks running back, drawn from the right. */
export function SlotMark({ start, ink = "#fff", tick = 44, weight = 8 }: { start: number; ink?: string; tick?: number; weight?: number }) {
  const bar = useT(start, 14);
  const ticks = useT(start + 8, 10);
  const piece = { position: "absolute", background: ink, top: 0 } as const;
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ ...piece, left: 0, right: 0, height: weight, transform: `scaleX(${bar})`, transformOrigin: "right" }} />
      <div style={{ ...piece, right: 0, width: weight, height: tick, transform: `scaleY(${ticks})`, transformOrigin: "top" }} />
      <div style={{ ...piece, left: 0, width: weight, height: tick, transform: `scaleY(${ticks})`, transformOrigin: "top" }} />
    </div>
  );
}

/** The closing card shared by every video: black wipes in from the right, the logo parks in its slot, the address follows. */
export function EndCard({ start }: { start: number }) {
  const f = useCurrentFrame();
  const open = useT(start, 14);
  const word = useT(start + 16, 14);
  const line = useT(start + 26, 12);
  if (f < start) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.plum, clipPath: `inset(0 0 0 ${(1 - open) * 100}%)`, padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ position: "relative", padding: "60px 44px 44px" }}>
        <SlotMark start={start + 8} ink={C.berry} tick={90} weight={12} />
        <div dir="ltr" style={{ opacity: word, transform: `translateY(${(1 - word) * -36}px)` }}>
          <Wordmark size={103} />
        </div>
      </div>
      <div dir="rtl" style={{ opacity: line, transform: `translateY(${(1 - line) * 24}px)`, marginTop: 44, font: `700 58px/1.5 ${SORANI}`, color: "#fff" }}>
        هەواڵی فۆڕمولا ١ بە کوردی
      </div>
      <div dir="ltr" style={{ opacity: line, marginTop: 18, textAlign: "right", font: `800 58px/1.2 ${LATIN}`, fontStretch: "112%", color: "#fff" }}>
        formulak.news
      </div>
    </div>
  );
}
