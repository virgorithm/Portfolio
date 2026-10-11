import { contact } from '../data.js'

export default function Contact() {
  // Static for now: later, send this data to your database/API.
  const handleSubmit = (e) => e.preventDefault()

  return (
    <section className="section" id="contact">
      <h2 className="heading shimmer-title scroll-reveal">Contact</h2>
      <div className="contact">
        <div className="contact-info scroll-reveal reveal-left">
          <p>
            Have a project, an internship, or a question about my work? Send a message and I'll
            reply as soon as I can.
          </p>
          <dl className="facts">
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{contact.location}</dd>
            </div>
          </dl>
          <ul className="chips">
            {contact.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={(event) => event.preventDefault()}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form className="panel form scroll-reveal reveal-right" onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" required />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <label>
            Message
            <textarea name="message" rows="5" placeholder="How can I help?" required />
          </label>
          <button type="submit" className="btn solid">Send message</button>
        </form>
      </div>
    </section>
  )
}
