import { POSSIBILITIES } from "@/lib/content";

export default function Ahead() {
  return (
    <section className="section ahead" id="ahead" aria-labelledby="ahead-title">
      <div className="wrap">
        <h2 className="h2" id="ahead-title">
          Imagine What&apos;s Possible
        </h2>
        <ul className="possibilities">
          {POSSIBILITIES.map((item, i) => (
            <li key={i}>
              <span className={`dot c-${item.tone}`} aria-hidden="true"></span>
              {item.text}
            </li>
          ))}
        </ul>
        <p className="beginning">This is only the beginning.</p>
      </div>
    </section>
  );
}
