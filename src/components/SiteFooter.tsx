import { Logo } from "./IconSprite";

export default function SiteFooter() {
  return (
    <footer className="footer on-dark">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top" aria-label="CONNECT home">
              <Logo />
              <span className="wordmark">CONNECT</span>
            </a>
            <p>CONNECT is building the future of community connection.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#why">About</a>
            <a href="#/privacy">Privacy Policy</a>
            <a href="#vision">Vision</a>
            <a href="#/terms">Terms</a>
            <a href="#impact">Community</a>
            <a id="linkedin-link" href="#" target="_blank" rel="noopener">
              LinkedIn
            </a>
            <a className="js-contact" href="#">
              Contact
            </a>
          </nav>
        </div>
        <p className="footer-bottom">
          &copy; <span id="year">2026</span> CONNECT. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
