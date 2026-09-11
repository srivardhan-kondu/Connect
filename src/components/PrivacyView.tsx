export default function PrivacyView() {
  return (
    <main className="legal" data-view="privacy" hidden>
      <div className="legal-inner">
        <a className="back" href="#top">
          Back to home
        </a>
        <h1 tabIndex={-1}>Privacy Policy</h1>
        <p className="updated">Last updated September 2026</p>

        <h2>What we collect</h2>
        <p>
          When you join the CONNECT waitlist, we collect your name, email
          address, country, and, if you choose to share it, the community or
          organization you&apos;re part of.
        </p>

        <h2>How we use it</h2>
        <p>
          We use these details to send you CONNECT updates, early access
          opportunities, and announcements, and to understand where interest
          in CONNECT is coming from.
        </p>

        <h2>What we don&apos;t do</h2>
        <p>
          We don&apos;t sell your information, and we don&apos;t share it
          with anyone for their own marketing.
        </p>

        <h2>The CONNECT Assistant</h2>
        <p>
          Messages you send to the chat assistant on this site are processed
          by our AI provider, Anthropic, to generate replies. We don&apos;t
          store your conversation on our servers. It stays in your browser
          tab until you close it. Please don&apos;t share personal or
          sensitive information in the chat.
        </p>

        <h2>How long we keep it</h2>
        <p>We keep your details until you unsubscribe or ask us to delete them.</p>

        <h2>Your choices</h2>
        <p>
          Every email we send includes a way to unsubscribe. To see, correct,
          or delete the information we hold about you, email us at{" "}
          <a className="js-contact" href="#">
            our contact address
          </a>
          .
        </p>

        <h2>Changes to this policy</h2>
        <p>If we change this policy, we&apos;ll update the date at the top of this page.</p>
      </div>
    </main>
  );
}
