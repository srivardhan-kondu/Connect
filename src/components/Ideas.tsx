import { Leaf, Logo } from "./IconSprite";

const IDEAS = [
  {
    tone: "gold",
    title: "Connect",
    text: "Create meaningful relationships and trusted networks.",
  },
  {
    tone: "green",
    title: "Collaborate",
    text: "Unlock opportunities through collective growth.",
  },
  {
    tone: "blue",
    title: "Engage",
    text: "Participate in events, conversations, and initiatives that matter.",
  },
  {
    tone: "red",
    title: "Expand",
    text: "Grow beyond geographical boundaries and create lasting impact.",
  },
] as const;

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
