import { projects } from '../data.js'

export default function Projects() {
  return (
    <section className="section" id="projects">
      <h2 className="heading shimmer-title scroll-reveal">Projects</h2>
      <div className="project-grid">
        {projects.map((p, index) => (
          <article
            className="project scroll-reveal reveal-up"
            key={p.id}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            {/* Replace with a screenshot: <img src={p.image} alt="" /> */}
            <div className="thumb" aria-hidden="true">
              <span>{p.title.charAt(0)}</span>
            </div>
            <div className="project-body">
              <p className="project-type">{p.type}</p>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <ul className="chips small">
                {p.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <a href="#" className="btn ghost" onClick={(event) => event.preventDefault()}>
                View case study
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
