import { Logo } from "./IconSprite";

export default function Hero() {
  return (
    <section className="hero on-dark" id="top" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          {/*
            Three parallel clauses, one per line — the rhythm only reads if
            they break consistently, so each is its own block-level span
            rather than relying on where the text happens to wrap.
          */}
          <h1 className="hero-title" id="hero-title">
            <span className="t-strong">Connect People.</span>
            <span className="t-strong">Create Opportunities.</span>
            <span className="t-strong">Grow Communities.</span>
          </h1>
          <p className="hero-sub">
            CONNECT is a trusted digital ecosystem where professionals,
            students, organizations, entrepreneurs, and communities come
            together to build relationships, collaborate, and create
            meaningful impact.
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
            {/*
              Unlike the CTA it replaces ("Become an Early Member"), this is
              not a sign-up action — it sends people to the framework section
              rather than the form, so it carries no waitlist intent.
            */}
            <a className="btn btn-ghost" href="#ideas">
              See How It Works
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
