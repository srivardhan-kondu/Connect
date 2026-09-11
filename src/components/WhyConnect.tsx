import { REASONS } from "@/lib/content";
import { Leaf } from "./IconSprite";

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
