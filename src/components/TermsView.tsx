export default function TermsView() {
  return (
    <main className="legal" data-view="terms" hidden>
      <div className="legal-inner">
        <a className="back" href="#top">
          Back to home
        </a>
        <h1 tabIndex={-1}>Terms of Use</h1>
        <p className="updated">Last updated September 2026</p>

        <h2>Using this website</h2>
        <p>
          This website shares information about CONNECT and lets you join
          our waitlist. By using it, you agree to these terms.
        </p>

        <h2>The waitlist</h2>
        <p>
          Joining the waitlist lets us contact you with updates. It
          doesn&apos;t guarantee access to anything CONNECT launches, or
          access by a particular date.
        </p>

        <h2>Content on this site</h2>
        <p>
          The CONNECT name, logo, and the content on this site belong to
          CONNECT. Please don&apos;t reuse them without our permission.
        </p>

        <h2>Information on this site</h2>
        <p>Everything here describes work in progress and may change as CONNECT develops.</p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. The date at the top of this page shows
          when they last changed.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a className="js-contact" href="#">
            our contact address
          </a>
          .
        </p>
      </div>
    </main>
  );
}
