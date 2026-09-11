import { Leaf } from "./IconSprite";

const REASONS = [
  {
    tone: "blue",
    title: "Trust",
    text: "Built around transparency, authenticity, and meaningful interactions.",
  },
  {
    tone: "gold",
    title: "Opportunity",
    text: "Helping communities discover people, ideas, and possibilities.",
  },
  {
    tone: "green",
    title: "Inclusion",
    text: "Designed for diverse communities and future generations.",
  },
  {
    tone: "red",
    title: "Growth",
    text: "Empowering individuals, organizations, and communities to thrive together.",
  },
  {
    tone: "blue",
    title: "Collaboration",
    text: "Creating spaces where collective success becomes possible.",
  },
  {
    tone: "gold",
    title: "Impact",
    text: "Turning connections into meaningful outcomes.",
  },
] as const;

export default function WhyConnect() {
  return (
    <section className="section why" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <h2 className="h2" id="why-title">
          Communities Deserve Better Digital Experiences
        </h2>
        <div className="why-grid">
          {REASONS.map((reason, i) => (
            <article key={`${reason.title}-${i}`} className="why-card">
              <Leaf className={`c-${reason.tone}`} />
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
