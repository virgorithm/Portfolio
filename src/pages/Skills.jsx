const skills = [
  {
    number: "01",
    title: "Interface Design",
    description: "Creating clear and easy-to-use screens.",
    items: ["UI design", "Wireframing", "Prototyping", "User flows"],
  },
  {
    number: "02",
    title: "Visual Design",
    description: "Making layouts feel balanced and consistent.",
    items: ["Typography", "Color combinations", "Visual hierarchy", "Spacing"],
  },
  {
    number: "03",
    title: "Collaboration",
    description: "Working with others to improve design ideas.",
    items: ["Teamwork", "Communication", "Receiving feedback", "Attention to detail"],
  },
  {
    number: "04",
    title: "Frontend Basics",
    description: "Turning design ideas into simple web pages.",
    items: ["HTML", "CSS", "React basics", "Responsive layouts"],
  },
];

export default function Skills() {
  return (
    <section className="skills-showcase section" id="skills">
      <h2 className="heading shimmer-title scroll-reveal">Skills</h2>

      <p className="skills-intro scroll-reveal reveal-up">
        The tools and strengths I use to design simple, thoughtful, and usable experiences.
      </p>

      <div className="skills-marquee scroll-reveal reveal-up">
        <div className="skills-track">
          <div className="skills-group">
            {skills.map((skill) => (
              <article className="skill-landscape-card" key={skill.number}>
                <span className="skill-no">{skill.number}</span>

                <h3>{skill.title}</h3>
                <p>{skill.description}</p>

                <ul className="skill-tags">
                  {skill.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* duplicate for seamless infinite rolling */}
          <div className="skills-group" aria-hidden="true">
            {skills.map((skill) => (
              <article className="skill-landscape-card" key={`copy-${skill.number}`}>
                <span className="skill-no">{skill.number}</span>

                <h3>{skill.title}</h3>
                <p>{skill.description}</p>

                <ul className="skill-tags">
                  {skill.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
