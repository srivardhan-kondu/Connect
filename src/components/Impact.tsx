import { Leaf } from "./IconSprite";

const CLAIMS = [
  { tone: "gold", text: "They create businesses." },
  { tone: "green", text: "They support families." },
  { tone: "blue", text: "They nurture talent." },
  { tone: "red", text: "They preserve culture." },
  { tone: "gold", text: "They inspire change." },
] as const;

export default function Impact() {
  return (
    <section
      className="section impact on-dark"
      id="impact"
      aria-labelledby="impact-title"
    >
      <div className="wrap impact-grid">
        <div className="impact-intro">
          <h2 className="h2" id="impact-title">
            Designed for <span className="nowrap">Real-World</span> Impact
          </h2>
          <p className="lead">Communities are more than conversations.</p>
        </div>
        <div>
          <ul className="they">
            {CLAIMS.map((claim, i) => (
              <li key={i}>
                <Leaf className={`c-${claim.tone}`} />
                {claim.text}
              </li>
            ))}
          </ul>
          <p className="impact-close">
            CONNECT is being designed to strengthen the ecosystems that
            communities depend on every day.
          </p>
        </div>
      </div>
    </section>
  );
}
