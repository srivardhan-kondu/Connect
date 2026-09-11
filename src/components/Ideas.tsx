import { IDEAS } from "@/lib/content";
import { Leaf, Logo } from "./IconSprite";

export default function Ideas() {
  return (
    <section className="section ideas" id="ideas" aria-labelledby="ideas-title">
      <div className="wrap">
        <h2 className="h2" id="ideas-title">
          Built Around Four Simple Ideas
        </h2>
        <div className="quad">
          {IDEAS.map((idea) => (
            <article key={idea.title} className={`q q-${idea.tone}`}>
              <Leaf className={`c-${idea.tone}`} />
              <h3>{idea.title}</h3>
              <p>{idea.text}</p>
            </article>
          ))}
          <div className="quad-core" aria-hidden="true">
            <Logo />
          </div>
        </div>
      </div>
    </section>
  );
}
