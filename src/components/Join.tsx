import { COUNTRIES } from "@/lib/countries";
import { Logo } from "./IconSprite";

export default function Join() {
  return (
    <section className="section join on-dark" id="join" aria-labelledby="join-title">
      <div className="wrap join-grid">
        <div className="join-copy">
          <h2 className="h2" id="join-title">
            Be Part of the Journey
          </h2>
          <p className="lead">We&apos;re building something meaningful.</p>
          <p>
            Join the waitlist to receive updates, early access opportunities,
            and future announcements.
          </p>
        </div>

        <div className="form-card">
          <form id="waitlist-form" noValidate>
            <input type="hidden" name="intent" defaultValue="waitlist" />
            <div className="field">
              <label htmlFor="f-name">Name</label>
              <input
                className="input"
                id="f-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-describedby="e-name"
              />
              <p className="error-msg" id="e-name" hidden></p>
            </div>
            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input
                className="input"
                id="f-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                required
                aria-describedby="e-email"
              />
              <p className="error-msg" id="e-email" hidden></p>
            </div>
            <div className="field">
              <label htmlFor="f-org">
                Community / Organization <span className="opt">(optional)</span>
              </label>
              <input
                className="input"
                id="f-org"
                name="organization"
                type="text"
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <label htmlFor="f-country">Country</label>
              <select
                className="input"
                id="f-country"
                name="country"
                autoComplete="country-name"
                required
                aria-describedby="e-country"
                defaultValue=""
              >
                <option value="" disabled>
                  Select your country
                </option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <p className="error-msg" id="e-country" hidden></p>
            </div>
            <button className="btn btn-primary" type="submit" id="submit-btn">
              Join CONNECT
            </button>
            <p className="form-alert" id="form-alert" role="alert" hidden></p>
            <p className="form-note">
              We&apos;ll only use your details to send CONNECT updates. Read
              our <a href="#/privacy">privacy policy</a>.
            </p>
          </form>

          <div className="success" id="success" hidden tabIndex={-1}>
            <Logo className="success-mark" />
            <h3 id="success-title">You&apos;ve joined CONNECT.</h3>
            <p id="success-text">
              We&apos;ll send updates and early access news to your inbox.
            </p>
            <button className="btn btn-outline" type="button" id="share-btn">
              Share CONNECT
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
