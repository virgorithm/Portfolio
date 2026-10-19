const steps = [
  {
    number: "01",
    title: "Discover & understand",
    description: "I start by understanding the project’s goals, user needs, and design requirements to create a clear direction.",
  },
  {
    number: "02",
    title: "Plan & wireframe",
    description: "I organize ideas, create user flows, and develop wireframes to build a clear and user-friendly structure.",
  },
  {
    number: "03",
    title: "Design & prototype",
    description: "I bring ideas to life using Figma, creating modern interfaces and interactive prototypes that focus on usability and visual appeal.",
  },
  {
    number: "04",
    title: "Refine & improve",
    description: "I improve my designs through feedback, refining details and ensuring consistency to create better user experiences.",
  },
];

export default function Skills() {
  return (
    <section className="skills-showcase section" id="skills" aria-labelledby="process-title">
      <div className="process-grid">
        <div className="process-intro scroll-reveal reveal-up">
          <p className="process-eyebrow">Working process</p>
          <h2 id="process-title">Turning ideas into meaningful digital experiences.</h2>
        </div>
        <aside className="process-tools scroll-reveal reveal-up" aria-labelledby="tools-title">
          <h3 id="tools-title">Tools I use:</h3>
          <ul>
            {["Figma", "Canva", "Mobbin"].map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </aside>
        {steps.map((step, index) => (
          <article
            className="process-step scroll-reveal reveal-up"
            key={step.number}
            style={{ "--process-delay": `${(index + 1) * 90}ms` }}
          >
            <span className="process-number" aria-hidden="true">{step.number}</span>
            <div className="process-copy">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
        <div className="process-contact scroll-reveal reveal-up">
          <a className="process-contact-link" href="#contact">
            Contact me <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
