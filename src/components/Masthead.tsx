import Link from "next/link";
import { Logo } from "./Logo";

export type Section = "news" | "standings" | "calendar" | "drivers" | "teams" | "search";

const NAV: { key: Section; href: string; label: string }[] = [
  { key: "news", href: "/", label: "هەواڵ" },
  { key: "standings", href: "/standings", label: "ڕیزبەندی" },
  { key: "calendar", href: "/calendar", label: "ڕۆژژمێر" },
  { key: "drivers", href: "/drivers", label: "شۆفێران" },
  { key: "teams", href: "/teams", label: "تیمەکان" },
];

export function Masthead({ active }: { active?: Section }) {
  return (
    <header className="mast">
      <div className="mast-in">
        <Link href="/" className="mast-home" aria-label="فۆڕمولا کەی، سەرەتا">
          <Logo size={22} />
        </Link>
        <nav className="mast-nav" aria-label="بەشەکان">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} className={active === n.key ? "on" : undefined} aria-current={active === n.key ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/search" className={active === "search" ? "mast-search on" : "mast-search"} aria-label="گەڕان">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5.5 5.5" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
