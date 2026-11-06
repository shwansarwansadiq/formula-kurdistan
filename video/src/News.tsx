/* A news story as a 9:16 video (11 s), in the site's starting-grid world: photo on black, the headline parked in a painted
   slot, the key points in staggered slots, the logo closing. Text stays inside SAFE. */
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, EndCard, LATIN, SAFE, SlotMark, SORANI, tokens, useT, Wordmark } from "./brand";
import { K_PATH } from "../../src/components/logo-paths";

export type NewsProps = { headline: string; points: string[]; image: string | null; label: string; colour: string };

export const NEWS_FRAMES = 330;
const POINTS_AT = 150;
const END_AT = 268;
const MAST = 340; // black bar above the photo, holding the logo below TikTok's top bar
const PHOTO = 640;

const src = (image: string) => (/^https?:/.test(image) ? image : staticFile(image));
const latinStyle = { fontFamily: LATIN, fontWeight: 800, direction: "ltr", unicodeBidi: "isolate" } as const;

/** Long Sorani headlines step down so they always fit between the photo and TikTok's caption area. */
const headlineSize = (text: string) => (text.length > 90 ? 52 : text.length > 60 ? 60 : 72);
const pointSize = (points: string[]) => (points.join("").length > 240 ? 40 : 48);

function Headline({ text, start }: { text: string; start: number }) {
  const f = useCurrentFrame();
  const size = headlineSize(text);
  return (
    <h1 dir="rtl" style={{ margin: 0, font: `700 ${size}px/1.4 ${SORANI}`, color: "#fff", textWrap: "balance" }}>
      {tokens(text).map((w, i) => {
        const t = interpolate(f, [start + i * 3, start + i * 3 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ display: "inline-block", marginLeft: "0.28em", opacity: t, transform: `translateY(${(1 - t) * 18}px)`, ...(w.latin ? latinStyle : {}) }}>
            {w.t}
          </span>
        );
      })}
    </h1>
  );
}

/** One key point. Even rows sit a little to the left, as the second car of a pair sits behind the first. */
function Point({ text, index, start, size }: { text: string; index: number; start: number; size: number }) {
  const t = useT(start + 8, 12);
  return (
    <div dir="rtl" style={{ position: "relative", padding: "34px 30px 8px", marginRight: index % 2 ? 56 : 0, marginLeft: index % 2 ? 0 : 56 }}>
      <SlotMark start={start} ink={index === 0 ? C.berry : "#fff"} />
      <div style={{ opacity: t, transform: `translateY(${(1 - t) * 14}px)`, font: `700 ${size}px/1.5 ${SORANI}`, color: "#fff" }}>
        {tokens(text).map((w, i) => (
          <span key={i}>
            <span style={w.latin ? latinStyle : undefined}>{w.t}</span>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

export function News({ headline, points, image, label }: NewsProps) {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, POINTS_AT], [1.02, 1.09], { extrapolateRight: "clamp" });
  const reveal = useT(2, 18);
  const tag = useT(16, 10);
  // At POINTS_AT the black field rises over the photo, leaving the whole frame for the points.
  const rise = useT(POINTS_AT - 12, 14);
  const list = points.slice(0, 3);
  const size = pointSize(list);

  return (
    <AbsoluteFill style={{ background: C.plum, fontFamily: SORANI }}>
      <div style={{ position: "absolute", top: MAST, left: 0, right: 0, height: PHOTO, overflow: "hidden", clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}>
        {image ? (
          <Img src={src(image)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        ) : (
          <AbsoluteFill style={{ background: C.lilac, display: "grid", placeItems: "center" }}>
            <svg viewBox="0 -700 1000 700" width={520} height={364} aria-hidden="true">
              <path fillRule="evenodd" d={K_PATH} fill={C.berry} />
            </svg>
          </AbsoluteFill>
        )}
      </div>

      {/* Category, on the photo's lower edge */}
      <div dir="rtl" style={{ position: "absolute", top: MAST + PHOTO - 84, right: 64, background: C.berry, color: "#fff", font: `700 42px/1 ${SORANI}`, padding: "20px 30px 24px", opacity: tag * (1 - rise), transform: `translateX(${(1 - tag) * 40}px)` }}>
        {label}
      </div>

      {/* Headline in its slot */}
      {f < POINTS_AT ? (
        <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: MAST + PHOTO + 40, padding: "34px 30px 0" }}>
          <SlotMark start={20} />
          <Headline text={headline} start={28} />
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1920 - MAST, background: C.plum, transform: `translateY(${(1 - rise) * 100}%)` }} />

      {/* Key points */}
      {f >= POINTS_AT - 4 ? (
        <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: MAST + 10, bottom: SAFE.bottom, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
          {list.map((p, i) => (
            <Point key={i} text={p} index={i} start={POINTS_AT + i * 20} size={size} />
          ))}
        </div>
      ) : null}

      {/* Logo, above everything but the end card */}
      <div dir="ltr" style={{ position: "absolute", top: SAFE.top, left: SAFE.left, height: 70 }}>
        <Wordmark size={70} />
      </div>

      <EndCard start={END_AT} />
    </AbsoluteFill>
  );
}
