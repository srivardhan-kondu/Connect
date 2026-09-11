import { Logo } from "./IconSprite";

export default function Hero() {
  return (
    <section className="hero on-dark" id="top" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title" id="hero-title">
            <span className="t-strong">Connecting Communities.</span>
            <span className="t-light">Creating Opportunities.</span>
          </h1>
          <p className="hero-sub">
            A trusted digital ecosystem designed to bring communities closer,
            foster meaningful connections, and unlock new opportunities for
            collective growth.
          </p>
          <div className="hero-actions">
            <a
              className="btn btn-primary"
              href="#join"
              data-focus-form
              data-intent="waitlist"
            >
              Join the Waitlist
            </a>
            <a
              className="btn btn-ghost"
              href="#join"
              data-focus-form
              data-intent="early-member"
            >
              Become an Early Member
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-mark">
            <Logo />
          </div>
        </div>
      </div>
    </section>
  );
}
