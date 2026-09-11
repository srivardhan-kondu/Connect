import { Logo } from "./IconSprite";

const NAV_LINKS = [
  { href: "#vision", section: "vision", label: "Vision" },
  { href: "#ideas", section: "ideas", label: "Framework" },
  { href: "#why", section: "why", label: "Why CONNECT" },
  { href: "#impact", section: "impact", label: "Impact" },
  { href: "#ahead", section: "ahead", label: "Looking Ahead" },
];

export default function SiteHeader() {
  return (
    <>
      <header className="nav on-dark" id="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" aria-label="CONNECT home">
            <Logo />
            <span className="wordmark">CONNECT</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} data-section={link.section}>
                {link.label}
              </a>
            ))}
            <a
              className="btn btn-primary btn-sm nav-cta"
              href="#join"
              data-focus-form
            >
              Join the Waitlist
            </a>
          </nav>
          <button
            className="menu-btn"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-menu"
            aria-label="Open menu"
          >
            <span></span>
          </button>
        </div>
      </header>
      <div className="mobile-menu on-dark" id="mobile-menu" hidden>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <a className="btn btn-primary" href="#join" data-focus-form>
          Join the Waitlist
        </a>
      </div>
    </>
  );
}
